"""
Image moderation service using AWS Rekognition.
Validates user-uploaded photos for inappropriate content.

CRITICAL: Uses FAIL-CLOSED pattern - ANY error results in image rejection.
Supports test mode for CI/CD environments without AWS credentials.
"""
import logging
import io
import sys
from typing import Tuple, Dict
import boto3
from django.conf import settings
from PIL import Image

logger = logging.getLogger(__name__)


def is_test_mode() -> bool:
    """Check if running in test mode (pytest, manage.py test, etc)."""
    return (
        'pytest' in sys.modules or
        'test' in sys.argv or
        getattr(settings, 'TESTING', False)
    )


class ImageModerationService:
    """
    Service for image moderation using AWS Rekognition.
    Detects: nudity, explicit content, violence, weapons.

    SECURITY: Implements fail-closed pattern - errors result in rejection.
    """

    def __init__(self):
        """Initialize AWS Rekognition client with fail-closed pattern."""
        self.enabled = False
        self.client = None
        self.service_enabled = False

        try:
            # CRITICAL: Check if AWS credentials are configured (REQUIRED)
            aws_access_key = getattr(settings, 'AWS_ACCESS_KEY_ID', None)
            aws_secret_key = getattr(settings, 'AWS_SECRET_ACCESS_KEY', None)

            if not aws_access_key or not aws_secret_key:
                logger.critical(
                    '[IMAGE_MODERATION] AWS credentials not configured - moderation DISABLED')
                return

            # Initialize Rekognition client
            self.client = boto3.client(
                'rekognition',
                region_name=getattr(settings, 'AWS_S3_REGION_NAME', 'us-east-1'),
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key
            )
            self.enabled = True
            self.service_enabled = True
            logger.info('[IMAGE_MODERATION] AWS Rekognition initialized successfully')
        except Exception as error:
            logger.critical(
                '[IMAGE_MODERATION] Failed to initialize AWS Rekognition: %s', str(error))
            self.enabled = False
            self.service_enabled = False

    def moderate_image(self, image_file) -> Tuple[bool, Dict]:
        """
        Moderate an image for inappropriate content.
        Uses FAIL-CLOSED pattern: any error results in rejection.

        Args:
            image_file: Django InMemoryUploadedFile or file-like object

        Returns:
            Tuple of (is_safe: bool, results: dict)
        """
        if not self.enabled:
            # In TESTING mode: allow images through with warning
            # In PRODUCTION: fail-closed (but this should never happen if AWS is configured)
            if is_test_mode():
                logger.warning('[IMAGE_MODERATION] TEST MODE: AWS disabled but allowing image')
                return True, {
                    'test_mode': True,
                    'message': 'Modo teste - imagem permitida'
                }
            else:
                # PRODUCTION FAIL-CLOSED: AWS not enabled = REJECT
                logger.critical('[IMAGE_MODERATION] FAIL-CLOSED: AWS disabled - rejecting image')
                return False, {
                    'error': 'Servico de validacao indisponivel',
                    'message': 'Imagem rejeitada - validacao falhou'
                }

        if not image_file:
            return False, {'error': 'Nenhuma imagem fornecida'}

        try:
            # Read image bytes
            if hasattr(image_file, 'read'):
                image_bytes = image_file.read()
                if hasattr(image_file, 'seek'):
                    image_file.seek(0)
            else:
                with open(image_file, 'rb') as file:
                    image_bytes = file.read()

            logger.debug('[IMAGE_MODERATION] Read %d bytes', len(image_bytes))

            # Validate it's a real image
            try:
                Image.open(io.BytesIO(image_bytes))
            except Exception:
                return False, {'error': 'Arquivo invalido - envie JPG, PNG ou GIF'}

            # Call AWS Rekognition detect_moderation_labels
            logger.info('[IMAGE_MODERATION] Calling AWS detect_moderation_labels')
            response = self.client.detect_moderation_labels(
                Image={'Bytes': image_bytes}
            )

            # Parse moderation results
            moderation_labels = response.get('ModerationLabels', [])
            logger.info('[IMAGE_MODERATION] Found %d moderation labels', len(moderation_labels))

            is_flagged = False
            flagged_labels = []

            for label in moderation_labels:
                name = label.get('Name', '')
                confidence = label.get('Confidence', 0)
                logger.info('[IMAGE_MODERATION] Label: %s | Confidence: %.2f%%', name, confidence)

                # Flag if ANY explicit content detected
                if confidence > 0:
                    is_flagged = True
                    flagged_labels.append('%s (%.1f%%)' % (name, confidence))
                    logger.warning('[IMAGE_MODERATION] FLAGGED: %s at %.1f%%', name, confidence)

            # Check for violence/weapons
            logger.info('[IMAGE_MODERATION] Calling AWS detect_labels for violence')
            labels_response = self.client.detect_labels(
                Image={'Bytes': image_bytes},
                MaxLabels=20,
                MinConfidence=70
            )

            labels = labels_response.get('Labels', [])
            logger.info('[IMAGE_MODERATION] Found %d general labels', len(labels))

            violent_keywords = ['weapon', 'gun', 'knife', 'blood', 'violence', 'dead']
            violence_detected = False

            for label in labels:
                label_name = label.get('Name', '').lower()
                if any(keyword in label_name for keyword in violent_keywords):
                    violence_detected = True
                    flagged_labels.append(label_name)
                    logger.warning('[IMAGE_MODERATION] VIOLENCE: %s', label_name)

            # Final verdict
            is_safe = not is_flagged and not violence_detected
            logger.info('[IMAGE_MODERATION] VERDICT: is_safe=%s | flagged=%s | violence=%s',
                        is_safe, is_flagged, violence_detected)

            return is_safe, {
                'flagged': not is_safe,
                'message': 'Imagem aprovada' if is_safe else 'Conteudo inapropriado'
            }

        except self.client.exceptions.InvalidImageFormatException:
            return False, {'error': 'Formato de imagem invalido'}
        except self.client.exceptions.InvalidParameterException as error:
            return False, {'error': 'Erro ao processar: %s' % str(error)[:100]}
        except Exception as error:
            # FAIL-CLOSED: Any error = reject
            error_str = str(error)

            if 'AccessDenied' in error_str or 'not authorized' in error_str:
                logger.critical(
                    '[IMAGE_MODERATION] PERMISSION DENIED - IAM needs rekognition permissions')
                logger.critical('[IMAGE_MODERATION] Error: %s', error_str)
                return False, {'error': 'Erro de permissao - contato com suporte'}

            logger.critical('[IMAGE_MODERATION] AWS error (FAIL-CLOSED): %s', error_str[:200])
            return False, {'error': 'Erro ao validar - tente novamente'}

    def moderate_professional_photo(self, photo_file) -> Tuple[bool, Dict]:
        """Moderate professional profile photo."""
        logger.debug('[MODERATE_PROFESSIONAL_PHOTO] Processing photo')
        is_safe, results = self.moderate_image(photo_file)
        logger.info('[MODERATE_PROFESSIONAL_PHOTO] Result: is_safe=%s', is_safe)
        return is_safe, results


# Singleton instance
_image_moderation_service = None


def get_image_moderation_service() -> ImageModerationService:
    """Get or create the image moderation service singleton."""
    global _image_moderation_service
    if _image_moderation_service is None:
        _image_moderation_service = ImageModerationService()
    return _image_moderation_service

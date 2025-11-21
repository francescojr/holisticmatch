"""
Image moderation service using AWS Rekognition
Validates user-uploaded photos for inappropriate content
"""
import logging
import io
from typing import Tuple, Dict
import boto3
from django.conf import settings
from PIL import Image

logger = logging.getLogger(__name__)


class ImageModerationService:
    """
    Service for image moderation using AWS Rekognition
    Detects: nudity, explicit content, violence, etc.
    """

    def __init__(self):
        """Initialize AWS Rekognition client"""
        self.enabled = False
        self.client = None
        
        try:
            # Check if AWS credentials are configured
            if hasattr(settings, 'AWS_ACCESS_KEY_ID') and settings.AWS_ACCESS_KEY_ID:
                self.client = boto3.client(
                    'rekognition',
                    region_name=getattr(settings, 'AWS_S3_REGION_NAME', 'us-east-1')
                )
                self.enabled = True
        except Exception as e:
            logger.warning(f"AWS Rekognition not configured: {str(e)}")

    def moderate_image(self, image_file) -> Tuple[bool, Dict]:
        """
        Moderate an image for inappropriate content
        
        Args:
            image_file: Django InMemoryUploadedFile or file-like object
            
        Returns:
            Tuple of (is_safe: bool, results: dict)
            - is_safe: True if image passes moderation
            - results: Dictionary containing moderation details
        """
        if not self.enabled:
            # AWS Rekognition not configured
            # In production: this is a configuration error
            # For now: allow image but log warning
            logger.warning("AWS Rekognition not enabled - image moderation skipped. Configure AWS_ACCESS_KEY_ID for production.")
            return True, {'disabled': True, 'message': 'AWS Rekognition not configured - skipping moderation'}

        if not image_file:
            return True, {'empty': True}

        try:
            # Read image bytes
            if hasattr(image_file, 'read'):
                image_bytes = image_file.read()
                # Reset file pointer if needed
                if hasattr(image_file, 'seek'):
                    image_file.seek(0)
            else:
                with open(image_file, 'rb') as f:
                    image_bytes = f.read()

            # Basic validation: check if it's a valid image
            try:
                Image.open(io.BytesIO(image_bytes))
            except Exception:
                return False, {
                    'error': 'Arquivo inválido. Envie uma imagem válida.',
                    'invalid_image': True
                }

            # Call AWS Rekognition to detect explicit content
            response = self.client.detect_moderation_labels(
                Image={'Bytes': image_bytes}
            )

            # Parse results
            moderation_labels = response.get('ModerationLabels', [])
            
            # Check for moderation flags
            is_flagged = False
            flagged_labels = []
            confidence_scores = {}

            for label in moderation_labels:
                name = label.get('Name', '')
                confidence = label.get('Confidence', 0)
                confidence_scores[name] = confidence

                # Flag if ANY confidence level for explicit content
                # CRITICAL: Explicit content (Nudity, Suggestive) at ANY confidence should be flagged
                # AWS returns: Explicit Nudity, Suggestive, etc.
                if confidence > 0:  # Any detection of explicit content = reject
                    is_flagged = True
                    flagged_labels.append(f"{name} ({confidence:.1f}%)")

            # Also run label detection to check for violence/weapons
            labels_response = self.client.detect_labels(
                Image={'Bytes': image_bytes},
                MaxLabels=20,
                MinConfidence=70
            )

            labels = labels_response.get('Labels', [])
            violent_keywords = ['weapon', 'gun', 'knife', 'blood', 'violence', 'dead']
            violence_detected = False

            for label in labels:
                label_name = label.get('Name', '').lower()
                if any(keyword in label_name for keyword in violent_keywords):
                    violence_detected = True
                    flagged_labels.append(label_name)

            # Final verdict
            is_safe = not is_flagged and not violence_detected

            return is_safe, {
                'flagged': not is_safe,
                'explicit_content': {
                    'labels': flagged_labels,
                    'scores': confidence_scores,
                    'violence_detected': violence_detected
                },
                'message': 'Imagem aprovada' if is_safe else 'Conteúdo impróprio detectado na imagem'
            }

        except self.client.exceptions.InvalidImageFormatException:
            return False, {
                'error': 'Formato de imagem inválido. Use JPG, PNG ou GIF.',
                'invalid_format': True
            }
        except self.client.exceptions.InvalidParameterException as e:
            return False, {
                'error': f'Erro ao processar imagem: {str(e)[:100]}',
                'invalid_parameter': True
            }
        except Exception as e:
            # Catch all AWS errors: AccessDeniedException, ServiceUnavailable, etc.
            error_str = str(e)
            
            # Specific handling for permission errors
            if 'AccessDenied' in error_str or 'not authorized' in error_str:
                logger.error(f"AWS Rekognition PERMISSION DENIED: IAM user holisticmatch-s3-user needs rekognition:DetectModerationLabels permission")
                logger.error(f"Full error: {error_str}")
                # Fail-open: allow upload but log clearly
                return True, {
                    'flagged': False,
                    'aws_permission_error': True,
                    'message': 'Aviso: Validação de imagem via AWS indisponível no momento. Imagem aceita.'
                }
            else:
                # Other AWS errors (service unavailable, throttled, etc.)
                logger.error(f"AWS Rekognition error (not permission): {error_str[:200]}")
            
            # Fail-open for other AWS errors too
            return True, {
                'flagged': False,
                'aws_error': True,
                'message': 'Aviso: Validação indisponível. Imagem aceita.'
            }

    def moderate_professional_photo(self, photo_file) -> Tuple[bool, Dict]:
        """
        Moderate professional profile photo
        
        Args:
            photo_file: Photo file to moderate
            
        Returns:
            Tuple of (is_safe: bool, results: dict)
        """
        return self.moderate_image(photo_file)


# Singleton instance
_image_moderation_service = None


def get_image_moderation_service() -> ImageModerationService:
    """Get or create the image moderation service singleton"""
    global _image_moderation_service
    if _image_moderation_service is None:
        _image_moderation_service = ImageModerationService()
    return _image_moderation_service

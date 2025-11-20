"""
Content moderation service using AWS Comprehend
Uses DetectSentiment + keyword patterns for free tier compatibility
"""
import logging
from typing import Dict, Tuple, Optional
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


class ComprehendModerationService:
    """
    AWS Comprehend-based content moderation using DetectSentiment
    (DetectToxicContent requires subscription, so using free tier alternative)
    Combines: sentiment analysis + toxic keyword detection
    """

    def __init__(self):
        """Initialize Comprehend client with EC2 IAM role credentials"""
        try:
            self.client = boto3.client('comprehend', region_name='us-east-1')
            self.enabled = True
            logger.info('✅ AWS Comprehend service initialized')
        except Exception as e:
            logger.warning(f'⚠️ Comprehend init failed: {str(e)[:80]}')
            self.client = None
            self.enabled = False
        
        self._moderation_cache = {}
        
        # Toxic keywords for pre-filtering
        self.toxic_keywords = [
            'matar', 'morte', 'morrer', 'suicida', 'puta', 'desgraçado',
            'estuprar', 'violência', 'ódio', 'xingamento', 'bater', 'explodir'
        ]

    def moderate_text(self, text: str) -> Tuple[Optional[bool], Dict]:
        """
        Moderate text using keyword detection + sentiment analysis
        
        Returns:
            (is_safe, result_dict) where is_safe is:
            - False if toxic content detected
            - True if safe
            - None if service unavailable (triggers fallback)
        """
        if not self.enabled:
            # Service disabled, let moderation.py fallback
            return None, {'disabled': True, 'source': 'comprehend_disabled'}

        if not text or not isinstance(text, str):
            return True, {'empty': True, 'source': 'comprehend'}

        # Check cache first
        if text in self._moderation_cache:
            result = self._moderation_cache[text]
            result[1]['from_cache'] = True
            return result

        # Level 1: Quick keyword check (local, fast)
        text_lower = text.lower()
        for keyword in self.toxic_keywords:
            if keyword in text_lower:
                cache_result = (False, {
                    'flagged': True,
                    'reason': 'toxic_keyword',
                    'keyword': keyword,
                    'source': 'comprehend',
                })
                self._moderation_cache[text] = cache_result
                logger.warning(f'Comprehend: toxic keyword detected: {keyword}')
                return cache_result

        # Level 2: Try sentiment analysis (AWS API call)
        try:
            response = self.client.detect_sentiment(
                Text=text,
                LanguageCode='pt'
            )
            
            sentiment = response.get('Sentiment')
            scores = response.get('SentimentScore', {})
            
            # Consider NEGATIVE sentiment as potentially problematic
            is_negative = sentiment == 'NEGATIVE'
            is_safe = not is_negative
            
            if not is_safe:
                logger.warning(f'Comprehend: NEGATIVE sentiment detected')
            
            cache_result = (is_safe, {
                'flagged': not is_safe,
                'sentiment': sentiment,
                'scores': scores,
                'source': 'comprehend',
            })
            
            self._moderation_cache[text] = cache_result
            return cache_result
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            logger.error(f'Comprehend API error ({error_code})')
            # Return None to trigger fallback to OpenAI
            return None, {
                'error': error_code,
                'service_unavailable': True,
                'source': 'comprehend',
            }
        except Exception as e:
            logger.error(f'Comprehend error: {str(e)[:80]}')
            # Return None to trigger fallback
            return None, {
                'error': str(e)[:80],
                'service_unavailable': True,
                'source': 'comprehend',
            }


_comprehend_service = None


def get_comprehend_service() -> ComprehendModerationService:
    """Get or create the Comprehend moderation service singleton"""
    global _comprehend_service
    if _comprehend_service is None:
        _comprehend_service = ComprehendModerationService()
    return _comprehend_service

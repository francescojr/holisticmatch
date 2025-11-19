"""
Content moderation service using OpenAI Moderation API
Validates user-generated content to prevent inappropriate, hateful, or illegal content
"""
import logging
from typing import Dict, Tuple
from openai import OpenAI
from django.conf import settings

logger = logging.getLogger(__name__)


class ModerationService:
    """
    Service for content moderation using OpenAI's Moderation API
    Detects: hate speech, harassment, violence, sexual content, self-harm, offensive language
    """

    def __init__(self):
        """Initialize OpenAI client with API key from settings"""
        self.api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.enabled = self.client is not None

    def moderate_text(self, text: str) -> Tuple[bool, Dict]:
        """
        Moderate a text for inappropriate content
        
        Args:
            text: The text to moderate
            
        Returns:
            Tuple of (is_safe: bool, results: dict)
            - is_safe: True if content is acceptable, False if flagged
            - results: Dictionary containing:
                - flagged: bool
                - categories: dict of category flags
                - category_scores: dict of category severity scores
                - error: str or None
        """
        if not self.enabled:
            return True, {'flagged': False, 'disabled': True}

        if not text or not isinstance(text, str):
            return True, {'flagged': False, 'empty': True}

        try:
            response = self.client.moderations.create(input=text)
            result = response.results[0]

            categories = {
                'hate': result.categories.hate,
                'hate_threatening': result.categories.hate_threatening,
                'harassment': result.categories.harassment,
                'harassment_threatening': result.categories.harassment_threatening,
                'self_harm': result.categories.self_harm,
                'self_harm_instructions': result.categories.self_harm_instructions,
                'self_harm_intent': result.categories.self_harm_intent,
                'sexual': result.categories.sexual,
                'sexual_minors': result.categories.sexual_minors,
                'violence': result.categories.violence,
                'violence_graphic': result.categories.violence_graphic,
            }

            category_scores = {
                'hate': result.category_scores.hate,
                'hate_threatening': result.category_scores.hate_threatening,
                'harassment': result.category_scores.harassment,
                'harassment_threatening': result.category_scores.harassment_threatening,
                'self_harm': result.category_scores.self_harm,
                'self_harm_instructions': result.category_scores.self_harm_instructions,
                'self_harm_intent': result.category_scores.self_harm_intent,
                'sexual': result.category_scores.sexual,
                'sexual_minors': result.category_scores.sexual_minors,
                'violence': result.category_scores.violence,
                'violence_graphic': result.category_scores.violence_graphic,
            }

            is_safe = not result.flagged

            if not is_safe:
                # Log flagged content for debugging
                flagged_cats = [cat for cat, flag in categories.items() if flag]
    
            return is_safe, {
                'flagged': result.flagged,
                'categories': categories,
                'category_scores': category_scores,
            }

        except Exception as e:
            # On error, allow content to proceed (fail-open approach)
            # In production, you might want to fail-closed instead
            return True, {
                'error': str(e),
                'api_unavailable': True,
            }

    def moderate_professional_data(self, data: Dict) -> Tuple[bool, Dict]:
        """
        Moderate all text fields in professional registration/update data
        
        Args:
            data: Dictionary containing professional data fields
            
        Returns:
            Tuple of (is_safe: bool, results: dict)
            - is_safe: True if all content is acceptable
            - results: Dictionary with moderation results for each field
        """
        fields_to_moderate = ['name', 'bio', 'professional_title']
        results = {}

        for field in fields_to_moderate:
            if field not in data:
                continue

            text = data.get(field, '')
            if not text:
                results[field] = {'safe': True}
                continue

            is_safe, moderation_result = self.moderate_text(text)
            results[field] = {
                'safe': is_safe,
                'flagged': moderation_result.get('flagged', False),
                'categories': moderation_result.get('categories', {}),
            }

        # Overall safety: all fields must be safe
        is_overall_safe = all(r.get('safe', True) for r in results.values())

        return is_overall_safe, results


# Singleton instance
_moderation_service = None


def get_moderation_service() -> ModerationService:
    """Get or create the moderation service singleton"""
    global _moderation_service
    if _moderation_service is None:
        _moderation_service = ModerationService()
    return _moderation_service

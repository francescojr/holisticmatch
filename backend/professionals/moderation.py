"""
Content moderation service with cascading fallbacks:
1. OpenAI Moderation (with 3 retries + exponential backoff)
2. Local regex fallback (always available as final safety net)
"""
import logging
import time
import re
from typing import Dict, Tuple, Optional
from openai import OpenAI
from django.conf import settings

logger = logging.getLogger(__name__)

# Fallback keyword patterns for final safety net
# Regex patterns organized by category - more comprehensive
PROHIBITED_PATTERNS = [
    # Threats and violence (including typos/variations)
    r'\b(matar|morte|morrer|suicida|puta|desgraçado|buceta|caralho|cararlho|caraho|crl|c\.r\.l|caraio|porra|merda|fodido|foder|fuder)\b',
    r'\b(vou te|vou lhe|vou matar|vou bater|vou estuprar|vou explodir)\b',
    r'\b(ameaça|ameaço|vou|matei|mataria|bateria|estuprei|xingo)\b',
    
    # Sexual content (including male genitalia slang)
    r'\b(sexo|pornô|porno|pornografia|buceta|pinto|peito|anal|oral|trepar|transar|p0rno|piroca|pir|pau|rola|teta|mama|cu|rabo|bumbum|bundao|bunda)\b',
    r'\b(nudes|nude|cam|camgirl|sexting|vibrador|dildo)\b',
    
    # Harassment and hate
    r'\b(xingamento|xingo|xingue|chamego|racista|racismo|homofobia|lgbtfobia|lixo|porcaria)\b',
    r'\b(filho da puta|desgraçado|miserável|idiota|imbecil|retardado|débil|fdp|f\.d\.p)\b',
    
    # Drug/substance abuse mentions
    r'\b(cocaína|crack|heroína|maconha|droga|drogas|traficante|trafico|coca|h|hxc)\b',
    
    # Slurs and offensive language (Portuguese)
    r'\b(preto|negão|macaco|judeu|turco|gordo|gorda|aleijado|retardado|deficiente|chines|turquinho)\b',
    
    # Leetspeak/number replacements
    r'(?i)(c4r4lh0|c4ralh0|c4r4lho|k4r4lho|k@r@lho|p1r0c4|p1r0c@|p1r0k4)',
]


class ModerationService:
    """
    Content moderation with cascading providers:
    1. OpenAI Moderation (primary) - very accurate
    2. Regex patterns (fallback) - basic but always works
    """

    def __init__(self):
        """Initialize moderation providers"""
        # OpenAI
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.openai_client = OpenAI(api_key=self.openai_api_key) if self.openai_api_key else None
        self.openai_enabled = self.openai_client is not None
        if self.openai_enabled:
            logger.info('✅ OpenAI service available')
        
        self._moderation_cache = {}

    def moderate_text(self, text: str) -> Tuple[bool, Dict]:
        """
        Moderate text using cascading providers:
        1. Try OpenAI (accurate, with 3 retries on rate limit)
        2. If unavailable, use regex fallback (always works)
        
        Args:
            text: The text to moderate
            
        Returns:
            Tuple of (is_safe: bool, results: dict with 'source' field)
        """
        if not text or not isinstance(text, str):
            return True, {'empty': True}

        # Check cache first
        if text in self._moderation_cache:
            result = self._moderation_cache[text]
            result[1]['from_cache'] = True
            return result

        # LEVEL 1: Try OpenAI Moderation
        is_safe, openai_result = self._moderate_with_openai(text)
        if is_safe is not None:
            cache_result = (is_safe, {**openai_result, 'service_chain': ['openai']})
            self._moderation_cache[text] = cache_result
            return cache_result
        
        logger.debug('OpenAI unavailable, using regex fallback')

        # LEVEL 2: Use local regex fallback
        is_safe, fallback_result = self._fallback_moderate_text(text)
        cache_result = (is_safe, {**fallback_result, 'service_chain': ['openai', 'regex']})
        self._moderation_cache[text] = cache_result
        return cache_result

    def _moderate_with_openai(self, text: str) -> Tuple[Optional[bool], Dict]:
        """
        Try OpenAI moderation with retry logic
        
        Returns:
            Tuple of (is_safe: Optional[bool], results: dict)
            - is_safe=None means service unavailable, should fallback
        """
        if not self.openai_enabled:
            return None, {'source': 'openai_disabled'}

        max_retries = 3
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                response = self.openai_client.moderations.create(input=text)
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
                    flagged_cats = [cat for cat, flag in categories.items() if flag]
                    logger.warning(f'OpenAI flagged: {flagged_cats}')
        
                return is_safe, {
                    'flagged': result.flagged,
                    'categories': categories,
                    'category_scores': category_scores,
                    'source': 'openai',
                }
                
            except Exception as e:
                error_str = str(e)
                
                # If rate limit, retry with backoff
                if '429' in error_str or 'Too Many Requests' in error_str:
                    if attempt < max_retries - 1:
                        logger.warning(f'OpenAI rate limit, retrying in {retry_delay}s...')
                        time.sleep(retry_delay)
                        retry_delay *= 2
                        continue
                    else:
                        logger.error(f'OpenAI rate limit exhausted after {max_retries} attempts')
                        return None, {
                            'error': 'OpenAI rate limit',
                            'service_unavailable': True,
                            'source': 'openai',
                        }
                
                # Other errors
                logger.error(f'OpenAI error: {error_str[:100]}')
                return None, {
                    'error': error_str[:100],
                    'service_unavailable': True,
                    'source': 'openai',
                }

    def _fallback_moderate_text(self, text: str) -> Tuple[bool, Dict]:
        """
        Fallback moderation using basic keyword filtering
        Used when AWS and OpenAI are unavailable
        """
        text_lower = text.lower()
        
        for pattern in PROHIBITED_PATTERNS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                logger.warning(f'Regex filter blocked: {pattern}')
                return False, {
                    'flagged': True,
                    'categories': {'prohibited_pattern': True},
                    'source': 'regex',
                }
        
        return True, {
            'flagged': False,
            'source': 'regex',
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
                'source': moderation_result.get('source', 'unknown'),
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


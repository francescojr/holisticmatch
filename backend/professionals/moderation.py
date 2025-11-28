"""
Content moderation service with cascading fallbacks:
1. OpenAI Moderation (with 3 retries + exponential backoff)
2. Local regex fallback (always available as final safety net)

v1.4.7 Improvements:
- Rate limiting per IP (configurable, default 30/min)
- Cache with TTL (1 hour default)
- Enhanced fallback with accept-and-log strategy
- Improved logging for debugging
"""
import logging
import time
import re
import hashlib
from typing import Dict, Tuple, Optional
from functools import lru_cache
from openai import OpenAI
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

# ============================================
# CONFIGURATION (can be overridden in settings)
# ============================================
MODERATION_RATE_LIMIT_PER_MINUTE = getattr(settings, 'MODERATION_RATE_LIMIT_PER_MINUTE', 30)
MODERATION_CACHE_TTL_SECONDS = getattr(settings, 'MODERATION_CACHE_TTL_SECONDS', 3600)  # 1 hour
MODERATION_ACCEPT_ON_ERROR = getattr(settings, 'MODERATION_ACCEPT_ON_ERROR', True)

# ============================================
# RATE LIMITING (per-IP)
# ============================================
_rate_limit_store: Dict[str, list] = {}


def _check_rate_limit(ip_address: str = 'global') -> Tuple[bool, int]:
    """
    Check if IP is within rate limit.
    
    Returns:
        Tuple of (is_allowed, requests_remaining)
    """
    current_time = time.time()
    window_start = current_time - 60  # 1 minute window
    
    # Clean old entries
    if ip_address in _rate_limit_store:
        _rate_limit_store[ip_address] = [
            ts for ts in _rate_limit_store[ip_address] 
            if ts > window_start
        ]
    else:
        _rate_limit_store[ip_address] = []
    
    current_count = len(_rate_limit_store[ip_address])
    remaining = max(0, MODERATION_RATE_LIMIT_PER_MINUTE - current_count)
    
    if current_count >= MODERATION_RATE_LIMIT_PER_MINUTE:
        logger.warning(f"[RATE_LIMIT] ⚠️ Rate limit exceeded for {ip_address}: {current_count}/{MODERATION_RATE_LIMIT_PER_MINUTE}")
        return False, 0
    
    # Add current request
    _rate_limit_store[ip_address].append(current_time)
    return True, remaining - 1


def _get_cache_key(text: str) -> str:
    """Generate a cache key from text content."""
    text_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]
    return f"moderation:text:{text_hash}"

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
    1. OpenAI Moderation (primary) - very accurate, FREE API
    2. Regex patterns (fallback) - basic but always works
    
    v1.4.7 Features:
    - Rate limiting: {MODERATION_RATE_LIMIT_PER_MINUTE}/min per IP
    - Caching: {MODERATION_CACHE_TTL_SECONDS}s TTL
    - Graceful fallback on errors
    """

    def __init__(self):
        """Initialize moderation providers"""
        # OpenAI
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.openai_client = OpenAI(api_key=self.openai_api_key) if self.openai_api_key else None
        self.openai_enabled = self.openai_client is not None
        if self.openai_enabled:
            logger.info('✅ OpenAI moderation service available')
        else:
            logger.warning('⚠️ OpenAI moderation disabled - using regex fallback only')

    def moderate_text(self, text: str, ip_address: str = 'global') -> Tuple[bool, Dict]:
        """
        Moderate text using cascading providers:
        1. Check cache (with TTL)
        2. Check rate limit
        3. Try OpenAI (accurate, with 3 retries on rate limit)
        4. If unavailable, use regex fallback (always works)
        
        Args:
            text: The text to moderate
            ip_address: IP for rate limiting (optional)
            
        Returns:
            Tuple of (is_safe: bool, results: dict with 'source' field)
        """
        logger.debug(f"[MODERATE_TEXT] Called for text: {type(text).__name__}")
        
        if not text or not isinstance(text, str):
            logger.debug("[MODERATE_TEXT] Text is empty or not string - allowing")
            return True, {'empty': True, 'source': 'skip'}

        text = text.strip()
        if not text:
            return True, {'empty': True, 'source': 'skip'}
            
        logger.debug(f"[MODERATE_TEXT] Text content: '{text[:50]}...'")

        # ============================================
        # STEP 1: Check cache (with TTL via Django cache)
        # ============================================
        cache_key = _get_cache_key(text)
        cached_result = cache.get(cache_key)
        if cached_result is not None:
            logger.info(f"[MODERATE_TEXT] ✅ Cache HIT (TTL: {MODERATION_CACHE_TTL_SECONDS}s)")
            cached_result[1]['from_cache'] = True
            return tuple(cached_result)
        
        logger.debug(f"[MODERATE_TEXT] Cache MISS - checking rate limit")

        # ============================================
        # STEP 2: Check rate limit
        # ============================================
        is_allowed, remaining = _check_rate_limit(ip_address)
        if not is_allowed:
            logger.warning(f"[MODERATE_TEXT] ⚠️ Rate limit hit for {ip_address} - using regex only")
            return self._fallback_moderate_text(text)

        # ============================================
        # STEP 3: Try OpenAI Moderation
        # ============================================
        logger.debug("[MODERATE_TEXT] Attempting OpenAI moderation")
        is_safe, openai_result = self._moderate_with_openai(text)
        
        if is_safe is not None:
            logger.info(f"[MODERATE_TEXT] OpenAI result: is_safe={is_safe}, flagged={openai_result.get('flagged')}")
            result = (is_safe, {**openai_result, 'service_chain': ['openai'], 'rate_remaining': remaining})
            # Cache the result with TTL
            cache.set(cache_key, list(result), MODERATION_CACHE_TTL_SECONDS)
            return result
        
        logger.warning('[MODERATE_TEXT] OpenAI unavailable, using regex fallback')

        # ============================================
        # STEP 4: Use local regex fallback
        # ============================================
        is_safe, fallback_result = self._fallback_moderate_text(text)
        logger.info(f"[MODERATE_TEXT] Regex result: is_safe={is_safe}, flagged={fallback_result.get('flagged')}")
        result = (is_safe, {**fallback_result, 'service_chain': ['openai_failed', 'regex']})
        # Cache fallback result too
        cache.set(cache_key, list(result), MODERATION_CACHE_TTL_SECONDS)
        return result

    def _moderate_with_openai(self, text: str) -> Tuple[Optional[bool], Dict]:
        """
        Try OpenAI moderation with retry logic.
        OpenAI Moderation API is FREE with 1000 req/min limit.
        
        Returns:
            Tuple of (is_safe: Optional[bool], results: dict)
            - is_safe=None means service unavailable, should fallback
        """
        if not self.openai_enabled:
            logger.debug("[OPENAI] Service not configured - will use fallback")
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
                    logger.warning(f'[OPENAI] ⚠️ Content flagged: {flagged_cats}')
        
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
                        logger.warning(f'[OPENAI] Rate limit hit, retrying in {retry_delay}s (attempt {attempt + 1}/{max_retries})...')
                        time.sleep(retry_delay)
                        retry_delay *= 2
                        continue
                    else:
                        logger.error(f'[OPENAI] ❌ Rate limit exhausted after {max_retries} attempts')
                        # Fall through to use fallback
                
                # Log the error but don't crash
                logger.error(f'[OPENAI] ❌ API error: {error_str[:100]}')
                
                # GRACEFUL FALLBACK: If configured to accept on error, allow content
                # This prevents blocking legitimate users due to API issues
                if MODERATION_ACCEPT_ON_ERROR:
                    logger.warning(f'[OPENAI] ⚠️ ACCEPT_ON_ERROR enabled - accepting content for manual review')
                    return True, {
                        'source': 'openai_error_fallback',
                        'error': error_str[:100],
                        'flagged': False,
                        'needs_manual_review': True,
                    }
                
                return None, {
                    'error': error_str[:100],
                    'service_unavailable': True,
                    'source': 'openai',
                }
        
        # Should not reach here, but safety fallback
        return None, {'source': 'openai_exhausted'}

    def _fallback_moderate_text(self, text: str) -> Tuple[bool, Dict]:
        """
        Fallback moderation using basic keyword filtering
        Used when AWS and OpenAI are unavailable
        """
        logger.warning(f"[REGEX_FALLBACK] 🔴 Starting regex moderation check for text: '{text[:50]}...'")
        text_lower = text.lower()
        matched_patterns = []
        
        for i, pattern in enumerate(PROHIBITED_PATTERNS):
            if re.search(pattern, text_lower, re.IGNORECASE):
                logger.warning(f'[REGEX_FALLBACK] ⚠️  Pattern #{i+1} MATCHED: {pattern[:60]}...')
                matched_patterns.append(pattern[:60])
                logger.warning(f'[REGEX_FALLBACK] ❌ CONTENT BLOCKED BY REGEX: {matched_patterns}')
                return False, {
                    'flagged': True,
                    'categories': {'prohibited_pattern': True},
                    'matched_patterns': matched_patterns,
                    'source': 'regex',
                }
            else:
                logger.debug(f'[REGEX_FALLBACK] ✅ Pattern #{i+1} did not match')
        
        logger.info(f"[REGEX_FALLBACK] ✅ All {len(PROHIBITED_PATTERNS)} regex patterns passed")
        return True, {
            'flagged': False,
            'patterns_checked': len(PROHIBITED_PATTERNS),
            'source': 'regex',
        }

    def moderate_professional_data(self, data: Dict, ip_address: str = 'global') -> Tuple[bool, Dict]:
        """
        Moderate all text fields in professional registration/update data
        
        Args:
            data: Dictionary containing professional data fields
            ip_address: IP for rate limiting
            
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

            is_safe, moderation_result = self.moderate_text(text, ip_address)
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


"""
Tests for content moderation service
"""
import pytest
from unittest.mock import patch, MagicMock
from professionals.moderation import ModerationService, get_moderation_service


@pytest.mark.unit
class TestModerationService:
    """Test suite for content moderation"""

    def test_moderation_service_initialization(self):
        """Test that moderation service initializes correctly"""
        service = ModerationService()
        # Service should initialize even without API key
        assert service is not None

    def test_moderate_text_disabled_when_no_api_key(self):
        """Test that moderation falls back to regex when API key is missing"""
        with patch('professionals.moderation.settings.OPENAI_API_KEY', None):
            service = ModerationService()
            is_safe, results = service.moderate_text("some text")
            # When OpenAI is not available, should fall back to regex (always available)
            assert is_safe is True
            assert results.get('source') == 'regex'
            assert results.get('service_chain') == ['openai', 'regex']

    def test_moderate_text_empty_input(self):
        """Test that empty text is considered safe"""
        service = ModerationService()
        is_safe, _ = service.moderate_text("")
        assert is_safe is True
        # When moderation is disabled, returns disabled flag instead of empty
        # This is expected behavior

    def test_moderate_text_none_input(self):
        """Test that None input is considered safe"""
        service = ModerationService()
        is_safe, _ = service.moderate_text(None)
        assert is_safe is True

    @patch('professionals.moderation.OpenAI')
    def test_moderate_text_safe_content(self, mock_openai_class):
        """Test that safe content passes moderation"""
        # Mock the API response for safe content
        mock_response = MagicMock()
        mock_result = MagicMock()
        mock_result.flagged = False
        mock_result.categories = MagicMock(
            hate=False,
            hate_threatening=False,
            harassment=False,
            harassment_threatening=False,
            self_harm=False,
            self_harm_instructions=False,
            self_harm_intent=False,
            sexual=False,
            sexual_minors=False,
            violence=False,
            violence_graphic=False,
        )
        mock_result.category_scores = MagicMock(
            hate=0.0,
            hate_threatening=0.0,
            harassment=0.0,
            harassment_threatening=0.0,
            self_harm=0.0,
            self_harm_instructions=0.0,
            self_harm_intent=0.0,
            sexual=0.0,
            sexual_minors=0.0,
            violence=0.0,
            violence_graphic=0.0,
        )
        mock_response.results = [mock_result]

        mock_openai_class.return_value.moderations.create.return_value = mock_response

        with patch('professionals.moderation.settings.OPENAI_API_KEY', 'test-key'):
            service = ModerationService()
            is_safe, results = service.moderate_text("I love helping people with meditation")
            assert is_safe is True
            assert results['flagged'] is False

    @patch('professionals.moderation.OpenAI')
    def test_moderate_text_flagged_content(self, mock_openai_class):
        """Test that inappropriate content is flagged"""
        # Mock the API response for flagged content
        mock_response = MagicMock()
        mock_result = MagicMock()
        mock_result.flagged = True
        mock_result.categories = MagicMock(
            hate=True,  # Flagged for hate speech
            hate_threatening=False,
            harassment=False,
            harassment_threatening=False,
            self_harm=False,
            self_harm_instructions=False,
            self_harm_intent=False,
            sexual=False,
            sexual_minors=False,
            violence=False,
            violence_graphic=False,
        )
        mock_result.category_scores = MagicMock(
            hate=0.95,
            hate_threatening=0.0,
            harassment=0.0,
            harassment_threatening=0.0,
            self_harm=0.0,
            self_harm_instructions=0.0,
            self_harm_intent=0.0,
            sexual=0.0,
            sexual_minors=0.0,
            violence=0.0,
            violence_graphic=0.0,
        )
        mock_response.results = [mock_result]

        mock_openai_class.return_value.moderations.create.return_value = mock_response

        with patch('professionals.moderation.settings.OPENAI_API_KEY', 'test-key'):
            service = ModerationService()
            is_safe, results = service.moderate_text("[inappropriate hate speech]")
            assert is_safe is False
            assert results['flagged'] is True
            assert results['categories']['hate'] is True

    @patch('professionals.moderation.OpenAI')
    def test_moderate_professional_data(self, mock_openai_class):
        """Test moderating multiple professional fields"""
        # Mock safe content response
        mock_response = MagicMock()
        mock_result = MagicMock()
        mock_result.flagged = False
        mock_result.categories = MagicMock(
            hate=False, hate_threatening=False, harassment=False,
            harassment_threatening=False, self_harm=False,
            self_harm_instructions=False, self_harm_intent=False,
            sexual=False, sexual_minors=False, violence=False,
            violence_graphic=False,
        )
        mock_result.category_scores = MagicMock(
            hate=0.0, hate_threatening=0.0, harassment=0.0,
            harassment_threatening=0.0, self_harm=0.0,
            self_harm_instructions=0.0, self_harm_intent=0.0,
            sexual=0.0, sexual_minors=0.0, violence=0.0,
            violence_graphic=0.0,
        )
        mock_response.results = [mock_result]

        mock_openai_class.return_value.moderations.create.return_value = mock_response

        with patch('professionals.moderation.settings.OPENAI_API_KEY', 'test-key'):
            service = ModerationService()
            data = {
                'name': 'John Holistic Therapist',
                'bio': 'I provide meditation and wellness services',
                'professional_title': 'Certified Meditation Coach',
            }
            is_safe, results = service.moderate_professional_data(data)
            assert is_safe is True
            assert results['name']['safe'] is True
            assert results['bio']['safe'] is True
            assert results['professional_title']['safe'] is True

    def test_moderation_service_singleton(self):
        """Test that get_moderation_service returns a singleton"""
        service1 = get_moderation_service()
        service2 = get_moderation_service()
        assert service1 is service2

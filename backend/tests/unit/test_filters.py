"""
Unit tests for professional filters.
Tests filtering logic for Professional queryset.
"""
import pytest
from django.contrib.auth.models import User
from professionals.models import Professional
from professionals.filters import ProfessionalFilter


@pytest.fixture
def user():
    """Create a test user"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def professionals(user):
    """Create test professionals with different attributes"""
    prof1 = Professional.objects.create(
        user=user,
        name='João Silva',
        bio='Especialista em Reiki',
        services=['Reiki', 'Meditação'],
        city='São Paulo',
        state='SP',
        price_per_session=150.00,
        attendance_type='presencial',
        whatsapp='11999999999',
        email='joao@example.com',
    )

    # Create another user for second professional
    user2 = User.objects.create_user(
        username='testuser2',
        email='test2@example.com',
        password='testpass123'
    )

    prof2 = Professional.objects.create(
        user=user2,
        name='Maria Santos',
        bio='Especialista em Acupuntura',
        services=['Acupuntura', 'Massagem'],
        city='Rio de Janeiro',
        state='RJ',
        price_per_session=200.00,
        attendance_type='online',
        whatsapp='21999999999',
        email='maria@example.com',
    )

    # Create another user for third professional
    user3 = User.objects.create_user(
        username='testuser3',
        email='test3@example.com',
        password='testpass123'
    )

    prof3 = Professional.objects.create(
        user=user3,
        name='Pedro Costa',
        bio='Terapeuta holístico',
        services=['Reiki', 'Tarot'],
        city='Belo Horizonte',
        state='MG',
        price_per_session=100.00,
        attendance_type='ambos',
        whatsapp='31999999999',
        email='pedro@example.com',
    )

    return [prof1, prof2, prof3]


class TestProfessionalFilter:
    """Test ProfessionalFilter functionality"""

    @pytest.mark.django_db
    def test_filter_by_service_reiki(self, professionals):
        """Test filtering by service 'Reiki'"""
        filterset = ProfessionalFilter(data={'service': 'Reiki'})
        results = filterset.qs

        # Should return prof1 and prof3 (both have Reiki)
        assert results.count() == 2
        names = [p.name for p in results]
        assert 'João Silva' in names
        assert 'Pedro Costa' in names

    @pytest.mark.django_db
    def test_filter_by_service_acupuntura(self, professionals):
        """Test filtering by service 'Acupuntura'"""
        filterset = ProfessionalFilter(data={'service': 'Acupuntura'})
        results = filterset.qs

        # Should return only prof2
        assert results.count() == 1
        assert results.first().name == 'Maria Santos'

    @pytest.mark.django_db
    def test_filter_by_service_nonexistent(self, professionals):
        """Test filtering by non-existent service"""
        filterset = ProfessionalFilter(data={'service': 'Yoga'})
        results = filterset.qs

        # Should return no results
        assert results.count() == 0

    @pytest.mark.django_db
    def test_filter_by_city_sao_paulo(self, professionals):
        """Test filtering by city 'São Paulo'"""
        filterset = ProfessionalFilter(data={'city': 'São Paulo'})
        results = filterset.qs

        # Should return only prof1
        assert results.count() == 1
        assert results.first().name == 'João Silva'

    @pytest.mark.django_db
    def test_filter_by_city_partial_match(self, professionals):
        """Test filtering by partial city name"""
        filterset = ProfessionalFilter(data={'city': 'Rio'})
        results = filterset.qs

        # Should return prof2 (Rio de Janeiro contains 'Rio')
        assert results.count() == 1
        assert results.first().name == 'Maria Santos'

    @pytest.mark.django_db
    def test_filter_by_state_sp(self, professionals):
        """Test filtering by state 'SP'"""
        filterset = ProfessionalFilter(data={'state': 'SP'})
        results = filterset.qs

        # Should return only prof1
        assert results.count() == 1
        assert results.first().name == 'João Silva'

    @pytest.mark.django_db
    def test_filter_by_state_case_insensitive(self, professionals):
        """Test filtering by state is case insensitive"""
        filterset = ProfessionalFilter(data={'state': 'sp'})
        results = filterset.qs

        # Should return prof1 (SP matches sp)
        assert results.count() == 1
        assert results.first().name == 'João Silva'

    @pytest.mark.django_db
    def test_filter_by_price_min(self, professionals):
        """Test filtering by minimum price"""
        filterset = ProfessionalFilter(data={'price_min': 150})
        results = filterset.qs

        # Should return prof1 (150) and prof2 (200)
        assert results.count() == 2
        prices = [p.price_per_session for p in results]
        assert 150.00 in prices
        assert 200.00 in prices

    @pytest.mark.django_db
    def test_filter_by_price_max(self, professionals):
        """Test filtering by maximum price"""
        filterset = ProfessionalFilter(data={'price_max': 150})
        results = filterset.qs

        # Should return prof1 (150) and prof3 (100)
        assert results.count() == 2
        prices = [p.price_per_session for p in results]
        assert 150.00 in prices
        assert 100.00 in prices

    @pytest.mark.django_db
    def test_filter_by_price_range(self, professionals):
        """Test filtering by price range"""
        filterset = ProfessionalFilter(data={'price_min': 120, 'price_max': 180})
        results = filterset.qs

        # Should return only prof1 (150)
        assert results.count() == 1
        assert results.first().price_per_session == 150.00

    @pytest.mark.django_db
    def test_filter_by_attendance_type_presencial(self, professionals):
        """Test filtering by attendance type 'presencial'"""
        filterset = ProfessionalFilter(data={'attendance_type': 'presencial'})
        results = filterset.qs

        # Should return only prof1
        assert results.count() == 1
        assert results.first().name == 'João Silva'

    @pytest.mark.django_db
    def test_filter_by_attendance_type_online(self, professionals):
        """Test filtering by attendance type 'online'"""
        filterset = ProfessionalFilter(data={'attendance_type': 'online'})
        results = filterset.qs

        # Should return only prof2
        assert results.count() == 1
        assert results.first().name == 'Maria Santos'

    @pytest.mark.django_db
    def test_filter_by_attendance_type_ambos(self, professionals):
        """Test filtering by attendance type 'ambos'"""
        filterset = ProfessionalFilter(data={'attendance_type': 'ambos'})
        results = filterset.qs

        # Should return only prof3
        assert results.count() == 1
        assert results.first().name == 'Pedro Costa'

    @pytest.mark.django_db
    def test_combined_filters(self, professionals):
        """Test combining multiple filters"""
        filterset = ProfessionalFilter(data={
            'service': 'Reiki',
            'price_max': 160,
            'attendance_type': 'presencial'
        })
        results = filterset.qs

        # Should return only prof1 (matches all criteria)
        assert results.count() == 1
        assert results.first().name == 'João Silva'

    @pytest.mark.django_db
    def test_no_filters(self, professionals):
        """Test with no filters applied"""
        filterset = ProfessionalFilter(data={})
        results = filterset.qs

        # Should return all professionals
        assert results.count() == 3

    @pytest.mark.django_db
    def test_empty_filter_values(self, professionals):
        """Test with empty filter values"""
        filterset = ProfessionalFilter(data={'service': '', 'city': ''})
        results = filterset.qs

        # Should return all professionals (empty filters ignored)
        assert results.count() == 3
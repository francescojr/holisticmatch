"""
Pytest configuration and fixtures for all tests.
OPTIMIZED: Loads cities ONCE per test session using pytest_sessionstart.
This ensures cities persist even with pytest-django's database reset between tests.
"""
import pytest
import os
import django
from rest_framework.test import APIClient


def pytest_configure(config):
    """
    Hook: Called after command line options have been parsed.
    Ensures Django is setup before any session hooks run.
    """
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()


# Global flag to prevent duplicate city loading
_cities_loaded_this_session = False


def pytest_sessionstart(session):
    """
    Hook: Called before pytest session starts, AFTER database is created.
    This is the right place to load initial data that should persist for all tests.
    """
    global _cities_loaded_this_session
    
    if _cities_loaded_this_session:
        return
    
    from professionals.models import City
    
    try:
        # Check if cities already exist
        if City.objects.exists():
            _cities_loaded_this_session = True
            return
        
        # Load cities
        cities_data = {
            'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'],
            'RJ': ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu'],
            'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora'],
            'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista'],
            'SC': ['Florianópolis', 'Joinville', 'Blumenau'],
            'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas'],
            'PR': ['Curitiba', 'Londrina', 'Maringá'],
            'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda'],
            'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte'],
            'PA': ['Belém', 'Ananindeua', 'Santarém'],
        }
        
        cities_to_create = [
            City(state=state, name=city_name)
            for state, city_list in cities_data.items()
            for city_name in city_list
        ]
        
        City.objects.bulk_create(cities_to_create, ignore_conflicts=True)
        _cities_loaded_this_session = True
    except Exception:
        # Silently fail during setup - might be in collection phase
        pass


@pytest.fixture(autouse=True)
def ensure_cities_for_django_db_tests(db):
    """
    Autouse fixture: Ensures cities are loaded for tests with @pytest.mark.django_db.
    This runs after pytest_sessionstart and ensures cities exist in the test DB
    for each test that needs them.
    """
    global _cities_loaded_this_session
    
    from professionals.models import City
    
    # Check if already loaded in this session
    if _cities_loaded_this_session and City.objects.exists():
        return
    
    # Try to load cities
    try:
        if not City.objects.exists():
            cities_data = {
                'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'],
                'RJ': ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu'],
                'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora'],
                'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista'],
                'SC': ['Florianópolis', 'Joinville', 'Blumenau'],
                'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas'],
                'PR': ['Curitiba', 'Londrina', 'Maringá'],
                'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda'],
                'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte'],
                'PA': ['Belém', 'Ananindeua', 'Santarém'],
            }
            
            cities_to_create = [
                City(state=state, name=city_name)
                for state, city_list in cities_data.items()
                for city_name in city_list
            ]
            
            City.objects.bulk_create(cities_to_create, ignore_conflicts=True)
        _cities_loaded_this_session = True
    except Exception:
        # Silently fail - database might not be accessible in this context
        pass


@pytest.fixture
def api_client():
    """Provide a REST API test client"""
    return APIClient()


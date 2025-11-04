"""
Pytest configuration and fixtures for all tests.
"""
import pytest
from professionals.models import City


@pytest.fixture(autouse=True)
def load_cities_all_tests(db):
    """
    Ensure cities are loaded for any test that needs the database.
    This runs for both root level tests and unit tests.
    """
    # Skip if cities already loaded
    if City.objects.filter(state='SP', name='São Paulo').exists():
        return
    
    # Load Brazilian cities
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
    
    for state, city_list in cities_data.items():
        for city_name in city_list:
            City.objects.get_or_create(state=state, name=city_name)


@pytest.fixture
def api_client():
    """Provide a REST API test client"""
    from rest_framework.test import APIClient
    return APIClient()

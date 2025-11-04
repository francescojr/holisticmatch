"""
Pytest configuration for unit tests.
Handles database setup for unit test database access.
"""
import pytest
from professionals.models import City


@pytest.fixture(autouse=True)
def load_cities(db):
    """
    Ensure cities are loaded before running any test that needs the db.
    Automatically runs for all database tests.
    """
    # Skip if already loaded
    if City.objects.filter(state='SP').exists():
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

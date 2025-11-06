"""
Pytest configuration for unit tests.
Cities are now loaded at session start via pytest_sessionstart hook in root conftest.
"""
import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    """Provide a REST API test client for unit tests"""
    return APIClient()


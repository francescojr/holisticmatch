from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfessionalViewSet, api_version

router = DefaultRouter()
router.register(r'professionals', ProfessionalViewSet, basename='professional')

urlpatterns = [
    path('version/', api_version, name='api-version'),
    path('', include(router.urls)),
]

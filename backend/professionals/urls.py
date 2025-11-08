from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import ProfessionalViewSet

router = DefaultRouter()
router.register(r'professionals', ProfessionalViewSet, basename='professional')

urlpatterns = [
    path('', include(router.urls)),
    
    # Explicit routes to handle both with and without trailing slash
    # These match DRF's generated routes but without requiring trailing slash
    re_path(r'^professionals/register/?$', ProfessionalViewSet.as_view({'post': 'register'}), name='professional-register'),
    re_path(r'^professionals/verify-email/?$', ProfessionalViewSet.as_view({'post': 'verify_email'}), name='professional-verify-email'),
]

"""
URL configuration for HolisticMatch project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.views import APIView

class HealthCheckView(APIView):
    """Simple health check endpoint for load balancers"""
    def get(self, request):
        return Response({'status': 'ok'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('api/v1/health/', HealthCheckView.as_view(), name='api-health-check'),
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/', include('professionals.urls')),
]

# Serve media files in development
if settings.DEBUG and not settings.USE_S3:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
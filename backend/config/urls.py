"""
URL configuration for HolisticMatch project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import connection
from django.db.utils import OperationalError

class HealthCheckView(APIView):
    """Simple health check endpoint for load balancers"""
    def get(self, request):
        return Response({'status': 'ok', 'version': '2.0'})

class HealthCheckDetailedView(APIView):
    """Detailed health check with database verification"""
    def get(self, request):
        status = {'status': 'ok', 'database': 'unknown', 'timestamp': str(__import__('datetime').datetime.now())}
        
        # Check database connection
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
            status['database'] = 'connected'
        except OperationalError as e:
            status['database'] = f'error: {str(e)[:100]}'
            status['status'] = 'degraded'
        
        return Response(status)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('health/detailed/', HealthCheckDetailedView.as_view(), name='health-check-detailed'),
    path('api/v1/health/', HealthCheckView.as_view(), name='api-health-check'),
    path('api/v1/health/detailed/', HealthCheckDetailedView.as_view(), name='api-health-check-detailed'),
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/', include('professionals.urls')),
]

# Serve media files in development
if settings.DEBUG and not settings.USE_S3:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
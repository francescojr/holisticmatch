"""
URL configuration for HolisticMatch project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import connection
from django.db.utils import OperationalError
import os
import json

class HealthCheckView(APIView):
    """Simple health check endpoint for load balancers"""
    def get(self, request):  # noqa: ARG002
        return Response({'status': 'ok', 'version': '2.0'})

class HealthCheckDetailedView(APIView):
    """Detailed health check with database verification"""
    def get(self, request):  # noqa: ARG002
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

class SwaggerUIView(APIView):
    """Serve Swagger UI documentation"""
    def get(self, request):  # noqa: ARG002
        # Get the path to swagger-ui.html in the project root
        swagger_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'swagger-ui.html'
        )
        if os.path.exists(swagger_path):
            return FileResponse(open(swagger_path, 'rb'), content_type='text/html')
        return Response({'error': 'Swagger UI not found'}, status=404)

class OpenAPIJSONView(APIView):
    """Serve OpenAPI JSON spec"""
    def get(self, request):  # noqa: ARG002
        # Get the path to openapi.json in the project root
        spec_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'openapi.json'
        )
        if os.path.exists(spec_path):
            with open(spec_path, 'r', encoding='utf-8') as f:
                spec = json.load(f)
            return Response(spec, content_type='application/json')
        return Response({'error': 'OpenAPI spec not found'}, status=404)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('health/detailed/', HealthCheckDetailedView.as_view(), name='health-check-detailed'),
    path('api/v1/health/', HealthCheckView.as_view(), name='api-health-check'),
    path('api/v1/health/detailed/', HealthCheckDetailedView.as_view(), name='api-health-check-detailed'),
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/', include('professionals.urls')),
    # Documentation endpoints
    path('docs/', SwaggerUIView.as_view(), name='swagger-ui'),
    path('docs/swagger-ui/', SwaggerUIView.as_view(), name='swagger-ui-alt'),
    path('openapi.json', OpenAPIJSONView.as_view(), name='openapi-json'),
    path('api/v1/docs/', SwaggerUIView.as_view(), name='api-docs'),
    path('api/v1/openapi.json', OpenAPIJSONView.as_view(), name='api-openapi-json'),
]

# Serve media files in development
if settings.DEBUG and not settings.USE_S3:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
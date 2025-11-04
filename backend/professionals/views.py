"""
Views for the professionals app.
Implements API endpoints for professional profiles.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Professional
from .serializers import ProfessionalSerializer, ProfessionalSummarySerializer
from .filters import ProfessionalFilter
from .permissions import IsAuthenticatedAndOwnerOrReadOnly
from .constants import SERVICE_TYPES


class ProfessionalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Professional model
    Provides full CRUD operations with proper permissions
    """
    queryset = Professional.objects.all()
    serializer_class = ProfessionalSerializer
    permission_classes = [IsAuthenticatedAndOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProfessionalFilter

    def get_serializer_class(self):
        """Use summary serializer for list view"""
        if self.action == 'list':
            return ProfessionalSummarySerializer
        return ProfessionalSerializer

    def get_permissions(self):
        """
        Allow anyone to read, but require authentication for write operations
        """
        if self.action in ['list', 'retrieve', 'service_types']:
            # Allow anyone to read professionals and service types
            return [AllowAny()]
        else:
            # Require ownership for write operations (create, update, delete)
            return [IsAuthenticatedAndOwnerOrReadOnly()]

    def perform_create(self, serializer):
        """
        Associate the professional with the authenticated user
        """
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def service_types(self, request):
        """
        GET /api/professionals/service_types/
        Returns list of available service types
        """
        return Response(SERVICE_TYPES)

    @action(detail=True, methods=['post'], url_path='upload-photo')
    def upload_photo(self, request, pk=None):
        """
        POST /api/professionals/{id}/upload-photo/
        Upload profile photo for a professional
        """
        try:
            # Get professional without automatic permission check
            try:
                professional = Professional.objects.get(pk=pk)
            except Professional.DoesNotExist:
                return Response(
                    {'error': 'Profissional não encontrado'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if user owns this professional profile
            if professional.user != request.user:
                return Response(
                    {'error': 'Você só pode alterar sua própria foto'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Check if photo file is provided
            if 'photo' not in request.FILES:
                return Response(
                    {'error': 'Arquivo de foto é obrigatório'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            photo_file = request.FILES['photo']

            # Validate file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png']
            if photo_file.content_type not in allowed_types:
                return Response(
                    {'error': 'Foto deve ser JPG ou PNG'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate file size (5MB max)
            max_size = 5 * 1024 * 1024  # 5MB in bytes
            if photo_file.size > max_size:
                return Response(
                    {'error': 'Foto deve ter no máximo 5MB'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Delete old photo if exists
            if professional.photo:
                professional.photo.delete(save=False)

            # Save new photo
            professional.photo = photo_file
            professional.save()

            # Return success response with photo URL
            return Response({
                'message': 'Foto atualizada com sucesso',
                'photo_url': professional.photo_url
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error uploading photo: {str(e)}', exc_info=True)
            return Response(
                {'error': f'Erro ao fazer upload: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

"""
Custom validators for the professionals app.
Contains business logic validation functions.
"""
import re
from django.core.exceptions import ValidationError
from django.core.files.images import get_image_dimensions
from .constants import SERVICE_TYPES


def validate_phone_number(value):
    """
    Validate Brazilian phone number format.
    Accepts formats: (11) 99999-9999, 11999999999, +5511999999999
    """
    if not value:
        return  # Allow empty values for optional fields

    # Remove all non-digit characters
    clean_number = re.sub(r'\D', '', value)

    # Handle international format (+55)
    if clean_number.startswith('55') and len(clean_number) == 13:
        clean_number = clean_number[2:]  # Remove country code

    # Check if it's a valid Brazilian phone number
    # Landline: 10 digits (area code 2 + number 8)
    # Mobile: 11 digits (area code 2 + number 9, starting with 9)
    if len(clean_number) == 10:
        # Landline format: XX + 8 digits
        if not re.match(r'^[1-9][1-9][0-9]{8}$', clean_number):
            raise ValidationError(
                'Telefone fixo deve ter formato brasileiro válido (ex: (11) 3333-4444)'
            )
    elif len(clean_number) == 11:
        # Mobile format: XX + 9 digits, starting with 9
        if not re.match(r'^[1-9][1-9]9[0-9]{8}$', clean_number):
            raise ValidationError(
                'Telefone celular deve ter formato brasileiro válido (ex: (11) 99999-9999)'
            )
    else:
        raise ValidationError(
            'Telefone deve ter 10 dígitos (fixo) ou 11 dígitos (celular)'
        )


def validate_services(value):
    """
    Validate that services is a non-empty list with valid service types.
    """
    if not isinstance(value, list):
        raise ValidationError('Serviços deve ser uma lista')

    if not value:
        raise ValidationError('Pelo menos um serviço deve ser selecionado')

    if len(value) > 10:
        raise ValidationError('Máximo de 10 serviços permitidos')

    # Validate each service is in the allowed list
    invalid_services = [s for s in value if s not in SERVICE_TYPES]
    if invalid_services:
        raise ValidationError(
            f'Serviços inválidos: {", ".join(invalid_services)}. '
            f'Serviços permitidos: {", ".join(SERVICE_TYPES)}'
        )

    # Check for duplicates
    if len(value) != len(set(value)):
        raise ValidationError('Serviços não podem ser duplicados')


def validate_price_per_session(value):
    """
    Validate session price is reasonable.
    """
    if value <= 0:
        raise ValidationError('Preço deve ser maior que zero')

    if value > 5000:
        raise ValidationError('Preço parece muito alto (máximo: R$ 5.000,00)')

    # Check for reasonable minimum (R$ 10,00)
    if value < 10:
        raise ValidationError('Preço deve ser pelo menos R$ 10,00')


def validate_profile_photo(image):
    """
    Validate uploaded profile photo.
    """
    if not image:
        return  # Allow empty photos

    # Check file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB in bytes
    if image.size > max_size:
        raise ValidationError('Foto deve ter no máximo 5MB')

    # Check file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png']
    if hasattr(image, 'content_type') and image.content_type not in allowed_types:
        raise ValidationError('Foto deve ser JPG ou PNG')

    # Check image dimensions (optional - prevent extremely large images)
    try:
        width, height = get_image_dimensions(image)
        max_dimension = 4000  # Max 4000px in any dimension
        if width > max_dimension or height > max_dimension:
            raise ValidationError(f'Imagem muito grande (máx: {max_dimension}px)')
    except Exception:
        # If we can't get dimensions, let it pass (might be corrupted)
        pass


def validate_state_code(value):
    """
    Validate Brazilian state code (2 letters uppercase).
    """
    if not value:
        raise ValidationError('Estado é obrigatório')

    if len(value) != 2:
        raise ValidationError('Estado deve ter exatamente 2 letras')

    # Brazilian states
    valid_states = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ]

    if value.upper() not in valid_states:
        raise ValidationError(
            f'Estado inválido. Estados válidos: {", ".join(valid_states)}'
        )

    return value.upper()


def validate_name(value):
    """
    Validate professional name.
    """
    if not value or not value.strip():
        raise ValidationError('Nome é obrigatório')

    if len(value.strip()) < 3:
        raise ValidationError('Nome deve ter pelo menos 3 caracteres')

    if len(value) > 255:
        raise ValidationError('Nome deve ter no máximo 255 caracteres')

    # Check for reasonable characters (letters, spaces, accents)
    if not re.match(r'^[a-zA-ZÀ-ÿ\s\'-]+$', value):
        raise ValidationError('Nome deve conter apenas letras, espaços e acentos')


def validate_bio(value):
    """
    Validate professional bio.
    """
    if not value or not value.strip():
        raise ValidationError('Bio é obrigatória')

    if len(value.strip()) < 50:
        raise ValidationError('Bio deve ter pelo menos 50 caracteres')

    if len(value) > 2000:
        raise ValidationError('Bio deve ter no máximo 2000 caracteres')
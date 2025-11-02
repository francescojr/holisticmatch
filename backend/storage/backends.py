"""
Custom storage backends for AWS S3.
Handles file uploads to S3 for professional profile photos.
"""
from storages.backends.s3boto3 import S3Boto3Storage


class ProfilePhotoStorage(S3Boto3Storage):
    """
    Custom storage for professional profile photos.
    Uploads to S3 with public-read ACL.
    """
    location = ''  # Root of bucket, not 'photos/'
    default_acl = 'public-read'
    file_overwrite = False
    custom_domain = False
    querystring_auth = False  # Don't use signed URLs for public objects

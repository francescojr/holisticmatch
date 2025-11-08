"""
Custom Email Backend for Resend API Integration with Django
"""
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
import logging
import os

logger = logging.getLogger('professionals')


class ResendEmailBackend(BaseEmailBackend):
    """
    Email backend that sends emails via Resend API
    Uses resend==2.19.0 Python SDK
    """
    
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently)
        self.fail_silently = fail_silently
        
        # Set API key from environment or settings
        self.api_key = os.environ.get('RESEND_API_KEY') or getattr(settings, 'RESEND_API_KEY', None)
        
        if not self.api_key:
            logger.warning("RESEND_API_KEY not found in environment or settings")
            self.api_key = None
            return
        
        # Verify resend package is available
        try:
            import resend
            self.resend = resend
            logger.info("Resend package imported successfully")
        except ImportError as exc:
            if not fail_silently:
                raise ImportError("Resend package not installed") from exc
            self.resend = None
            logger.error("Failed to import Resend package")
    
    def send_messages(self, email_messages):
        """
        Send one or more EmailMessage objects and return the number of email
        messages sent.
        """
        if not email_messages:
            return 0
        
        msg_count = 0
        
        for message in email_messages:
            try:
                sent = self._send(message)
                if sent:
                    msg_count += 1
            except Exception as exc:
                if not self.fail_silently:
                    raise
                logger.error("Error sending email via Resend: %s", str(exc))
        
        return msg_count
    
    def _send(self, message):
        """
        Send a single EmailMessage object via Resend
        """
        if not self.resend or not self.api_key:
            logger.error("Resend not initialized or API key missing")
            return False
        
        try:
            # Set API key in environment for resend to use
            os.environ['RESEND_API_KEY'] = self.api_key
            
            # Prepare email payload using Resend's format
            email_params = {
                'from': message.from_email or settings.DEFAULT_FROM_EMAIL,
                'to': ', '.join(message.to) if isinstance(message.to, list) else message.to,
                'subject': message.subject,
                'html': message.body,
            }
            
            logger.info("📧 Sending email via Resend to: %s", str(message.to))
            logger.info("📧 From: %s", email_params['from'])
            logger.info("📧 Subject: %s", email_params['subject'])
            
            # Call Resend API - use the Emails class directly
            response = self.resend.Emails.send(**email_params)
            
            logger.info("✅ Email sent successfully via Resend. Response: %s", str(response))
            return True
            
        except Exception as exc:
            logger.error("❌ Failed to send email via Resend: %s", str(exc), exc_info=True)
            if not self.fail_silently:
                raise
            return False


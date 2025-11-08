"""
Custom Email Backend for Resend API Integration with Django
"""
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
import logging

logger = logging.getLogger('professionals')


class ResendEmailBackend(BaseEmailBackend):
    """
    Email backend that sends emails via Resend API
    Uses resend==2.19.0 Python SDK
    """
    
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently)
        self.fail_silently = fail_silently
        
        # Import Resend - set API key via environment or config
        try:
            import os
            os.environ['RESEND_API_KEY'] = settings.RESEND_API_KEY
            from resend.emails import send as resend_send
            self.resend_send = resend_send
        except (ImportError, AttributeError) as exc:
            if not fail_silently:
                raise ImportError("Resend package not installed or incompatible version") from exc
            self.resend_send = None
    
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
        if not self.resend_send:
            logger.warning("Resend send function not initialized")
            return False
        
        if not settings.RESEND_API_KEY:
            logger.error("RESEND_API_KEY not configured")
            return False
        
        try:
            # Prepare email data using resend SDK format
            email_data = {
                'from': message.from_email or settings.DEFAULT_FROM_EMAIL,
                'to': message.to,  # List of recipients
                'subject': message.subject,
                'html': message.body,  # Use body as HTML for now
            }
            
            logger.info("Resend: Sending email to %s", str(message.to))
            logger.info("Resend: From: %s", email_data['from'])
            
            # Send via Resend using the send function
            response = self.resend_send(email_data)
            
            logger.info("Resend: Email sent successfully. Response: %s", str(response))
            return True
            
        except Exception as exc:
            logger.error("Resend: Failed to send email: %s", str(exc), exc_info=True)
            if not self.fail_silently:
                raise
            return False


"""
Custom Email Backend for Resend API Integration with Django
Resend 2.19.0 - Uses Emails.send(SendParams) method
"""

# force push :)

from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
import logging
import os

logger = logging.getLogger('professionals')


class ResendEmailBackend(BaseEmailBackend):
    """
    Email backend that sends emails via Resend API
    Uses resend==2.19.0 Python SDK with Emails.SendParams
    """
    
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently)
        self.fail_silently = fail_silently
        
        # Set API key from environment (priority) or settings
        self.api_key = os.environ.get('RESEND_API_KEY') or getattr(settings, 'RESEND_API_KEY', None)
        
        if not self.api_key:
            logger.error("❌ RESEND_API_KEY not configured!")
            if not fail_silently:
                raise ValueError("RESEND_API_KEY must be configured")
            return
        
        logger.info("✅ RESEND_API_KEY configured from environment/settings")
    
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
                logger.error("❌ Error sending email via Resend: %s", str(exc), exc_info=True)
        
        return msg_count
    
    def _send(self, message):
        """
        Send a single EmailMessage object via Resend
        """
        if not self.api_key:
            logger.error("❌ RESEND_API_KEY not configured")
            return False
        
        try:
            from resend import Emails
            
            # Prepare recipients - convert to list if needed
            recipients = message.to
            if isinstance(recipients, str):
                recipients = [recipients]
            
            # Log the attempt
            logger.info("📧 Attempting to send email via Resend")
            logger.info("📧 To: %s", recipients)
            logger.info("📧 From: %s", message.from_email)
            logger.info("📧 Subject: %s", message.subject)
            
            # Extract HTML or text content
            # Django stores HTML in alternatives when using EmailMessage with html_message param
            html_content = None
            text_content = message.body
            
            # Check if there are alternatives (HTML version)
            if hasattr(message, 'alternatives'):
                for alternative, mimetype in message.alternatives:
                    if mimetype == "text/html":
                        html_content = alternative
                        break
            
            # Resend requires either html or text
            email_params = {
                "from": message.from_email,
                "to": recipients,
                "subject": message.subject,
                "track_opens": True,  # Enable open tracking
                "track_clicks": True,  # Enable click tracking
            }
            
            # Add HTML if available, otherwise use text
            if html_content:
                email_params["html"] = html_content
                logger.info("📧 Using HTML content with open tracking enabled")
            else:
                email_params["text"] = text_content
                logger.info("📧 Using text content")
            
            logger.info("📧 Email params keys: %s", list(email_params.keys()))
            
            # Call Resend API with proper params
            response = Emails.send(email_params)
            
            logger.info("✅ Email sent successfully! Response ID: %s", response.get('id'))
            return True
            
        except Exception as exc:
            logger.error("❌ Failed to send email via Resend: %s", str(exc), exc_info=True)
            if not self.fail_silently:
                raise
            return False


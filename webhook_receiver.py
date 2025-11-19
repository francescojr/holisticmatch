#!/usr/bin/env python3
import json
import subprocess
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 9000

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Log incoming request
            print(f'[{self.command}] {self.path} - Content-Length: {content_length}', file=sys.stderr)
            
            if content_length > 0:
                payload = json.loads(body)
                print(f'Payload: {payload}', file=sys.stderr)
                
                if payload.get('ref') == 'refs/heads/main':
                    print('✅ Deploying...', file=sys.stderr)
                    self.send_response(202)
                    self.end_headers()
                    self.wfile.write(b'Deploying...')
                    
                    # Trigger deploy in background (already running as root)
                    with open('/tmp/holisticmatch-deploy.log', 'a', encoding='utf-8') as logfile:
                        subprocess.Popen(['/tmp/deploy.sh'], 
                                       stdout=logfile, 
                                       stderr=subprocess.STDOUT,
                                       stdin=subprocess.DEVNULL)
                else:
                    print(f'⚠️  Wrong ref: {payload.get("ref")}', file=sys.stderr)
                    self.send_response(200)
                    self.end_headers()
            else:
                print('Empty body', file=sys.stderr)
                self.send_response(400)
                self.end_headers()
                
        except Exception as err:  # pylint: disable=broad-exception-caught
            print(f'❌ Error: {type(err).__name__}: {err}', file=sys.stderr)
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f'Error: {str(err)}'.encode())

    def log_message(self, msg, *args):  # pylint: disable=unused-argument
        pass

if __name__ == '__main__':
    server = HTTPServer(('127.0.0.1', PORT), WebhookHandler)
    print(f'🚀 Webhook listening on localhost:{PORT}', file=sys.stderr)
    sys.stderr.flush()
    server.serve_forever()

#!/usr/bin/env python3
import subprocess
import sys
from pathlib import Path

KEY_PATH = Path(r"e:\datajack\holisticmatch\hollistickeypair.pem")
IP = "44.197.112.222"
USER = "ubuntu"

# Converter caminho Windows para formato que SSH entende
key_path_str = str(KEY_PATH)

commands = [
    "cd /var/app/current/backend",
    "echo '📊 Antes da limpeza:'",
    "find . -type f -name '*.pyc' 2>/dev/null | wc -l | xargs echo '   - Arquivos .pyc:'",
    "find . -type d -name '__pycache__' 2>/dev/null | wc -l | xargs echo '   - Diretórios __pycache__:'",
    "",
    "echo '🧹 Limpando cache...'",
    "find . -type f -name '*.pyc' -delete 2>/dev/null",
    "find . -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true",
    "",
    "echo '✅ Cache limpo'",
    "",
    "echo '📊 Depois da limpeza:'",
    "find . -type f -name '*.pyc' 2>/dev/null | wc -l | xargs echo '   - Arquivos .pyc:'",
    "find . -type d -name '__pycache__' 2>/dev/null | wc -l | xargs echo '   - Diretórios __pycache__:'",
    "",
    "echo '🔄 Reiniciando Gunicorn...'",
    "sudo systemctl restart gunicorn",
    "sleep 3",
    "",
    "echo '✅ Gunicorn reiniciado'",
    "",
    "echo '🧪 Testando API...'",
    "curl -s http://localhost:8000/api/v1/professionals/ 2>/dev/null | grep -o '\"is_active\":[^,]*' | head -2",
    "",
    "echo '✨ Limpeza concluída!'"
]

cmd_str = " ; ".join(commands)
ssh_cmd = [
    "ssh",
    "-i", key_path_str,
    f"{USER}@{IP}",
    cmd_str
]

print(f"🚀 Conectando a {IP} e limpando cache...")
print(f"Comando SSH: ssh -i {key_path_str} {USER}@{IP}")
print("")

try:
    result = subprocess.run(ssh_cmd, capture_output=True, text=True, timeout=120)
    print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)
    print(f"\n✅ Processo concluído com code: {result.returncode}")
except subprocess.TimeoutExpired:
    print("❌ Conexão expirou")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erro: {e}")
    sys.exit(1)

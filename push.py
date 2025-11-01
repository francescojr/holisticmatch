#!/usr/bin/env python3
import subprocess
import sys

try:
    # Make commit
    subprocess.run(['git', 'add', 'frontend/src/services/professionalService.ts'], check=True, cwd='.')
    subprocess.run(['git', 'commit', '-m', 'fix: remove v1 from service endpoints for vercel rewrite'], check=True, cwd='.')
    
    # Push to origin main
    result = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True, cwd='.')
    
    print("✅ Push realizado com sucesso!")
    print(result.stdout)
    if result.returncode != 0:
        print("Erro:", result.stderr)
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Erro: {e}")
    sys.exit(1)

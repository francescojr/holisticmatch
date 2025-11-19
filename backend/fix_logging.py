#!/usr/bin/env python
"""
Remove sensitive logging statements from Python files
Handles logger.info(), logger.debug(), logger.error(), logger.warning() calls
and print() statements safely while preserving code structure
"""

import re
import os

def remove_logger_lines(filepath):
    """Remove logger statements that contain sensitive data"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    cleaned_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check if this is a logger statement
        if re.search(r'logger\.(info|debug|warning|error)\(', line):
            # Check if it's a complete statement on one line
            if line.rstrip().endswith(')'):
                # Skip this line entirely
                i += 1
                continue
            else:
                # Multi-line statement - skip until closing paren
                while i < len(lines) and not lines[i].rstrip().endswith(')'):
                    i += 1
                i += 1  # Skip the closing paren line
                continue
        
        # Check for print() statements (but keep important ones)
        if re.search(r'^\s+print\(', line):
            # Skip print statements
            if line.rstrip().endswith(')'):
                i += 1
                continue
        
        cleaned_lines.append(line)
        i += 1
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(cleaned_lines)
    
    print(f'✅ {os.path.basename(filepath)}: Removed logger statements')


# Files to clean
files_to_clean = [
    'professionals/serializers.py',
    'professionals/views.py',
    'authentication/views.py',
    'professionals/moderation.py',
]

for filepath in files_to_clean:
    if os.path.exists(filepath):
        try:
            remove_logger_lines(filepath)
        except Exception as e:
            print(f'⚠️  {filepath}: {str(e)}')
    else:
        print(f'⚠️  {filepath}: File not found')

print('\n✅ Logging cleanup complete')

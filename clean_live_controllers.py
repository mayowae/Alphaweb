import os
import glob
import re

live_files = glob.glob('live_*.js')

for filepath in live_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace any sequence of 3 or more newlines with a double newline
    # and 2 newlines with a single newline if it is a double newline artifact
    # Let's check if the file has a lot of empty lines (i.e. every other line is empty)
    lines = content.splitlines()
    empty_count = sum(1 for line in lines if not line.strip())
    
    if empty_count > len(lines) * 0.4:  # If more than 40% of lines are empty
        print(f"Cleaning formatting artifact in {filepath}...")
        
        # We want to remove the alternating empty lines.
        # Let's merge every odd blank line back or filter out every empty line that alternates
        cleaned_lines = []
        for i, line in enumerate(lines):
            # If the line is empty and the previous line was not empty, it's probably an artifact.
            # But let's be safe: let's filter out consecutive blank lines, leaving only single ones where appropriate.
            if i > 0 and not line.strip() and not lines[i-1].strip():
                continue
            # If every odd line is empty, let's reconstruct:
            cleaned_lines.append(line)
            
        # Write back
        new_content = '\n'.join(cleaned_lines)
        
        # Let's do a strict check: if every second line is empty, let's filter out alternating empty lines
        strict_cleaned = []
        is_alternating = True
        for i in range(1, len(lines), 2):
            if lines[i].strip():
                is_alternating = False
                break
        
        if is_alternating:
            print(f"Detected strict alternating empty lines in {filepath}. Filtering...")
            for i in range(0, len(lines), 2):
                strict_cleaned.append(lines[i])
            new_content = '\n'.join(strict_cleaned)
            
        # Re-save the file with clean single newlines
        with open(filepath, 'w', encoding='utf-8', newline='') as out_f:
            out_f.write(new_content)
        print(f"Successfully cleaned {filepath}!")

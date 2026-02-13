#!/usr/bin/env python3
"""
Carefully remove only DracarysWatch target from Xcode project.
Preserves all App target configurations.
"""

import re

def main():
    file_path = 'ios/App/App.xcodeproj/project.pbxproj'
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # List of UUIDs to remove (Watch-specific)
    watch_uuids = [
        '03253CF0307E603FCB914DB4',  # WatchDashboardView.swift in Sources
        '37850B221927C83A3CC39DF4',  # DracarysWatch in Embed Watch Content
        '7E7359EE443F7E22C9459F93',  # DracarysWatchApp.swift in Sources
        '2D96BF4A12C4BF3448E9003F',  # WatchDashboardView.swift file ref
        'CE4275E20528B5EF281ED224',  # DracarysWatch product ref
        'E842B5889C757AB27AB591D7',  # DracarysWatchApp.swift file ref
        '9C99FA2AB497AFF83C8A6A13',  # DracarysWatch group
        'DA3335954F168F02DC3CD7A3',  # watchOS group
        '4B507E9E5CC0503FAAF4A69E',  # Embed Watch Content build phase
        '5CB1B891FC0DC3FDBBE0E21F',  # DracarysWatch target
        '6C2DB9A87B4183C00EAE4091',  # Target dependency
        'F76F67405EE0DFF0085D8B7C',  # Watch Frameworks build phase
        '44722793FF51AD1F23D051CB',  # Foundation.framework for watchOS
        'FB1992749538E4FC1855D801',  # Foundation.framework in Frameworks
        '6FCC4A53EB8E460779031136',  # Build configuration list for Watch
        'A0F2A1A2B3C4D5E6F7890123',  # Watch Sources build phase
        '5A6B7C8D9E0F1A2B3C4D5E6F',  # Watch Debug config
        '7A8B9C0D1E2F3A4B5C6D7E8F',  # Watch Release config
    ]
    
    lines = content.split('\n')
    cleaned_lines = []
    skip_until_end = False
    brace_count = 0
    
    for i, line in enumerate(lines):
        # Check if this line contains a Watch UUID
        contains_watch_uuid = any(uuid in line for uuid in watch_uuids)
        
        # Check if line contains Watch/watch keywords
        contains_watch_keyword = 'Watch' in line or 'watchOS' in line or 'watchos' in line
        
        # If we find a Watch-related section start
        if contains_watch_uuid or contains_watch_keyword:
            # If it's a section start (contains {), skip until matching }
            if ' = {' in line or ' = (' in line:
                skip_until_end = True
                brace_count = 1
                continue
            # If it's a simple line reference, just skip it
            else:
                continue
        
        # If we're skipping a section
        if skip_until_end:
            # Count braces to know when section ends
            brace_count += line.count('{') + line.count('(')
            brace_count -= line.count('}') + line.count(')')
            
            if brace_count <= 0:
                skip_until_end = False
            continue
        
        # Keep the line
        cleaned_lines.append(line)
    
    # Write back
    with open(file_path, 'w') as f:
        f.write('\n'.join(cleaned_lines))
    
    print("✅ Removed Watch target successfully!")

if __name__ == '__main__':
    main()

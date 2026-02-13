#!/usr/bin/env python3
"""
Script to remove all DracarysWatch references from Xcode project.pbxproj file.
This preserves the file structure while removing Watch-related targets and configurations.
"""

import re
import sys

def remove_watch_references(content):
    """Remove all Watch-related references from project.pbxproj content."""
    
    # Remove entire PBXBuildFile entries containing Watch references
    content = re.sub(r'\t\t[A-F0-9]+ /\* .*Watch.* \*/ = \{isa = PBXBuildFile;[^}]+\};\n', '', content)
    
    # Remove entire PBXFileReference entries containing Watch references
    content = re.sub(r'\t\t[A-F0-9]+ /\* .*Watch.* \*/ = \{isa = PBXFileReference;[^}]+\};\n', '', content)
    content = re.sub(r'\t\t[A-F0-9]+ /\* Foundation\.framework \*/ = \{isa = PBXFileReference;.*WatchOS\.platform.*\};\n', '', content)
    
    # Remove PBXContainerItemProxy sections
    content = re.sub(r'\t\t[A-F0-9]+ /\* PBXContainerItemProxy \*/ = \{\n\t\t\tisa = PBXContainerItemProxy;\n(?:.*\n)*?\t\t\};\n', '', content)
    
    # Remove PBXCopyFilesBuildPhase for Watch
    content = re.sub(r'\t\t[A-F0-9]+ /\* Embed Watch Content \*/ = \{\n(?:.*\n)*?\t\t\};\n', '', content)
    
    # Remove PBXGroup for Watch
    content = re.sub(r'\t\t[A-F0-9]+ /\* (?:DracarysWatch|watchOS) \*/ = \{\n(?:.*\n)*?\t\t\};\n', '', content)
    
    # Remove PBXNativeTarget for Watch
    content = re.sub(r'\t\t[A-F0-9]+ /\* DracarysWatch \*/ = \{\n\t\t\tisa = PBXNativeTarget;\n(?:.*\n)*?\t\t\};\n', '', content)
    
    # Remove PBXSourcesBuildPhase for Watch
    content = re.sub(r'\t\t[A-F0-9]+ /\* Sources \*/ = \{\n\t\t\tisa = PBXSourcesBuildPhase;\n\t\t\tbuildActionMask = [0-9]+;\n\t\t\tfiles = \(\n(?:\t\t\t\t[A-F0-9]+ /\* .*Watch.* \*/,\n)*\t\t\t\);\n\t\t\trunOnlyForDeploymentPostprocessing = 0;\n\t\t\};\n', '', content)
    
    # Remove PBXTargetDependency
    content = re.sub(r'\t\t[A-F0-9]+ /\* PBXTargetDependency \*/ = \{\n(?:.*\n)*?\t\t\};\n', '', content)
    
    # Remove XCBuildConfiguration for Watch (both Debug and Release)
    content = re.sub(r'\t\t[A-F0-9]+ /\* (?:Debug|Release) \*/ = \{\n\t\t\tisa = XCBuildConfiguration;\n(?:.*\n)*?\t\t\t\tINFOPLIST_FILE = DracarysWatch/Info\.plist;\n(?:.*\n)*?\t\t\};\n', '', content)
    
    # Remove XCConfigurationList for Watch
    content = re.sub(r'\t\t[A-F0-9]+ /\* Build configuration list for PBXNativeTarget "DracarysWatch" \*/ = \{\n(?:.*\n)*?\t\t\};\n', '', content)
    
    # Remove Watch references from arrays
    content = re.sub(r'\t\t\t\t[A-F0-9]+ /\* .*Watch.* \*/,\n', '', content)
    
    # Remove PBXFrameworksBuildPhase for Watch
    content = re.sub(r'\t\t[A-F0-9]+ /\* Frameworks \*/ = \{\n\t\t\tisa = PBXFrameworksBuildPhase;\n\t\t\tbuildActionMask = [0-9]+;\n\t\t\tfiles = \(\n\t\t\t\t[A-F0-9]+ /\* Foundation\.framework in Frameworks \*/,\n\t\t\t\);\n\t\t\trunOnlyForDeploymentPostprocessing = 0;\n\t\t\};\n', '', content)
    
    return content

def main():
    file_path = 'ios/App/App.xcodeproj/project.pbxproj'
    
    print(f"Reading {file_path}...")
    with open(file_path, 'r') as f:
        content = f.read()
    
    print("Removing Watch references...")
    cleaned_content = remove_watch_references(content)
    
    print(f"Writing cleaned content back to {file_path}...")
    with open(file_path, 'w') as f:
        f.write(cleaned_content)
    
    print("✅ Successfully removed all Watch references!")
    
    # Verify
    if 'Watch' in cleaned_content or 'watch' in cleaned_content:
        print("⚠️  Warning: Some watch references may still remain")
        return 1
    else:
        print("✅ Verification passed: No watch references found")
        return 0

if __name__ == '__main__':
    sys.exit(main())

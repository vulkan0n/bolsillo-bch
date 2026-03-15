#!/bin/sh
# Fix readlink call in Pods framework script for CI archive builds
# Execute from project root
sed -i.bak 's/source="$(readlink "${source}")"/source="$(readlink -f "${source}")"/' 'ios/App/Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh' && rm -f 'ios/App/Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh.bak'

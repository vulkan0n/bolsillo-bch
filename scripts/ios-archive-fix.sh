#!/bin/sh
# user should execute from scripts dir
CWD=$(pwd)
cd ../ios/App/fastlane
sed -i.bak 's/source="$(readlink "${source}")"/source="$(readlink -f "${source}")"/' '../Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh' && rm -f '../Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh.bak'
cd $CWD

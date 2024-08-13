#!/bin/bash

# Exit if any command fails and ensure cleanup
set -e
trap 'echo "An error occurred."; exit 1' ERR

#Node version
node -v

# Install all the packages
npm i

# Build the package
npm run build

# Create a package
PACKAGE_FILE=$(npm pack)
echo "Package $PACKAGE_FILE created!"

# Install the package globally
npm install -g "$PACKAGE_FILE"
echo "fdk-cli has been installed globally!"

# Verify installation
fdk --version

# Cleanup
rm "$PACKAGE_FILE"
echo "Cleanup completed!"
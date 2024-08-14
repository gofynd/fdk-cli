#!/bin/bash

# Exit if any command fails and ensure cleanup
set -e
trap 'echo "An error occurred."; exit 1' ERR

# Store the original directory
ORIGINAL_DIR=$(pwd)

# Branch or tag name as the first argument
BRANCH_OR_TAG=${1:-master}

# Directory name for the cloned repo
REPO_DIR=fdk-cli

# Clone the repository
git clone https://github.com/gofynd/fdk-cli.git "$REPO_DIR"
cd "$REPO_DIR"

# Checkout the specified branch or tag
git checkout "$BRANCH_OR_TAG"

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
cd ..
rm -rf "$REPO_DIR"
cleanup


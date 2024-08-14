#!/bin/bash

# Use below command to install fdk cli using this script
# Install from specific branch or tag
# curl -s https://raw.githubusercontent.com/gofynd/fdk-cli/master/scripts/remoteInstall.sh 2>&1 | sh -s -- <branch_or_tag_name>

# Exit if any command fails and ensure cleanup
set -e
trap cleanup ERR

# Function to cleanup on error or successful completion
cleanup() {
    echo "Cleaning up..."
    # Navigate to the original directory and remove the cloned repo if it exists
    cd "$ORIGINAL_DIR"
    [[ -d "$REPO_DIR" ]] && rm -rf "$REPO_DIR"
    echo "Cleanup completed!"
    # Exit if called by the trap on error
    [[ "$1" == "error" ]] && exit 1
}

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
cleanup


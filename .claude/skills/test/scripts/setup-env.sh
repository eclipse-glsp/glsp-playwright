#!/usr/bin/env bash
# Setup script for GLSP Playwright test environment.
# Ensures repositories are cloned/built and generates a .env file
# in examples/workflow-test/ with the correct values.
#
# Usage: bash .claude/skills/test/scripts/setup-env.sh [--protocol ssh|https]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
WORKFLOW_TEST_DIR="$ROOT_DIR/examples/workflow-test"
REPO_DIR="$WORKFLOW_TEST_DIR/repositories"
ENV_FILE="$WORKFLOW_TEST_DIR/.env"

# Parse arguments
PROTOCOL_VALUE="https"
BRANCH_VALUE=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --protocol)
            PROTOCOL_VALUE="${2:-https}"
            shift 2
            ;;
        --branch)
            BRANCH_VALUE="${2:-}"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# --- Step 1: Prepare repositories if needed ---
# Check if the glsp-client repo exists and has been built
if [ ! -d "$REPO_DIR/glsp-client/examples/workflow-standalone/app" ]; then
    echo "Repositories not found or not built. Running 'yarn repo prepare'..."
    cd "$ROOT_DIR"
    BRANCH_ARG=""
    if [ -n "$BRANCH_VALUE" ]; then
        BRANCH_ARG="--branch $BRANCH_VALUE"
    fi
    yarn repo prepare --protocol "$PROTOCOL_VALUE" $BRANCH_ARG
else
    echo "Repositories already prepared."
fi

# --- Step 2: Generate .env file ---
echo "Generating .env file at $ENV_FILE..."

cd "$ROOT_DIR"
STANDALONE_URL="$(yarn -s repo client url)"
VSCODE_VSIX_PATH="$(yarn -s repo vscode-integration vsixPath)"

cat > "$ENV_FILE" <<EOF
GLSP_SERVER_DEBUG="true"
GLSP_SERVER_PORT="8081"
GLSP_SERVER_PLAYWRIGHT_MANAGED="true"
GLSP_WEBSOCKET_PATH="workflow"
GLSP_SERVER_TYPE="node"

# Integration URLs
STANDALONE_URL="$STANDALONE_URL"
THEIA_URL="http://localhost:3000"

# VSCode
VSCODE_VSIX_ID="eclipse-glsp.workflow-vscode-example"
VSCODE_VSIX_PATH="$VSCODE_VSIX_PATH"

# Server start command (used by Playwright to manage the server)
GLSP_SERVER_START_COMMAND="yarn repo node-server start"
EOF

echo "Environment setup complete. .env written to $ENV_FILE"

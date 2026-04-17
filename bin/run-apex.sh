#!/bin/bash

# Check if an Apex file path is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <apex_file_path> [org_alias]"
  echo "Example: $0 scripts/apex/loadMessages.apex my-dev-org"
  exit 1
fi

APEX_FILE="$1"
ORG_ALIAS="${2:-mdn@nca.com}" # Default to mdn@nca.com if no alias is provided

echo "Running Apex script: $APEX_FILE on org: $ORG_ALIAS"
sf apex run --file "$APEX_FILE" -o "$ORG_ALIAS"

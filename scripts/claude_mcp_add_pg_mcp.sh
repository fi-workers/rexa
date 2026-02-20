#!/usr/bin/env bash
set -euo pipefail

URL="${PG_MCP_URL:-http://localhost:8003/sse}"
NAME="${MCP_NAME:-pg-mcp}"

if ! command -v claude >/dev/null 2>&1; then
  echo "ERROR: claude CLI not found in PATH"
  exit 1
fi

echo "Registering MCP server in Claude Code..."
echo "- name: $NAME"
echo "- url:  $URL"

claude mcp add --transport http "$NAME" "$URL"

echo "OK"

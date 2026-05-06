# Connecting Cursor to Slack via MCP

**Posted by:** Michael Norton  
**Date:** April 23, 2026  
**Channel:** #nortons-cursor-academy

---

## What I was trying to do

I wanted Cursor's AI agent to be able to read and search Slack messages directly — no copy-pasting, no context switching. The goal: ask Cursor "what's in #nortons-cursor-academy?" and get a real answer.

---

## The Setup: Slack MCP Server

Cursor supports MCP (Model Context Protocol) servers — external tools the AI agent can call during a conversation. Slack publishes an official one at `https://mcp.slack.com/mcp`.

MCP servers are configured in `~/.cursor/mcp.json`. Here's what I added:

```json
"slack": {
  "url": "https://mcp.slack.com/mcp",
  "auth": {
    "CLIENT_ID": "188160004832.9210129962818"
  }
}
```

After adding it, I had Cursor restart itself (yes, the agent can do that):

```
osascript -e 'quit app "Cursor"' && sleep 2 && open -a Cursor
```

---

## The Auth Flow

Once Cursor restarted, the agent tried to authenticate both the new Slack MCP server and two existing ones (`plugin-slack-slack` and `user-slack`). Each calls an `mcp_auth` tool which triggers an OAuth browser flow.

For the new `https://mcp.slack.com/mcp` server, the browser opened a page to **request Cursor access to the Slack workspace** — which requires admin approval. So now we wait.

---

## Current State

| Step | Status |
|------|--------|
| Add `slack` MCP server to `mcp.json` | ✅ Done |
| Restart Cursor | ✅ Done |
| Trigger OAuth auth flow | ✅ Done |
| Slack workspace admin approves | ⏳ Pending |
| Agent searches `#nortons-cursor-academy` | 🔜 Coming soon |

---

## Why this is cool

Once approved, the Cursor agent will be able to:
- Search messages across channels
- Read thread context
- Surface information from Slack without leaving the IDE

No more "let me check Slack" interruptions mid-coding session.

---

## Try it yourself

1. Open `~/.cursor/mcp.json`
2. Add the `slack` server block above
3. Restart Cursor
4. Ask the agent to search a Slack channel — it'll trigger the auth flow automatically

> **Note:** You'll need your Slack workspace admin to approve the OAuth request before the tools become available.

# Agent World

A 2D virtual office that visualizes the AI coding agents running on **your** machine.
Every project gets its own room, every agent is a little bot at a desk, and you walk around the
building yourself, watch what the agents are doing, read their achievements, give them commands in a chat window, or (gently) fire them.

> **Heads-up:** the UI text is currently in Indonesian (Bahasa Indonesia). The code, API and this README are in English.

```
┌──────────────┬──────────────┬──────────────┐
│  Project A   │  Project B   │  Project C   │   3 project rooms per floor
│  (Finance)   │  (IT Support)│  (AI Lab)    │   bots dress for the project's work
├──────────────┴──────────────┴──────────────┤
│                  hall                      │
├────────────┬────────┬──────┬───────────────┤
│  Fun Area  │ Toilet │ Lift │ Your office   │   idle agents hang out here
└────────────┴────────┴──────┴───────────────┘   (your office is on floor 2)
```

## Features

- **Agents discovered automatically** from Claude Code sessions (live and historical, plus their subagents) and Antigravity history.
- **One room per project**, grouped by working folder. Git worktrees created by Orca are folded into their parent project.
- **One building floor = 5 rooms** (3 project rooms, a Fun Area and a Toilet). Extra projects go to further floors; you travel between floors with the **lift**.
- **Live behaviour**
  - Working agents sit at their desk and type (the tool they are using is shown, e.g. `✎ Edit main.js`; working subagents appear as mini-bots linked to the desk).
  - Idle agents relax in the Fun Area (ping-pong, coffee, sofa, chat) and occasionally visit the Toilet.
  - Sleeping (offline, >24 h) agents doze at their desk.
  - Agents that **finished** or **asked you a question** walk over to you and wave or cheer (detected from the end of the session transcript).
- **Outfits by project**: bots dress for the project they work on (finance suit for a `cash` project, IT-support polo and headset for `tiket`/`ticket`, lab coat for AI projects, …). The keyword rules live in `ROLE_RULES` in `public/js/core.js`.
- **You are a character**: walk with `WASD` / arrow keys (hold `Shift` to run), collide with walls and furniture, ride the lift between floors.
- **Project monitor** in every project room: click it for the project's task summary and PRD / README excerpts.
- **Achievements**: click an agent to see a high-level outline of the tasks it has worked on (taken from its transcript).
- **Fire an agent**: the agent defends itself and makes you look at its achievements first (enforced by the server). Firing is a *soft delete* (see below) and can be undone.
- **Security guards** in every project room and in the Fun Area:
  - keep agents of different projects from chatting / working together (different-project visitors are stopped at the door);
  - run a lightweight static security scan of the project's source code (secrets, injection patterns, `eval`, disabled TLS, …). Click a guard or the console to read the report.
- **Chat with an agent** directly from the UI (Claude Code agents only), streamed like a conversation. See [Chat](#chat-with-agents).

## Requirements

- **Node.js 20+** (no npm dependencies, nothing to install).
- **Claude Code** installed and logged in, if you want agents to appear and to use the chat feature. Agents are read from `~/.claude`.
- Developed and tested on **Windows 11**. macOS / Linux should mostly work (paths are handled generically) but are untested.

## Quick start

```bash
git clone <this repo>
cd agent-world
node server.js        # or: npm start
```

Open <http://localhost:4173>.

| Environment variable | Default | Purpose |
|---|---|---|
| `PORT` | `4173` | HTTP port (always bound to `127.0.0.1`). |
| `CLAUDE_BIN` | auto-detected | Path to the `claude` executable used by the chat feature (falls back to `~/.local/bin/claude[.exe]`, then `claude` on `PATH`). |

## Controls

| Input | Action |
|---|---|
| `W A S D` / arrow keys | Walk (hold `Shift` to run) |
| `C` | Toggle "follow my character" camera |
| Drag / mouse wheel | Pan / zoom |
| Click an agent | Details, achievements, chat, fire |
| Click the wall monitor | Project summary (tasks + PRD / README) |
| Click a guard or the server console (🛡) | Security report |
| Walk into the lift | Choose a floor (or press `1`-`9`) |
| `Esc` | Close panels |

Header buttons: *Follow character*, *View whole floor*, *Fired* (restore dismissed agents), *Demo calls* (preview agents walking to you).

## How it works

`server.js` is a tiny dependency-free Node HTTP server that scans your machine every 2 s and serves a static canvas front-end.

Data sources (all **read-only**):

| Source | Used for |
|---|---|
| `~/.claude/sessions/*.json` | Live sessions: name, working folder, `busy` / `idle`, process id |
| `~/.claude/projects/**/*.jsonl` | Transcripts: title, last turn (finished / asking), current tool, subagents, achievements |
| `~/.gemini/antigravity-cli/history.jsonl` | Antigravity workspaces |

Only the head and tail of each transcript are parsed for the live view. Achievements stream the whole transcript on demand and keep only short outlines (never full content).

### Agent status

| Status | Meaning | Where the bot is |
|---|---|---|
| `busy` | live session currently working | at its desk |
| `idle` | live session waiting for input | Fun Area / Toilet |
| `recent` | transcript touched in the last 24 h | Fun Area / Toilet |
| `sleeping` | older than 24 h | dozing at its desk |

An agent is "calling" you when its last assistant turn (within 30 minutes) ended without a tool call (*finished*) or with a question / `AskUserQuestion` (*asking*).

### HTTP API (local only)

| Endpoint | Description |
|---|---|
| `GET /api/world` | Rooms and agents (the scan result) |
| `GET /api/project?key=` | Task summary + PRD / README excerpts for a room |
| `GET /api/agent?id=` | Achievements outline for an agent |
| `GET /api/security?key=[&force=1]` | Static security report for a project folder |
| `GET /api/chat/info?id=` | Whether / how an agent can be chatted with |
| `POST /api/chat` | Send a message, streams NDJSON events |
| `POST /api/fire`, `POST /api/unfire`, `GET /api/fired` | Dismiss / restore agents |

State-changing endpoints (`POST`) require the custom header `X-AW: 1` and, if present, an `Origin` that matches the server, so other websites cannot trigger them.

## Firing agents (soft delete)

Firing only **hides** the agent from the office by recording its id in `data/fired.json`. Nothing under `~/.claude` is deleted and running processes are not killed, so a fired agent can be restored from the *Fired* list. The server refuses to fire an agent unless its achievements were requested in the last 15 minutes (the agent "defends itself").

## Security review

Each project room has a guard that runs a bounded, local, read-only static scan (≤ 600 files, ≤ 200 KB per file, ≤ 6 s) looking for patterns such as hard-coded secrets, SQL / command injection, XSS sinks, `eval`, weak hashes, permissive CORS and disabled TLS verification. **Secret values are always masked in the output.** Your home folder is never scanned. This is a quick heuristic, **not** a substitute for a real security audit.

## Chat with agents

The chat runs the Claude Code CLI headlessly (`claude -p --resume <session>`) in the agent's working folder.

- **Closed sessions** are resumed in place, so replies are appended to the real session.
- **Sessions that are open elsewhere** (VS Code, Orca, a terminal) are **forked**, so the live transcript is never written to. The fork is hidden from the office; the original session does not see the conversation.
- **Safe mode** (default): the agent can read and answer but any action that needs permission is denied (and shown in the chat). **Edit mode** (toggle in the chat panel) runs with `--permission-mode acceptEdits`.
- Limits: sessions larger than 100 MB are refused, each reply is capped at `--max-budget-usd 2` and 10 minutes.
- **It uses your Claude account** and therefore consumes your quota / money; the UI shows the running cost.
- Only Claude Code agents can be chatted with (not Antigravity or the guards).

## Privacy & safety notes

- The server listens on `127.0.0.1` only and rejects requests with an unexpected `Host` header (DNS-rebinding protection). **Do not expose the port to a network**: the UI shows session titles, last replies and project paths, and the chat can drive your agents.
- Project folders used by the security scan, the project summary and the chat always come from the server's own scan, never from request parameters.
- `data/` (fired list, chat/fork mapping) contains paths and ids from your machine and is git-ignored.
- Chat messages are sent to Anthropic through the `claude` CLI exactly as if you had typed them in a terminal. Nothing else leaves your machine.

## Project layout

```
server.js        HTTP server, API routes, static files
scan.js          Discovers agents / rooms, status, "calling" detection, project summaries
history.js       Streams a transcript into an achievements outline
security.js      Static security scanner
chat.js          Headless Claude Code chat (resume / fork, streaming)
public/
  index.html, style.css, main.js     UI shell, panels, data loop, lift, chat/fire flows
  js/core.js     Shared state, constants, outfit rules
  js/floor.js    Floor plan, furniture, collision boxes, walking routes
  js/actors.js   Agent + guard behaviour (desk / fun area / toilet / visits / calls)
  js/render.js   Canvas renderer and picking
  js/shapes.js   2D primitives, furniture and the bot / human sprites
  js/player.js   Your character and collisions
  js/chat.js     Chat panel
```

## Developer URL parameters

Useful for testing; none of them send messages or change data on their own.

`?floor=N` start on a floor · `?room=fun|toilet|lift|office|p0|p1|p2|me` focus a room · `?sim=SECONDS` fast-forward the simulation · `?speed=N` time scale · `?demo` preview calls · `?selftest=1` verify that all walking routes avoid walls/furniture · `?select=NAME` / `?chat=NAME` open an agent panel / chat panel · `?guard=N` / `?modal=security` open a guard / security report.

## Limitations

- Only Claude Code (full support) and Antigravity (presence only) are recognised. Other tools (Copilot CLI, OpenCode, Codex, …) are not shown yet.
- Which projects share a floor depends on their recent activity and can change as agents become active.
- The agent interaction scenes (visits, ping-pong pairs, toilet trips) are a **visualization** driven by status data, not a record of real agent-to-agent communication.

## License

No license has been chosen yet. Add one (for example MIT) before making the repository public.

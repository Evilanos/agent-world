# Agent World

**A 2D virtual office for your AI coding agents.**

Agent World scans the AI agents running on your own computer and shows them as little bots working in a building:
one room per project, bots at their desks while they work, hanging out in a fun area when idle, and walking over to you when they are done or have a question.
You get your own character to walk around with, can read what each agent has achieved, and can chat with a Claude Code agent right from the browser.

Everything runs **locally** on your machine. There is nothing to sign up for, no cloud service, and **no npm dependencies**.

> The interface text is currently in Indonesian (Bahasa Indonesia). The code, the API and this documentation are in English. Translations / an i18n layer are welcome contributions.

```
┌──────────────┬──────────────┬──────────────┐
│  Project A   │  Project B   │  Project C   │   3 project rooms per floor
├──────────────┴──────────────┴──────────────┤
│                    hall                    │
├────────────┬────────┬──────┬───────────────┤
│  Fun Area  │ Toilet │ Lift │  Your office  │   idle agents relax here
└────────────┴────────┴──────┴───────────────┘
```

## Contents

- [Quick start](#quick-start)
- [What you will see](#what-you-will-see)
- [Using it](#using-it)
- [Chatting with agents](#chatting-with-agents)
- [Is it safe?](#is-it-safe)
- [Supported agents and platforms](#supported-agents-and-platforms)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [How it works](#how-it-works)
- [Contributing](#contributing)

## Quick start

**You need:** [Node.js](https://nodejs.org) 20 or newer, and a modern browser (Chrome, Edge, Firefox, Safari).
To see real agents you also need [Claude Code](https://claude.com/claude-code) installed (see [Supported agents](#supported-agents-and-platforms)).

```bash
git clone <repository-url>
cd agent-world
node server.js
```

Then open **http://localhost:4173**.

That is all: there is no `npm install` and no build step. (`npm start` also works.)

To stop it, press `Ctrl+C` in the terminal.

## What you will see

- **If you have used Claude Code** on this computer, your sessions appear automatically as bots, grouped into rooms by the folder they work in.
- **If you have no sessions yet**, you will see an empty building (three "empty room" placeholders, the Fun Area, the Toilet, the Lift and your own office). Start a Claude Code session in any project folder and it shows up within a few seconds.

How agents are shown:

| Agent state | What the bot does |
|---|---|
| Working right now | Sits at its desk and types. The tool it is using is shown (for example `✎ Edit main.js`). Subagents that are working appear as mini-bots linked to the desk. |
| Open but waiting / used in the last 24 h | Relaxes in the **Fun Area** (ping-pong, coffee, sofa, chatting) and sometimes visits the **Toilet**. |
| Older than 24 h | Dozes at its desk. |
| Finished its task, or asked you a question | Walks over to you, cheering (finished) or waving (needs your opinion). |

Bots also **dress for the project they work on** (for example a finance suit for projects named like `cash` / `invoice`, an IT-support polo with a headset for `ticket` / `helpdesk`, a lab coat for AI projects). The keyword rules are in `ROLE_RULES` in `public/js/core.js` and are easy to change.

Each floor has 3 project rooms. If you have more projects, extra floors appear and you travel between them with the lift. Your own office is on floor 2.

## Using it

| Input | Action |
|---|---|
| `W A S D` or arrow keys | Walk around (hold `Shift` to run). You collide with walls and furniture. |
| `C` | Toggle the "follow my character" camera |
| Drag / mouse wheel | Pan / zoom |
| Click an agent | Details, **achievements**, chat, fire |
| Click the monitor on a room's wall | Project summary: each agent's task plus excerpts of `PRD.md` / `README.md` if the project has them |
| Click a guard or the server console (🛡) | Security report of that project |
| Walk into the lift | Pick a floor (or press `1`-`9`) |
| `Esc` | Close panels |

Header buttons: **Follow character**, **View whole floor**, **Fired** (restore dismissed agents) and **Demo calls** (previews agents walking over to you, useful the first time you try it).

### Achievements and firing

Click an agent to see a high-level outline of what it has worked on (the tasks you gave it, plus counts such as files edited and commands run). You can also "fire" an agent: it will plead for its job and make you look at its achievements first before the button to confirm becomes available.

Firing is a **soft delete**. It only hides the agent from the office (the id is stored in `data/fired.json`). **No session files are deleted and no process is stopped**, and you can bring the agent back from the **Fired** list.

### Security guards

Every project room has a security guard and so does the Fun Area. They do two things:

1. Keep agents from different projects apart: a bot that wanders over from another project is stopped at the door, and only colleagues of the same project pair up in the Fun Area. *(This is a visualization of a rule, not monitoring of real agent-to-agent traffic.)*
2. Run a quick, local, read-only **static security scan** of the project's source code: hard-coded secrets, SQL / command injection patterns, XSS sinks, `eval`, weak hashes, permissive CORS, disabled TLS verification and similar. Click a guard (or the console) to read the report. Secret values are always masked. Your home folder is never scanned. It is a heuristic, **not** a substitute for a real audit.

## Chatting with agents

Click an agent and press the **💬** button at the top of its panel (labelled "Ngobrol / beri perintah" in the Indonesian UI). Replies stream in like a normal chat, and the agent walks over to talk to you.

It works by running the Claude Code CLI headlessly in the agent's folder (`claude -p --resume <session>`), so you need the `claude` command installed and logged in.

- **Please note: this uses your own Claude account**, so it consumes your usage / credits. A first reply can cost around US$0.1, more for large sessions. The chat panel shows the running cost.
- **Safe mode (default):** the agent can read files and answer, but anything that needs permission (editing files, running commands) is refused, and the refusal is shown in the chat.
- **Edit mode:** toggle it in the chat panel to let the agent edit files in the project. Only switch it on when you intend to give that agent write access.
- **Closed sessions** are resumed in place, so the conversation is saved in the real session.
- **Sessions that are open somewhere else** (VS Code, a terminal, ...) are **forked**: the chat talks to a copy, so the live session is never written to. The original session will not see your messages. The copy is hidden from the office.
- Limits: sessions larger than 100 MB are refused (too slow and expensive), a reply is capped at US$2 and 10 minutes, and you can press **Stop** at any time.
- Only Claude Code agents can be chatted with.

## Is it safe?

Short version: it reads your agent session files, shows them in your browser on your own machine, and only talks to the network if you use the chat.

- **Local only.** The server binds to `127.0.0.1`, and requests with an unexpected `Host` header are rejected (DNS-rebinding protection).
  **Do not expose the port to a network or the internet.** The UI shows session titles, your last prompts and replies, project paths, and the chat can drive your agents.
- **Read-only by default.** It reads `~/.claude/sessions`, `~/.claude/projects` and the Antigravity history file. It never writes into them. The only things it writes are its own files in `data/` (the fired list and the chat/fork mapping).
- **Write actions are guarded.** `POST` endpoints require a custom `X-AW` header and a matching `Origin`, so other websites you visit cannot trigger them.
- **The browser cannot choose folders.** Project folders for the security scan, project summary and chat always come from the server's own scan, never from request parameters. Static files are served from `public/` only.
- **What leaves your machine:** only what you type in a chat, sent to Anthropic through the `claude` CLI exactly as if you had typed it in a terminal.
- **Your data stays out of git.** `data/` is in `.gitignore`.

## Supported agents and platforms

| Tool | Support |
|---|---|
| **Claude Code** (CLI, VS Code extension, desktop, Orca) | Full: live status, current tool, subagents, finished / asking detection, achievements, chat |
| **Antigravity CLI** (`~/.gemini/antigravity-cli`) | Presence only (shows up in the project it was used in) |
| Copilot CLI, OpenCode, Codex, Cursor, Aider, ... | Not supported yet |

| Platform | Status |
|---|---|
| **Windows 10/11** | Developed and tested here |
| macOS / Linux | Expected to work (paths are handled generically) but **untested**. Please open an issue if something is off. |

If you use the Orca agent workspace app, worktrees it creates (`.../orca/workspaces/<Project>/<worktree>`) are grouped into their parent project.

## Configuration

| Environment variable | Default | Purpose |
|---|---|---|
| `PORT` | `4173` | HTTP port (always bound to `127.0.0.1`) |
| `CLAUDE_BIN` | auto-detected | Full path to the `claude` executable used by the chat. If unset it tries `~/.local/bin/claude` (`claude.exe` on Windows) and then `claude` on your `PATH`. |

Examples:

```bash
PORT=8080 node server.js                      # macOS / Linux / Git Bash
$env:PORT = 8080; node server.js              # Windows PowerShell
```

## Troubleshooting

| Problem | What to check |
|---|---|
| **No agents appear** | Does `~/.claude/projects` exist and contain `.jsonl` files? Run Claude Code once in a project folder. Agents are discovered every 2 seconds. On Windows `~` is `C:\Users\<you>`. |
| **"Address already in use"** | Another program uses port 4173. Start with a different `PORT`. |
| **Everything shows as sleeping / nothing is "working"** | Only sessions with a running Claude Code process count as live. Closed sessions appear as recent or sleeping. |
| **Chat says it cannot run `claude`** | Install Claude Code, make sure `claude --version` works in a terminal, or set `CLAUDE_BIN` to the full path. |
| **Chat says the session is too large** | Sessions over 100 MB are refused. Start a new Claude Code session in the project instead. |
| **The page looks cramped** | Use a window at least ~1300 px wide, or zoom the browser out with `Ctrl` + `-`. |
| **A security report seems noisy** | The scanner is a simple pattern matcher. Treat findings as leads to review, not verdicts. |

## How it works

`server.js` is a small dependency-free Node HTTP server that re-scans your machine every 2 seconds and serves a static canvas front-end from `public/`.

| Source (read-only) | Used for |
|---|---|
| `~/.claude/sessions/*.json` | Live sessions: name, working folder, busy / idle, process id |
| `~/.claude/projects/**/*.jsonl` | Transcripts: title, last turn (finished or asking), current tool, subagents, achievements |
| `~/.gemini/antigravity-cli/history.jsonl` | Antigravity workspaces |

The live view only parses the head and tail of each transcript. Achievements stream a whole transcript on demand and keep only short outlines.

An agent is "calling" you when its last assistant turn (within the last 30 minutes) ended without a tool call (*finished*) or with a question / `AskUserQuestion` (*asking*).

### Local HTTP API

| Endpoint | Description |
|---|---|
| `GET /api/world` | Rooms and agents (the scan result) |
| `GET /api/project?key=` | Task summary + `PRD` / `README` excerpts for a room |
| `GET /api/agent?id=` | Achievements outline of an agent |
| `GET /api/security?key=[&force=1]` | Static security report of a project folder |
| `GET /api/chat/info?id=` | Whether / how an agent can be chatted with |
| `POST /api/chat` | Send a message, streams NDJSON events |
| `POST /api/fire` / `POST /api/unfire` / `GET /api/fired` | Dismiss / restore agents |

### Project layout

```
server.js        HTTP server, API routes, static files
scan.js          Discovers agents and rooms, status, "calling" detection, project summaries
history.js       Streams a transcript into an achievements outline
security.js      Static security scanner
chat.js          Headless Claude Code chat (resume / fork, streaming)
public/
  index.html, style.css, main.js    UI shell, panels, data loop, lift, chat and fire flows
  js/core.js     Shared state, constants, outfit rules
  js/floor.js    Floor plan, furniture, collision boxes, walking routes
  js/actors.js   Agent and guard behaviour (desk / fun area / toilet / visits / calls)
  js/render.js   Canvas renderer and picking
  js/shapes.js   2D primitives, furniture, bot and human sprites
  js/player.js   Your character and collisions
  js/chat.js     Chat panel
```

## Contributing

Issues and pull requests are welcome. Good first areas: more agent sources (Copilot CLI, Codex, OpenCode, ...), macOS / Linux testing, translating the UI strings, and new outfits / rooms.

There are no build tools. Edit the files and reload the page.

Developer URL parameters (none of them send messages or change data by themselves):

| Parameter | Effect |
|---|---|
| `?floor=N` | Start on floor N |
| `?room=fun\|toilet\|lift\|office\|p0\|p1\|p2\|me` | Focus a room, or your character |
| `?sim=SECONDS` | Fast-forward the simulation |
| `?speed=N` | Time scale (up to 12) |
| `?demo` | Preview agents walking over to you |
| `?selftest=1` | Check that every walking route avoids walls and furniture |
| `?select=NAME`, `?chat=NAME`, `?guard=N`, `?modal=security` | Open an agent panel, chat panel, guard panel or security report |

## License

No license has been chosen yet. Add a `LICENSE` file (for example MIT) before publishing the repository.

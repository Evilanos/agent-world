# Agent World

**A 2D virtual office for your AI coding agents.**

Agent World scans the AI agents running on your own computer and shows them as little bots working in a building:
one room per project, bots at their desks while they work, hanging out in a fun area when idle, and walking over to you when they are done or have a question.
You get your own character to walk around with, can read what each agent has achieved, and can chat with a Claude Code agent right from the browser.

Everything runs **locally** on your machine. There is nothing to sign up for, no cloud service, and **no npm dependencies**.

> **Languages:** the interface is available in **English, Bahasa Indonesia, Español, 日本語 and 简体中文**. Pick one under **⚙ Settings → Language** (it applies instantly and is remembered). On first launch it follows your browser language. See [Adding a language](#adding-a-language).

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
- [Detecting other agent tools](#detecting-other-agent-tools)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [How it works](#how-it-works)
- [Contributing](#contributing)

## Quick start

**You need:** [Node.js](https://nodejs.org) 20 or newer, and a modern browser (Chrome, Edge, Firefox, Safari).
To see real agents you need at least one supported agent tool installed, e.g. [Claude Code](https://claude.com/claude-code) (see [Supported agents](#supported-agents-and-platforms) for Codex, OpenCode, Gemini CLI, Aider, Goose and others).

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
| **Floor button** (top of the left sidebar) | Always shows the floor you are standing on (📍). Its list lets you **browse any other floor**: the sidebar then shows that floor's project cards, and you can inspect and **📞 Call** agents that are not on your floor. A called agent rides the lift to you (a few seconds per floor), steps out of your floor's lift and walks over; **Back** sends it back. Your character and the map stay on your floor (to go to another floor yourself, use the lift). |
| Click a project card in the left sidebar | Opens a dropdown with that project's agents (click one for its details; **📞 Call** makes it walk over to you, **Back** sends it home) |
| Click an agent | Details, **achievements**, chat, fire |
| Click the monitor on a room's wall | Project summary: each agent's task plus excerpts of `PRD.md` / `README.md` if the project has them |
| Click a guard or the server console (🛡) | Security report of that project |
| Walk into the lift | Pick a floor (or press `1`-`9`) |
| `Esc` | Close panels |

The header is kept minimal (title, floor, live statistics and a **⚙ Settings** button). Settings has two menus:

- **Controller**: the full list of keyboard and mouse controls, plus the view options: *Follow character*, *View whole floor*, *Show sleeping agents*, *Fired* (restore dismissed agents) and *Demo calls* (previews agents walking over to you, useful the first time you try it).
- **Language**: choose the interface language.

Two shortcuts also work without opening the menu: `C` (follow character) and `O` (view the whole floor).

Only the application's own texts are translated. Things that come from your agents (session titles, your prompts, agent replies, file names) are shown as they are. In the Security chat the guard answers in the language you selected.

### Achievements and firing

Click an agent to see a high-level outline of what it has worked on (the tasks you gave it, plus counts such as files edited and commands run). You can also "fire" an agent: it will plead for its job and make you look at its achievements first before the button to confirm becomes available.

Firing is a **soft delete**. It only hides the agent from the office (the id is stored in `data/fired.json`). **No session files are deleted and no process is stopped**, and you can bring the agent back from the **Fired** list.

### Security guards

Every project room has a security guard and so does the Fun Area. They do two things:

1. Keep agents from different projects apart: a bot that wanders over from another project is stopped at the door, and only colleagues of the same project pair up in the Fun Area. *(This is a visualization of a rule, not monitoring of real agent-to-agent traffic.)*
2. Run a quick, local, read-only **static security scan** of the project's source code: hard-coded secrets, SQL / command injection patterns, XSS sinks, `eval`, weak hashes, permissive CORS, disabled TLS verification and similar. Click a guard (or the console) to read the report. Secret values are always masked. Your home folder is never scanned. It is a heuristic, **not** a substitute for a real audit.

## Chatting with agents

Click an agent and press the **💬 Chat / give commands** button at the top of its panel. Replies stream in like a normal chat, and the agent walks over to talk to you.

It works by running the Claude Code CLI headlessly in the agent's folder (`claude -p --resume <session>`), so you need the `claude` command installed and logged in.

- **Please note: this uses your own Claude account**, so it consumes your usage / credits. A first reply can cost around US$0.1, more for large sessions. The chat panel shows the running cost.
- **Safe mode (default):** the agent can read files and answer, but anything that needs permission (editing files, running commands) is refused, and the refusal is shown in the chat.
- **Edit mode:** toggle it in the chat panel to let the agent edit files in the project. Only switch it on when you intend to give that agent write access.
- **Closed sessions** are resumed in place, so the conversation is saved in the real session.
- **Sessions that are open somewhere else** (VS Code, a terminal, ...) are **forked**: the chat talks to a copy, so the live session is never written to. The original session will not see your messages. The copy is hidden from the office.
- Limits: sessions larger than 100 MB are refused (too slow and expensive), a reply is capped at US$2 and 10 minutes, and you can press **Stop** at any time.
- Only Claude Code agents can be chatted with.

### Talking to Security (fix prompts)

Click a guard (🛡) and press **💬 Ngobrol dengan Security** to chat with the security guard of that project. It knows the project's scan report and can:

- explain and prioritize the findings;
- **verify them by reading the code** (the scanner is a heuristic, so false positives are common; the guard will tell you which findings are real);
- write a **ready-to-paste fix prompt** for the project's coding agent. Prompts appear in a code block with a **Copy** button and a **Send to agent…** button that opens that agent's chat with the prompt pre-filled (it is *not* sent automatically, so you can review it first; remember to enable edit mode for that agent if you want it to apply the fix).

Details:

- The guard is **read-only**: it only has the `Read`, `Grep` and `Glob` tools, and reads of `.env*`, `*.pem`, `*.key`, `id_rsa*` and `credentials*` are denied. It never changes files.
- Security chats are **stateless**: no session is written to disk, so no extra agent appears in the office. The browser sends the recent conversation with each message and keeps the history in its own local storage.
- Like agent chat, this **uses your Claude account** (a reply is capped at US$1 and 10 minutes). The code the guard reads and the scan snippets (with secret values masked) are sent to Claude through the `claude` CLI.
- Only available for real project rooms (not the Fun Area guard, and not for your home folder).

## Is it safe?

Short version: it reads your agent session files, shows them in your browser on your own machine, and only talks to the network if you use the chat.

- **Local only.** The server binds to `127.0.0.1`, and requests with an unexpected `Host` header are rejected (DNS-rebinding protection).
  **Do not expose the port to a network or the internet.** The UI shows session titles, your last prompts and replies, project paths, and the chat can drive your agents.
- **Read-only by default.** It reads `~/.claude/sessions`, `~/.claude/projects`, the Antigravity history file and the session folders of the other tools listed below, and lists running processes (name and command line, kept in memory only). It never writes into any of them. The only things it writes are its own files in `data/` (the fired list and the chat/fork mapping).
- **Write actions are guarded.** `POST` endpoints require a custom `X-AW` header and a matching `Origin`, so other websites you visit cannot trigger them.
- **The browser cannot choose folders.** Project folders for the security scan, project summary and chat always come from the server's own scan, never from request parameters. Static files are served from `public/` only.
- **What leaves your machine:** only what you type in a chat (plus, for Security chats, the scan report and the code files the guard reads), sent to Anthropic through the `claude` CLI exactly as if you had typed it in a terminal. Nothing is sent unless you use a chat.
- **Your data stays out of git.** `data/` is in `.gitignore`.

## Supported agents and platforms

Agent World looks for agents in three ways, from most to least precise:

1. **Session files.** Built-in adapters read each tool's own history folder (read-only).
2. **Running processes.** A background process list recognises agent CLIs even when their files are unknown to us, so they still show up (and sessions of a tool that is running are marked online).
3. **Your own config.** Any other tool can be added in a few lines of JSON, no code ([see below](#detecting-other-agent-tools)).

| Tool | Support |
|---|---|
| **Claude Code** (CLI, VS Code extension, desktop, Orca) | **Full**: live status, current tool, subagents, finished / asking detection, achievements, chat. Tested. |
| **Antigravity CLI** (`~/.gemini/antigravity-cli`) | Presence only (shows up in the project it was used in). Tested. |
| OpenAI **Codex CLI**, **OpenCode**, **Goose**, **Continue**, **Gemini CLI**, **Aider**, **Cline / Roo Code** | **Experimental** session-file adapters: the agent, its title and its project folder appear in a room. Written from each tool's public file format and **not yet verified on real installs**: if one does not show up, run `npm run discover` and open an issue (or use a config adapter). Cline / Roo Code do not store the project folder, so they get a "folder unknown" room. |
| Codex, Gemini CLI, OpenCode, Aider, Goose, Cursor Agent, Copilot CLI, Amp, Qwen Code, Crush, Droid, Kimi, GLM CLI | Detected while **running** through the process list (no session history needed). |
| Anything else | Add a config adapter ([below](#detecting-other-agent-tools)). |

Only Claude Code agents can be chatted with and have achievements; other tools are shown and can be called to your desk, but their history is not parsed.

**About "GLM" and similar models:** GLM, DeepSeek, Kimi, Qwen, etc. are *models*. When you use them through Claude Code, OpenCode, Cline, ... they are detected as that tool. A dedicated GLM command-line tool is detected only if it is in the process list above or described in your config.

Honest limit: nobody can promise to know every agent tool, since each stores data differently and they change often. That is what `npm run discover` and the config adapters are for.

### Detecting other agent tools

```bash
npm run discover        # or: node scripts/discover.js
```

It lists the agent tools it finds on your computer (known folders, plus recently changed session-like JSON/JSONL files), which ones Agent World already sees, which agent CLIs are running right now, and prints a config snippet you can adjust.

To add a tool, copy [`agent-world.config.example.json`](agent-world.config.example.json) to `agent-world.config.json` (next to `server.js`) or to `~/.agent-world.json`. Changes apply without restarting.

```json
{
  "disable": ["cline"],
  "projectRoots": ["~/code"],
  "adapters": [{
    "id": "mytool", "name": "My Agent Tool", "color": "#ff8800",
    "files": "~/.mytool/sessions/**/*.jsonl",
    "format": "jsonl",
    "fields": { "id": "session.id", "cwd": "session.workingDirectory", "title": "firstPrompt", "time": "updatedAt" }
  }]
}
```

| Key | Meaning |
|---|---|
| `disable` | Built-in adapter / process ids to hide (e.g. `"codex"`) |
| `projectRoots` | Folders where your projects live (their sub-folders count too). Lets history-per-project tools such as Aider and Gemini CLI be matched to folders |
| `adapters[].files` | Glob of session files (`~`, `%APPDATA%`, `$HOME` are expanded; `*`, `**`, `?` supported) |
| `adapters[].format` | `jsonl` (first ~200 lines are read) or `json` (whole file) |
| `adapters[].fields` | Dot-paths into the JSON: `id`, `cwd` (project folder), `title`, `time` (ms, seconds or ISO date). Missing fields fall back to the file name / modified time |
| `adapters[].staticCwd` | Use this folder when the tool does not store one |

An agent with no known folder gets a room named "<tool> (folder unknown)".

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
| **No agents appear** | Run `npm run discover` to see which tools were found. For Claude Code, does `~/.claude/projects` exist and contain `.jsonl` files? Run it once in a project folder. A tool we do not know? Add a [config adapter](#detecting-other-agent-tools). Agents are discovered every 2 seconds. On Windows `~` is `C:\Users\<you>`. |
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
| `adapters/` (session folders of other tools, process list, `agent-world.config.json`) | Every other agent tool |

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
| `POST /api/chat` | Send a message to an agent, streams NDJSON events |
| `POST /api/chat/security` | Chat with a project's security guard (read-only, stateless), streams NDJSON events |
| `POST /api/fire` / `POST /api/unfire` / `GET /api/fired` | Dismiss / restore agents |

### Project layout

```
server.js        HTTP server, API routes, static files
scan.js          Discovers agents and rooms, status, "calling" detection, project summaries
adapters/        Detection of other agent tools: builtin.js (file adapters), processes.js (process list), config.js (user adapters), lib.js, index.js
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
  js/i18n.js     Language list, t() and live switching
  js/lang/       One dictionary per language (en, id, es, ja, zh)
scripts/check-i18n.js   Dictionary consistency checker (npm run check:i18n)
scripts/discover.js    Finds agent tools on this machine (npm run discover)
```

## Contributing

Issues and pull requests are welcome. Good first areas: more agent sources (Copilot CLI, Codex, OpenCode, ...), macOS / Linux testing, new languages, and new outfits / rooms.

There are no build tools. Edit the files and reload the page.

### Adding a language

All user-facing text lives in dictionaries under `public/js/lang/` (`en.js` is the reference, with `{placeholders}` that must be kept).

1. Copy `public/js/lang/en.js` to `public/js/lang/<code>.js` (for example `fr.js`) and translate the values.
2. Register it in `public/js/i18n.js`: add the `import` and a line in `LANGS` (`code`, display `name`, `locale` for dates/numbers, and `ai`, the English name of the language, which is passed to the AI so Security replies in it).
3. Run `npm run check:i18n`. It verifies that every language has exactly the same keys and placeholders as `en.js` and that every key used in the code exists.

Missing keys fall back to English, so a partial translation still works. The server never sends user-facing prose: it returns codes and neutral data (tool names, rule ids), and the browser translates them.

Developer URL parameters (none of them send messages or change data by themselves):

| Parameter | Effect |
|---|---|
| `?lang=en\|id\|es\|ja\|zh` | Use a language for this page load (the saved choice is not changed) |
| `?modal=controller\|language` | Open the settings menu on that tab |
| `?floor=N` | Start on floor N |
| `?room=fun\|toilet\|lift\|office\|p0\|p1\|p2\|me` | Focus a room, or your character |
| `?sim=SECONDS` | Fast-forward the simulation |
| `?speed=N` | Time scale (up to 12) |
| `?demo` | Preview agents walking over to you |
| `?selftest=1` | Check that every walking route avoids walls and furniture |
| `?select=NAME`, `?chat=NAME`, `?guard=N`, `?guardchat=PROJECT`, `?modal=security` | Open an agent panel, agent chat, guard panel, a project's security chat (panel only) or a security report |

## License

No license has been chosen yet. Add a `LICENSE` file (for example MIT) before publishing the repository.

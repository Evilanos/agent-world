// English: the reference dictionary. Every other language must define the same keys.
// Placeholders look like {name}; keep them unchanged when translating.
export default {
  // ---- header / static UI ----
  'hdr.sleeping': 'Show sleeping agents',
  'hdr.follow': 'Follow character', 'hdr.follow.tip': 'Camera follows your character (C)',
  'hdr.overview': 'View whole floor', 'hdr.overview.tip': 'Zoom out to see the whole floor',
  'hdr.fired': 'Fired', 'hdr.fired.tip': 'List of fired agents (can be restored)',
  'hdr.demo': 'Demo calls', 'hdr.demo.stop': 'Stop demo', 'hdr.demo.tip': 'Preview: a few agents walk over to you',
  'hdr.settings': 'Settings', 'hdr.settings.tip': 'Settings (language)',
  'chip.floors': 'floors', 'chip.rooms': 'rooms', 'chip.agents': 'agents', 'chip.online': 'online', 'chip.working': 'working', 'chip.waiting': 'waiting for you', 'chip.blocked': 'cross-project stopped',
  'floor.badge': 'Floor {n}', 'floor.badge.yours': 'Floor {n} · your floor',
  'updated': 'Updated {time}',
  'canvas.aria': '2D plan of one building floor with project rooms, a fun area, a toilet and a lift. Use WASD to move your character.',
  'rooms.aria': 'Rooms on this floor', 'detail.aria': 'Agent details', 'lift.aria': 'Lift panel', 'modal.aria': 'Details', 'chat.aria': 'Chat with agent',
  'legend.busy': 'Working (at desk)', 'legend.idle': 'Idle → fun area / toilet', 'legend.recent': 'Active < 24 h', 'legend.sleeping': 'Sleeping',
  'legend.ask': '? Needs your opinion', 'legend.done': '✓ Finished',
  "legend.hint": "WASD / arrows: walk · Click an agent for details · ⚙ Settings → Controller: all controls",
  'err.load': 'Could not load agent data: {msg}',
  'you': 'You',

  // ---- status / kinds / calls ----
  'status.busy': 'Working', 'status.idle': 'Idle (session open)', 'status.recent': 'Active < 24 h', 'status.sleeping': 'Sleeping',
  'kind.claude': 'Claude Code', 'kind.antigravity': 'Antigravity (Gemini)', 'kind.security': 'Security',
  'call.ask.label': 'Needs your opinion', 'call.ask.bubble': 'Your opinion ?', 'call.done.label': 'Finished', 'call.done.bubble': 'Done ✓',
  'demo.ask': '[Demo] Use approach A or B?', 'demo.done': '[Demo] Task finished, all tests pass',

  // ---- outfits ----
  'role.finance.label': 'Finance', 'role.finance.desc': 'suit, tie & glasses',
  'role.it.label': 'IT Support', 'role.it.desc': 'polo, lanyard & headset',
  'role.engineer.label': 'Engineer', 'role.engineer.desc': 'hoodie',
  'role.game.label': 'Game Dev', 'role.game.desc': 'cap & headphones',
  'role.ai.label': 'AI Lab', 'role.ai.desc': 'lab coat & goggles',
  'role.design.label': 'Designer', 'role.design.desc': 'beret & apron',
  'role.casual.label': 'Staff', 'role.casual.desc': 'casual t-shirt',
  'role.security.label': 'Security', 'role.security.desc': 'uniform & vest',

  // ---- relative time ----
  'ago.none': '—', 'ago.now': 'just now', 'ago.min': '{n} min ago', 'ago.hour': '{n} h ago', 'ago.day': '{n} d ago',

  // ---- rooms drawn on the canvas / sidebar ----
  'room.fun': 'Fun Area', 'room.fun.sub': 'relax · coffee · ping-pong', 'room.fun.tv': '▶ FUN AREA',
  'room.toilet': 'Toilet', 'room.toilet.sub': 'WC',
  'room.lift': 'Lift', 'room.lift.sub': 'lift', 'room.lift.label': 'LIFT', 'room.floor': 'FLOOR {n}',
  'room.office': 'Your office', 'room.office.sub': 'floor {n} · private office',
  'room.lobby': 'Lobby floor {n}',
  'room.empty': 'Empty room', 'room.empty.sub': 'no project yet',
  'room.unknown': '{tool} (folder unknown)',
  'room.projsub': '{role} · {agents} agents · {live} online',
  'board.none': 'No tasks yet.', 'board.click': 'CLICK: TASK SUMMARY / PRD',
  'desk.inbox': 'INBOX {n}', 'desk.you': 'YOU',
  'side.fun': '{n} agents relaxing', 'side.toilet': '{n} agents in the toilet', 'side.lift': 'change floor', 'side.office': 'private office',

  // ---- lift ----
  'lift.title': 'Lift', 'lift.where': 'You are on floor {n}. Choose a destination:', 'lift.projAgents': '{p} projects · {a} agents',
  'lift.waiting': '{n} waiting for you', 'lift.yours': 'your floor', 'lift.hint': 'Press a number key, or step out of the lift to close.', 'lift.going': 'Going to floor {n}…',

  // ---- guards ----
  'guard.name': 'Security', 'guard.title': 'Security · {name}',
  'guard.watch': '👀 watching cross-project mixing', 'guard.block': '🚫 Different project!',
  'guard.scanning': '🔍 scanning…', 'guard.skipped': '🔍 not a project', 'guard.findings': '🔍 {n} findings',

  // ---- poses (what the agent is doing) ----
  'doing.work': 'Working at the desk', 'doing.sleep': 'Asleep at the desk', 'doing.sofa': 'Relaxing on the sofa', 'doing.drink': 'Having coffee',
  'doing.pingpong': 'Playing ping-pong', 'doing.chat': 'Chatting', 'doing.pee': 'Peeing', 'doing.poop': 'Pooping', 'doing.wash': 'Washing hands',
  'doing.stand': 'Hanging out', 'doing.wave': 'Waving at you', 'doing.cheer': 'Reporting: finished!', 'doing.plead': 'Begging not to be fired', 'doing.sad': 'Sad',

  // ---- tools an agent is using ({target} is a file / pattern / command) ----
  'act.edit': 'Editing {target}', 'act.write': 'Writing {target}', 'act.read': 'Reading {target}', 'act.search': 'Searching {target}', 'act.run': 'Running {target}',
  'act.delegate': 'Delegating {target}', 'act.web': 'Web research {target}', 'act.fetch': 'Reading web {target}', 'act.plan': 'Planning {target}', 'act.use': 'Using {tool} {target}',

  // ---- agent panel ----
  'p.close': 'Close', 'p.closeDetail': 'Close details', 'p.chat': '💬 Chat / give commands',
  'p.uniform': 'Uniform', 'p.now': 'Right now', 'p.activity': 'Activity', 'p.tool': 'Tool', 'p.lastReply': 'Last reply', 'p.info': 'Info',
  'p.type': 'Type', 'p.folder': 'Folder', 'p.worktree': 'Worktree', 'p.source': 'Source', 'p.pid': 'PID', 'p.lastActive': 'Last activity', 'p.id': 'ID',
  'p.subagents': 'Subagents ({n})', 'p.noSubagents': 'No subagents recorded.', 'p.fire': 'Fire agent…',
  'p.ack': 'I have seen it — back to the room', 'p.noSummary': '(no summary)',

  // ---- achievements ----
  'ach.title': 'Achievements', 'ach.loading': 'Reading work history… (large transcripts can take a few seconds)', 'ach.fail': 'Failed: {msg}',
  'ach.prompts': 'tasks from you', 'ach.edit': 'files edited/written', 'ach.bash': 'commands run', 'ach.read': 'searches & reads', 'ach.web': 'web research', 'ach.agent': 'subagents delegated',
  'ach.since': 'Working since {date} · last {ago}', 'ach.partial': ' · (very long history, partly scanned)',
  'ach.topics': 'Topics worked on', 'ach.outline': 'Task outline', 'ach.none': 'No tasks recorded yet.', 'ach.noTranscript': 'No transcript history for this agent.',

  // ---- firing ----
  'def.title': '🙏 {name} defends itself',
  'def.plea': '“Wait, boss! Before you fire me, please look at what I have done first.”',
  'def.stats': '“I have received {prompts} tasks from you, edited {edits} files and run {cmds} commands. Please reconsider.”',
  'def.statsNone': '“That is everything I have done. Please reconsider.”',
  'def.view': 'See my achievements', 'def.cancel': 'Cancel', 'def.confirm': 'Fire anyway', 'def.spare': 'Give another chance',
  'def.note': 'Firing only hides the agent from the office (you can restore it with the “Fired” button).',
  'def.err409': 'The server refused: look at this agent’s achievements before firing it.', 'def.errHttp': 'Could not fire (HTTP {n})',

  // ---- guard panel ----
  'g.title': '🛡 Security', 'g.badge': 'Room guard', 'g.duties': 'Duties',
  'g.duty1': 'Keep agents of different projects from chatting or working together.', 'g.duty2': 'Check the security of the system built in this project.',
  'g.status': 'Status', 'g.vulns': 'System weaknesses', 'g.counts': '{h} high · {m} medium · {l} low', 'g.notproject': 'not a project', 'g.scanning': 'scanning…',
  'g.blocked': 'Cross-project stopped', 'g.blockedVal': '{n}× (this session)',
  'g.chat': '💬 Chat with Security', 'g.report': 'Open security report', 'g.chatHint': 'Ask Security to verify findings and write fix prompts you can hand to this project’s agent.',

  // ---- project summary modal ----
  'pm.loading': 'Loading project summary…', 'pm.fail': 'Could not load the summary: {msg}', 'pm.tasks': 'Current tasks', 'pm.noTasks': 'No tasks recorded yet.',
  'pm.docs': 'PRD / project documents', 'pm.noDocs': 'No PRD.md / README.md in this project folder.', 'pm.excerpt': ' (first part only)',

  // ---- security report modal ----
  'sm.scanning': 'Security is scanning the project code…', 'sm.title': '🛡 Security report · {name}',
  'sm.chip.high': 'high', 'sm.chip.medium': 'medium', 'sm.chip.low': 'low', 'sm.files': 'files scanned', 'sm.ms': 'ms',
  'sm.disclaimer': 'Local static scan (risky patterns in code and configuration). Secret values are always masked. This is not a substitute for a full audit.',
  'sm.truncated': ' Results truncated (file/time limit).', 'sm.rescan': 'Scan again', 'sm.clean': 'No findings from the rules used. 👍', 'sm.fail': 'Could not load the report: {msg}',
  'sm.skipped': 'This folder is the user’s Home folder, not a project, so it was not scanned.', 'sm.notFound': 'Project folder not found.',
  'sev.high': 'High', 'sev.medium': 'Medium', 'sev.low': 'Low',
  'sec.aws-key.title': 'AWS access key embedded in code', 'sec.aws-key.advice': 'Revoke the key and move it to environment variables or a secret manager.',
  'sec.private-key.title': 'Private key committed to the repo', 'sec.private-key.advice': 'Remove it from the repo, rotate the key and store it in a vault.',
  'sec.token.title': 'API token (GitHub / OpenAI / Slack) embedded', 'sec.token.advice': 'Revoke the token and use an environment variable.',
  'sec.hardcoded-secret.title': 'Password / secret / token hard-coded', 'sec.hardcoded-secret.advice': 'Move it to .env or a secret manager.',
  'sec.cmd-injection.title': 'Command execution with dynamic input (command injection)', 'sec.cmd-injection.advice': 'Use execFile / argument arrays and validate the input.',
  'sec.eval.title': 'Use of eval / new Function', 'sec.eval.advice': 'Avoid eval; parse data with JSON.parse or a safe library.',
  'sec.xss-innerhtml.title': 'Possible XSS (innerHTML / document.write)', 'sec.xss-innerhtml.advice': 'Use textContent or sanitize (DOMPurify).',
  'sec.php-xss.title': 'PHP prints user input without escaping (XSS)', 'sec.php-xss.advice': 'Wrap it in htmlspecialchars().',
  'sec.sqli-input.title': 'SQL query uses user input directly (SQL injection)', 'sec.sqli-input.advice': 'Use prepared statements / parameter binding.',
  'sec.sqli-concat.title': 'SQL query built from strings (check where the values come from)', 'sec.sqli-concat.advice': 'Make sure values come from trusted code; otherwise use parameter binding.',
  'sec.php-mysql.title': 'Deprecated mysql_* functions (vulnerable and unsupported)', 'sec.php-mysql.advice': 'Migrate to PDO / mysqli prepared statements.',
  'sec.php-include.title': 'include/require or unserialize on user input', 'sec.php-include.advice': 'Whitelist includable files; never unserialize user input.',
  'sec.weak-hash.title': 'Weak hash (md5 / sha1)', 'sec.weak-hash.advice': 'Use bcrypt / argon2 for passwords and SHA-256+ for integrity.',
  'sec.cors-wildcard.title': 'CORS open to every origin', 'sec.cors-wildcard.advice': 'Restrict origins to known domains.',
  'sec.tls-off.title': 'TLS verification disabled', 'sec.tls-off.advice': 'Enable certificate verification.',
  'sec.weak-random.title': 'Math.random used for tokens / secrets', 'sec.weak-random.advice': 'Use crypto.randomBytes / crypto.randomUUID.',
  'sec.chmod-777.title': 'Permission 777', 'sec.chmod-777.advice': 'Grant only the minimum permissions needed.',
  'sec.env-not-ignored.title': 'A .env file exists but .gitignore does not exclude it', 'sec.env-not-ignored.advice': 'Add .env to .gitignore and rotate any secret that may already be committed.',
  'sec.unpinned-deps.title': 'Dependencies without a pinned version', 'sec.unpinned-deps.advice': 'Pin versions (semver) so builds are reproducible.',

  // ---- fired list modal ----
  'fd.title': 'Fired agents', 'fd.note': 'Firing only hides an agent from the office. Session files in ~/.claude are not deleted, so you can restore it.',
  'fd.restore': 'Restore', 'fd.empty': 'No agents have been fired.', 'fd.when': '{project} · fired {ago}',

  // ---- chat ----
  'c.greetAgent': 'Hi! I am {name}. Want to ask something or give me a command?',
  'c.greetSec': 'Hi, I am Security for project {name}. {scan} I can explain findings, check the code (read-only) and write fix prompts you can hand to this project’s agent.',
  'c.scanCounts': 'Latest scan: {h} high, {m} medium, {l} low.', 'c.scanPending': 'The scan report is being prepared…', 'c.scanSkipped': 'This folder is not a project, so I did not scan it.',
  'c.secTitle': '🛡 Security · {name}', 'c.secSub': 'Room guard · read-only', 'c.agentSub': '{role} · {status}',
  'c.phAgent': 'Write a message or command for {name}…  (Enter to send, Shift+Enter for a new line)',
  'c.phSec': 'Ask Security, or ask for a fix prompt…  (Enter to send, Shift+Enter for a new line)',
  'c.msgAria': 'Message', 'c.send': 'Send', 'c.stop': 'Stop', 'c.closeAria': 'Close chat',
  'c.q1.label': 'Summarize biggest risks', 'c.q1.text': 'Summarize the biggest risks in this project and rank them by priority.',
  'c.q2.label': 'Verify + fix prompt', 'c.q2.text': 'Verify the high/medium findings by reading the code, then write one fix prompt I can hand to this project’s agent.',
  'c.q3.label': 'Prompt for all real findings', 'c.q3.text': 'Write a fix prompt for every finding that is a real vulnerability (ignore false positives) so I can hand it to this project’s agent.',
  'c.secBanner': 'Security can only read this project’s code (secret files such as .env are not read). It changes nothing; you hand the fix prompt to the project agent yourself.',
  'c.bannerLarge': 'This session history is very large ({mb} MB), so it cannot be continued from here (too slow and expensive).',
  'c.bannerFork': 'This agent is running somewhere else, so the chat here uses a copy (branch) of its session. The original session will not hear your messages.',
  'c.bannerSize': 'Session history is {mb} MB: the first reply can be slow and use many tokens.',
  'c.modeSafe': '🔒 Safe mode (ask & read only)', 'c.modeEdit': '✎ May edit files',
  'c.modeTipSafe': 'The agent may only read and answer. Click to allow file edits.', 'c.modeTipEdit': 'The agent may change files in the project folder. Click to return to safe mode.',
  'c.modeRO': '🔒 Read-only', 'c.modeROtip': 'Security cannot change files.',
  'c.cost': 'conversation cost ≈ ${v}',
  'c.copy': 'Copy', 'c.copied': 'Copied ✓', 'c.copyFail': 'Copy failed', 'c.sendTo': 'Send to agent…',
  'c.pickAgent': 'Choose the receiving agent. The prompt is filled into its chat (not sent yet).', 'c.noClaude': 'No Claude agents in this project.',
  'c.otherFloor': 'This agent is on another floor. Take the lift to that floor, open the agent’s chat and paste the prompt (use the Copy button).',
  'c.prefillHint': 'The prompt from Security is filled in the message box. Review it, enable “May edit files” so the agent can apply the fix, then send.',
  'c.noText': '(no text reply)', 'c.denied': '⛔ {tool} {target} denied',
  'c.deniedTipSec': 'Security may only read non-secret files.', 'c.deniedTipSafe': 'Safe mode does not allow this action. Enable “May edit files” and ask again.',
  'c.needPerm': 'The agent needs permission to do that. Enable “May edit files” above and repeat the command.',
  'c.aborted': '(stopped)', 'c.abortedSuffix': ' …(stopped)', 'c.connFail': 'Connection failed: {msg}', 'c.genericErr': 'Something went wrong.',
  'e.not-supported': 'Only Claude Code agents can be chatted with from here.', 'e.busy': 'This agent is still replying, please wait.', 'e.too-many': 'Too many conversations are running at once.',
  'e.too-large': 'This session history is very large ({mb} MB); continuing it would be very slow and expensive.', 'e.empty': 'The message is empty.', 'e.no-folder': 'The agent’s working folder was not found.',
  'e.timeout': 'Timed out (10 minutes).', 'e.stopped': 'Stopped.', 'e.spawn-failed': 'Could not run the claude command. Is Claude Code installed? {detail}', 'e.cli-exit': 'claude exited unexpectedly. {detail}',
  'e.sec-busy': 'Security is still answering, please wait.', 'e.skipped': 'This folder is not a project.', 'e.not-found': 'Not found.',

  // ---- settings ----
  'set.title': 'Settings', 'set.language': 'Language', 'set.langNote': 'Choose the display language. It applies immediately and is remembered in this browser.',
  'set.close': 'Close',

  // ---- controller menu ----
  "set.tab.controller": "Controller",
  "ctl.keys": "Keyboard & mouse",
  "ctl.actions": "View & actions",
  "ctl.k.move": "W A S D / arrows",
  "ctl.move": "Walk around",
  "ctl.run": "Run",
  "ctl.follow": "Camera follows your character",
  "ctl.overview": "View the whole floor",
  "ctl.k.pan": "Drag",
  "ctl.pan": "Move the map",
  "ctl.k.zoom": "Mouse wheel",
  "ctl.zoom": "Zoom in / out",
  "ctl.k.agent": "Click an agent",
  "ctl.agent": "Details, achievements, chat, fire",
  "ctl.k.monitor": "Click a wall monitor",
  "ctl.monitor": "Project summary (tasks + PRD)",
  "ctl.k.guard": "Click a guard (🛡)",
  "ctl.guard": "Security report and chat",
  "ctl.k.lift": "Walk into the lift",
  "ctl.lift": "Choose another floor (or press 1-9)",
  "ctl.close": "Close panels",

  // ---- project dropdown / call ----
  "side.call": "Call",
  "side.callTip": "Ask this agent to come to you",
  "side.back": "Back",
  "side.backTip": "Send this agent back to where it was",
  "side.more": "+{n} more not shown",
  "side.agentsAria": "Agents in {name}",
  "p.callMe": "📞 Call to me",
  "p.sendBack": "↩ Send back",
  "summon.bubble": "🙋 Yes?",
  "ctl.k.card": "Click a project card",
  "ctl.card": "Open its agent list; 📞 Call brings an agent to you",

  // ---- floor browser ----
  "fl.here": "You are on floor {n}",
  "fl.viewing": "Browsing floor {n}",
  "fl.menu": "Choose a floor to browse",
  "fl.you": "you are here",
  "fl.note": "Agents you call from here come to you by lift.",
  "side.traveling": "🛗 on the way by lift…",
  "side.floorEmpty": "No projects on this floor.",
  "p.floor": "Floor",
};

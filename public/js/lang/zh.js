// 简体中文 (Simplified Chinese). Same keys as en.js; placeholders like {name} are kept unchanged.
export default {
  // ---- header / static UI ----
  'hdr.sleeping': '显示休眠的智能体',
  'hdr.follow': '跟随角色', 'hdr.follow.tip': '镜头跟随你的角色 (C)',
  'hdr.overview': '查看整层楼', 'hdr.overview.tip': '缩小以查看整层楼',
  'hdr.fired': '已解雇', 'hdr.fired.tip': '已解雇的智能体列表（可恢复）',
  'hdr.demo': '演示呼叫', 'hdr.demo.stop': '停止演示', 'hdr.demo.tip': '预览：几个智能体走向你',
  'hdr.settings': '设置', 'hdr.settings.tip': '设置（语言）',
  'chip.floors': '楼层', 'chip.rooms': '房间', 'chip.agents': '智能体', 'chip.online': '在线', 'chip.working': '工作中', 'chip.waiting': '等你处理', 'chip.blocked': '已阻止跨项目',
  'floor.badge': '{n} 楼', 'floor.badge.yours': '{n} 楼 · 你的楼层',
  'updated': '更新于 {time}',
  'canvas.aria': '一层楼的 2D 平面图，包含项目房间、娱乐区、洗手间和电梯。使用 WASD 移动你的角色。',
  'rooms.aria': '本层的房间', 'detail.aria': '智能体详情', 'lift.aria': '电梯面板', 'modal.aria': '详情', 'chat.aria': '与智能体聊天',
  'legend.busy': '工作中（在工位）', 'legend.idle': '空闲 → 娱乐区 / 洗手间', 'legend.recent': '24 小时内活跃', 'legend.sleeping': '休眠',
  'legend.ask': '? 需要你的意见', 'legend.done': '✓ 已完成',
  "legend.hint": "WASD / 方向键：移动 · 点击代理查看详情 · ⚙ 设置 → 控制：全部操作",
  'err.load': '无法加载智能体数据：{msg}',
  'you': '你',

  // ---- status / kinds / calls ----
  'status.busy': '工作中', 'status.idle': '空闲（会话已打开）', 'status.recent': '24 小时内活跃', 'status.sleeping': '休眠',
  'kind.claude': 'Claude Code', 'kind.antigravity': 'Antigravity (Gemini)', 'kind.security': '安保',
  'call.ask.label': '需要你的意见', 'call.ask.bubble': '你怎么看？', 'call.done.label': '已完成', 'call.done.bubble': '搞定 ✓',
  'demo.ask': '【演示】用方案 A 还是 B？', 'demo.done': '【演示】任务已完成，所有测试通过',

  // ---- outfits ----
  'role.finance.label': '财务', 'role.finance.desc': '西装、领带和眼镜',
  'role.it.label': 'IT 支持', 'role.it.desc': 'Polo 衫、挂绳和耳麦',
  'role.engineer.label': '工程师', 'role.engineer.desc': '连帽衫',
  'role.game.label': '游戏开发', 'role.game.desc': '鸭舌帽和耳机',
  'role.ai.label': 'AI 实验室', 'role.ai.desc': '白大褂和护目镜',
  'role.design.label': '设计师', 'role.design.desc': '贝雷帽和围裙',
  'role.casual.label': '员工', 'role.casual.desc': '休闲 T 恤',
  'role.security.label': '安保', 'role.security.desc': '制服和马甲',

  // ---- relative time ----
  'ago.none': '—', 'ago.now': '刚刚', 'ago.min': '{n} 分钟前', 'ago.hour': '{n} 小时前', 'ago.day': '{n} 天前',

  // ---- rooms drawn on the canvas / sidebar ----
  'room.fun': '娱乐区', 'room.fun.sub': '放松 · 咖啡 · 乒乓球', 'room.fun.tv': '▶ 娱乐区',
  'room.toilet': '洗手间', 'room.toilet.sub': 'WC',
  'room.lift': '电梯', 'room.lift.sub': '电梯', 'room.lift.label': '电梯', 'room.floor': '{n} 楼',
  'room.office': '你的办公室', 'room.office.sub': '{n} 楼 · 独立办公室',
  'room.lobby': '{n} 楼大厅',
  'room.empty': '空房间', 'room.empty.sub': '暂无项目',
  'room.projsub': '{role} · {agents} 个智能体 · {live} 个在线',
  'board.none': '暂无任务。', 'board.click': '点击：任务摘要 / PRD',
  'desk.inbox': '收件箱 {n}', 'desk.you': '你',
  'side.fun': '{n} 个智能体在放松', 'side.toilet': '{n} 个智能体在洗手间', 'side.lift': '切换楼层', 'side.office': '独立办公室',

  // ---- lift ----
  'lift.title': '电梯', 'lift.where': '你在 {n} 楼。请选择目的地：', 'lift.projAgents': '{p} 个项目 · {a} 个智能体',
  'lift.waiting': '{n} 个在等你', 'lift.yours': '你的楼层', 'lift.hint': '按数字键，或走出电梯以关闭。', 'lift.going': '正在前往 {n} 楼…',

  // ---- guards ----
  'guard.name': '安保', 'guard.title': '安保 · {name}',
  'guard.watch': '👀 正在监视跨项目混用', 'guard.block': '🚫 项目不同！',
  'guard.scanning': '🔍 扫描中…', 'guard.skipped': '🔍 不是项目', 'guard.findings': '🔍 {n} 个发现',

  // ---- poses (what the agent is doing) ----
  'doing.work': '在工位工作', 'doing.sleep': '在工位睡着了', 'doing.sofa': '在沙发上放松', 'doing.drink': '喝咖啡',
  'doing.pingpong': '打乒乓球', 'doing.chat': '聊天', 'doing.pee': '小便', 'doing.poop': '大便', 'doing.wash': '洗手',
  'doing.stand': '闲逛', 'doing.wave': '向你招手', 'doing.cheer': '汇报：完成啦！', 'doing.plead': '求你别解雇我', 'doing.sad': '难过',

  // ---- tools an agent is using ({target} is a file / pattern / command) ----
  'act.edit': '正在编辑 {target}', 'act.write': '正在写入 {target}', 'act.read': '正在读取 {target}', 'act.search': '正在搜索 {target}', 'act.run': '正在运行 {target}',
  'act.delegate': '正在委派 {target}', 'act.web': '正在网络调研 {target}', 'act.fetch': '正在读取网页 {target}', 'act.plan': '正在规划 {target}', 'act.use': '正在使用 {tool} {target}',

  // ---- agent panel ----
  'p.close': '关闭', 'p.closeDetail': '关闭详情', 'p.chat': '💬 聊天 / 下达指令',
  'p.uniform': '制服', 'p.now': '当前', 'p.activity': '活动', 'p.tool': '工具', 'p.lastReply': '上次回复', 'p.info': '信息',
  'p.type': '类型', 'p.folder': '文件夹', 'p.worktree': 'Worktree', 'p.source': '来源', 'p.pid': 'PID', 'p.lastActive': '最近活动', 'p.id': 'ID',
  'p.subagents': '子智能体（{n}）', 'p.noSubagents': '没有子智能体记录。', 'p.fire': '解雇智能体…',
  'p.ack': '我已看到，返回房间', 'p.noSummary': '（无摘要）',

  // ---- achievements ----
  'ach.title': '成就', 'ach.loading': '正在读取工作记录…（较大的记录可能需要几秒钟）', 'ach.fail': '失败：{msg}',
  'ach.prompts': '个来自你的任务', 'ach.edit': '个文件被编辑/写入', 'ach.bash': '条命令已运行', 'ach.read': '次搜索与读取', 'ach.web': '次网络调研', 'ach.agent': '个子智能体被委派',
  'ach.since': '自 {date} 开始工作 · 最近 {ago}', 'ach.partial': ' · （历史记录很长，仅扫描了一部分）',
  'ach.topics': '处理过的主题', 'ach.outline': '任务概要', 'ach.none': '暂无任务记录。', 'ach.noTranscript': '该智能体没有对话记录。',

  // ---- firing ----
  'def.title': '🙏 {name} 在为自己辩护',
  'def.plea': '“老板，等一下！解雇我之前，请先看看我做过什么。”',
  'def.stats': '“我收到了你的 {prompts} 个任务，编辑了 {edits} 个文件，运行了 {cmds} 条命令。请再考虑一下。”',
  'def.statsNone': '“这就是我做过的全部。请再考虑一下。”',
  'def.view': '查看我的成就', 'def.cancel': '取消', 'def.confirm': '仍然解雇', 'def.spare': '再给一次机会',
  'def.note': '解雇只会把智能体从办公室隐藏（可通过“已解雇”按钮恢复）。',
  'def.err409': '服务器拒绝了请求：解雇前请先查看该智能体的成就。', 'def.errHttp': '无法解雇（HTTP {n}）',

  // ---- guard panel ----
  'g.title': '🛡 安保', 'g.badge': '房间守卫', 'g.duties': '职责',
  'g.duty1': '防止不同项目的智能体互相聊天或协作。', 'g.duty2': '检查本项目所构建系统的安全性。',
  'g.status': '状态', 'g.vulns': '系统弱点', 'g.counts': '{h} 高 · {m} 中 · {l} 低', 'g.notproject': '不是项目', 'g.scanning': '扫描中…',
  'g.blocked': '已阻止跨项目', 'g.blockedVal': '{n} 次（本次会话）',
  'g.chat': '💬 与安保聊天', 'g.report': '打开安全报告', 'g.chatHint': '让安保核实发现的问题，并编写可交给本项目智能体的修复提示词。',

  // ---- project summary modal ----
  'pm.loading': '正在加载项目摘要…', 'pm.fail': '无法加载摘要：{msg}', 'pm.tasks': '当前任务', 'pm.noTasks': '暂无任务记录。',
  'pm.docs': 'PRD / 项目文档', 'pm.noDocs': '此项目文件夹中没有 PRD.md / README.md。', 'pm.excerpt': '（仅显示开头部分）',

  // ---- security report modal ----
  'sm.scanning': '安保正在扫描项目代码…', 'sm.title': '🛡 安全报告 · {name}',
  'sm.chip.high': '高', 'sm.chip.medium': '中', 'sm.chip.low': '低', 'sm.files': '个文件已扫描', 'sm.ms': '毫秒',
  'sm.disclaimer': '本地静态扫描（代码和配置中的风险模式）。密钥值始终会被遮蔽。此扫描不能替代完整的安全审计。',
  'sm.truncated': ' 结果已截断（文件数/时间限制）。', 'sm.rescan': '重新扫描', 'sm.clean': '按所用规则未发现问题。👍', 'sm.fail': '无法加载报告：{msg}',
  'sm.skipped': '此文件夹是用户的主目录，不是项目，因此未扫描。', 'sm.notFound': '未找到项目文件夹。',
  'sev.high': '高', 'sev.medium': '中', 'sev.low': '低',
  'sec.aws-key.title': '代码中嵌入了 AWS 访问密钥', 'sec.aws-key.advice': '吊销该密钥，并改用环境变量或密钥管理器。',
  'sec.private-key.title': '私钥被提交到了仓库', 'sec.private-key.advice': '从仓库中移除，轮换密钥，并存放到密钥保管库中。',
  'sec.token.title': '嵌入了 API 令牌（GitHub / OpenAI / Slack）', 'sec.token.advice': '吊销该令牌，并改用环境变量。',
  'sec.hardcoded-secret.title': '密码 / 密钥 / 令牌被硬编码', 'sec.hardcoded-secret.advice': '将其移到 .env 或密钥管理器中。',
  'sec.cmd-injection.title': '使用动态输入执行命令（命令注入）', 'sec.cmd-injection.advice': '使用 execFile / 参数数组，并校验输入。',
  'sec.eval.title': '使用了 eval / new Function', 'sec.eval.advice': '避免使用 eval；用 JSON.parse 或安全的库解析数据。',
  'sec.xss-innerhtml.title': '可能存在 XSS（innerHTML / document.write）', 'sec.xss-innerhtml.advice': '使用 textContent，或进行净化（DOMPurify）。',
  'sec.php-xss.title': 'PHP 未转义就输出用户输入（XSS）', 'sec.php-xss.advice': '用 htmlspecialchars() 包裹。',
  'sec.sqli-input.title': 'SQL 查询直接使用用户输入（SQL 注入）', 'sec.sqli-input.advice': '使用预处理语句 / 参数绑定。',
  'sec.sqli-concat.title': 'SQL 查询由字符串拼接而成（请检查值的来源）', 'sec.sqli-concat.advice': '确保值来自可信代码；否则使用参数绑定。',
  'sec.php-mysql.title': '使用已弃用的 mysql_* 函数（存在漏洞且不再维护）', 'sec.php-mysql.advice': '迁移到 PDO / mysqli 预处理语句。',
  'sec.php-include.title': '对用户输入使用 include/require 或 unserialize', 'sec.php-include.advice': '为可引入的文件设置白名单；切勿对用户输入执行 unserialize。',
  'sec.weak-hash.title': '弱哈希（md5 / sha1）', 'sec.weak-hash.advice': '密码使用 bcrypt / argon2，完整性校验使用 SHA-256 及以上。',
  'sec.cors-wildcard.title': 'CORS 对所有来源开放', 'sec.cors-wildcard.advice': '将来源限制为已知域名。',
  'sec.tls-off.title': '已禁用 TLS 验证', 'sec.tls-off.advice': '启用证书验证。',
  'sec.weak-random.title': '使用 Math.random 生成令牌 / 密钥', 'sec.weak-random.advice': '使用 crypto.randomBytes / crypto.randomUUID。',
  'sec.chmod-777.title': '权限设为 777', 'sec.chmod-777.advice': '仅授予所需的最小权限。',
  'sec.env-not-ignored.title': '存在 .env 文件，但 .gitignore 未将其排除', 'sec.env-not-ignored.advice': '将 .env 加入 .gitignore，并轮换任何可能已被提交的密钥。',
  'sec.unpinned-deps.title': '依赖项未锁定版本', 'sec.unpinned-deps.advice': '锁定版本（semver），使构建可复现。',

  // ---- fired list modal ----
  'fd.title': '已解雇的智能体', 'fd.note': '解雇只会把智能体从办公室隐藏。~/.claude 中的会话文件不会被删除，因此可以恢复。',
  'fd.restore': '恢复', 'fd.empty': '没有被解雇的智能体。', 'fd.when': '{project} · {ago}解雇',

  // ---- chat ----
  'c.greetAgent': '你好！我是 {name}。想问点什么，还是给我下达指令？',
  'c.greetSec': '你好，我是项目 {name} 的安保。{scan} 我可以解释发现的问题、检查代码（只读），并编写可交给本项目智能体的修复提示词。',
  'c.scanCounts': '最近一次扫描：{h} 个高危，{m} 个中危，{l} 个低危。', 'c.scanPending': '扫描报告正在准备中…', 'c.scanSkipped': '此文件夹不是项目，所以我没有扫描。',
  'c.secTitle': '🛡 安保 · {name}', 'c.secSub': '房间守卫 · 只读', 'c.agentSub': '{role} · {status}',
  'c.phAgent': '给 {name} 写一条消息或指令…（Enter 发送，Shift+Enter 换行）',
  'c.phSec': '询问安保，或索取修复提示词…（Enter 发送，Shift+Enter 换行）',
  'c.msgAria': '消息', 'c.send': '发送', 'c.stop': '停止', 'c.closeAria': '关闭聊天',
  'c.q1.label': '总结最大风险', 'c.q1.text': '总结本项目中最大的风险，并按优先级排序。',
  'c.q2.label': '核实并生成修复提示词', 'c.q2.text': '通过阅读代码核实高危/中危发现，然后写一份我可以交给本项目智能体的修复提示词。',
  'c.q3.label': '为所有真实问题生成提示词', 'c.q3.text': '为每个真实存在的漏洞（忽略误报）编写修复提示词，以便我交给本项目的智能体。',
  'c.secBanner': '安保只能读取本项目的代码（不会读取 .env 等密钥文件）。它不会更改任何内容；修复提示词需要由你自己交给项目智能体。',
  'c.bannerLarge': '此会话历史非常大（{mb} MB），无法在这里继续（太慢且成本太高）。',
  'c.bannerFork': '该智能体正在别处运行，因此这里的聊天使用的是其会话的副本（分支）。原会话不会收到你的消息。',
  'c.bannerSize': '会话历史为 {mb} MB：首次回复可能较慢，并消耗大量 token。',
  'c.modeSafe': '🔒 安全模式（仅提问与读取）', 'c.modeEdit': '✎ 可编辑文件',
  'c.modeTipSafe': '智能体只能读取和回答。点击以允许编辑文件。', 'c.modeTipEdit': '智能体可以修改项目文件夹中的文件。点击返回安全模式。',
  'c.modeRO': '🔒 只读', 'c.modeROtip': '安保无法修改文件。',
  'c.cost': '对话成本 ≈ ${v}',
  'c.copy': '复制', 'c.copied': '已复制 ✓', 'c.copyFail': '复制失败', 'c.sendTo': '发送给智能体…',
  'c.pickAgent': '选择接收的智能体。提示词会填入其聊天框（尚未发送）。', 'c.noClaude': '此项目中没有 Claude 智能体。',
  'c.otherFloor': '该智能体在另一层。请乘电梯前往该楼层，打开该智能体的聊天并粘贴提示词（使用“复制”按钮）。',
  'c.prefillHint': '来自安保的提示词已填入消息框。请检查，启用“可编辑文件”以便智能体应用修复，然后发送。',
  'c.noText': '（无文字回复）', 'c.denied': '⛔ {tool} {target} 被拒绝',
  'c.deniedTipSec': '安保只能读取非密钥文件。', 'c.deniedTipSafe': '安全模式不允许此操作。请启用“可编辑文件”后重新提问。',
  'c.needPerm': '智能体需要权限才能执行该操作。请在上方启用“可编辑文件”，然后重复该指令。',
  'c.aborted': '（已停止）', 'c.abortedSuffix': ' …（已停止）', 'c.connFail': '连接失败：{msg}', 'c.genericErr': '出了点问题。',
  'e.not-supported': '这里只能与 Claude Code 智能体聊天。', 'e.busy': '该智能体仍在回复，请稍候。', 'e.too-many': '同时进行的对话过多。',
  'e.too-large': '此会话历史非常大（{mb} MB）；继续它会非常慢且成本很高。', 'e.empty': '消息为空。', 'e.no-folder': '未找到该智能体的工作文件夹。',
  'e.timeout': '已超时（10 分钟）。', 'e.stopped': '已停止。', 'e.spawn-failed': '无法运行 claude 命令。是否已安装 Claude Code？{detail}', 'e.cli-exit': 'claude 意外退出。{detail}',
  'e.sec-busy': '安保仍在回答，请稍候。', 'e.skipped': '此文件夹不是项目。', 'e.not-found': '未找到。',

  // ---- settings ----
  'set.title': '设置', 'set.language': '语言', 'set.langNote': '选择显示语言。立即生效，并会记在此浏览器中。',
  'set.close': '关闭',

  // ---- controller menu ----
  "set.tab.controller": "控制",
  "ctl.keys": "键盘和鼠标",
  "ctl.actions": "视图与操作",
  "ctl.k.move": "W A S D / 方向键",
  "ctl.move": "行走",
  "ctl.run": "奔跑",
  "ctl.follow": "镜头跟随你的角色",
  "ctl.overview": "查看整层楼",
  "ctl.k.pan": "拖动",
  "ctl.pan": "移动地图",
  "ctl.k.zoom": "鼠标滚轮",
  "ctl.zoom": "放大 / 缩小",
  "ctl.k.agent": "点击代理",
  "ctl.agent": "详情、成就、聊天、解雇",
  "ctl.k.monitor": "点击墙上的显示器",
  "ctl.monitor": "项目概要（任务 + PRD）",
  "ctl.k.guard": "点击保安（🛡）",
  "ctl.guard": "安全报告与聊天",
  "ctl.k.lift": "走进电梯",
  "ctl.lift": "选择其他楼层（或按 1-9）",
  "ctl.close": "关闭面板",
};

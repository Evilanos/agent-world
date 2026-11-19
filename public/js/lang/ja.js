// 日本語: en.js と同じキーを定義します。{name} のようなプレースホルダーは変更しないでください。
export default {
  // ---- header / static UI ----
  'hdr.sleeping': '休止中のエージェントを表示',
  'hdr.follow': 'キャラクターを追従', 'hdr.follow.tip': 'カメラがあなたのキャラクターを追いかけます (C)',
  'hdr.overview': 'フロア全体を表示', 'hdr.overview.tip': 'ズームアウトしてフロア全体を表示します',
  'hdr.fired': '解雇済み', 'hdr.fired.tip': '解雇したエージェントの一覧 (復帰できます)',
  'hdr.demo': 'デモ呼び出し', 'hdr.demo.stop': 'デモを停止', 'hdr.demo.tip': 'プレビュー: 数人のエージェントがあなたの所へ歩いてきます',
  'hdr.settings': '設定', 'hdr.settings.tip': '設定 (言語)',
  'chip.floors': 'フロア', 'chip.rooms': '部屋', 'chip.agents': 'エージェント', 'chip.online': 'オンライン', 'chip.working': '作業中', 'chip.waiting': 'あなたを待機中', 'chip.blocked': 'プロジェクト間を阻止',
  'floor.badge': '{n}階', 'floor.badge.yours': '{n}階 · あなたのフロア',
  'updated': '更新: {time}',
  'canvas.aria': 'ビルの1フロアの2D平面図。プロジェクトの部屋、遊び場、トイレ、リフトがあります。WASDキーでキャラクターを動かします。',
  'rooms.aria': 'このフロアの部屋', 'detail.aria': 'エージェントの詳細', 'lift.aria': 'リフトパネル', 'modal.aria': '詳細', 'chat.aria': 'エージェントとのチャット',
  'legend.busy': '作業中 (デスク)', 'legend.idle': '待機中 → 遊び場 / トイレ', 'legend.recent': '24時間以内に稼働', 'legend.sleeping': '休止中',
  'legend.ask': '? 意見を求めています', 'legend.done': '✓ 完了',
  "legend.hint": "WASD / 矢印キー: 移動 · エージェントをクリック: 詳細 · ⚙ 設定 → コントローラー: すべての操作",
  'err.load': 'エージェントのデータを読み込めませんでした: {msg}',
  'you': 'あなた',

  // ---- status / kinds / calls ----
  'status.busy': '作業中', 'status.idle': '待機中 (セッション開始済み)', 'status.recent': '24時間以内に稼働', 'status.sleeping': '休止中',
  'kind.claude': 'Claude Code', 'kind.antigravity': 'Antigravity (Gemini)', 'kind.security': 'セキュリティ',
  'call.ask.label': '意見を求めています', 'call.ask.bubble': 'ご意見は？', 'call.done.label': '完了', 'call.done.bubble': '完了 ✓',
  'demo.ask': '[デモ] A案とB案のどちらにしますか？', 'demo.done': '[デモ] タスクが完了し、すべてのテストに合格しました',

  // ---- outfits ----
  'role.finance.label': '経理・財務', 'role.finance.desc': 'スーツ、ネクタイ、眼鏡',
  'role.it.label': 'ITサポート', 'role.it.desc': 'ポロシャツ、ストラップ、ヘッドセット',
  'role.engineer.label': 'エンジニア', 'role.engineer.desc': 'パーカー',
  'role.game.label': 'ゲーム開発', 'role.game.desc': 'キャップとヘッドホン',
  'role.ai.label': 'AIラボ', 'role.ai.desc': '白衣とゴーグル',
  'role.design.label': 'デザイナー', 'role.design.desc': 'ベレー帽とエプロン',
  'role.casual.label': 'スタッフ', 'role.casual.desc': 'カジュアルなTシャツ',
  'role.security.label': '警備', 'role.security.desc': '制服とベスト',

  // ---- relative time ----
  'ago.none': '—', 'ago.now': 'たった今', 'ago.min': '{n}分前', 'ago.hour': '{n}時間前', 'ago.day': '{n}日前',

  // ---- rooms drawn on the canvas / sidebar ----
  'room.fun': '遊び場', 'room.fun.sub': 'くつろぎ · コーヒー · 卓球', 'room.fun.tv': '▶ 遊び場',
  'room.toilet': 'トイレ', 'room.toilet.sub': 'WC',
  'room.lift': 'リフト', 'room.lift.sub': 'リフト', 'room.lift.label': 'リフト', 'room.floor': '{n}階',
  'room.office': 'あなたのオフィス', 'room.office.sub': '{n}階 · 個室オフィス',
  'room.lobby': '{n}階ロビー',
  'room.empty': '空き部屋', 'room.empty.sub': 'プロジェクトはまだありません',
  'room.projsub': '{role} · エージェント{agents}人 · オンライン{live}人',
  'board.none': 'タスクはまだありません。', 'board.click': 'クリック: タスク概要 / PRD',
  'desk.inbox': '受信 {n}', 'desk.you': 'あなた',
  'side.fun': '{n}人がくつろぎ中', 'side.toilet': '{n}人がトイレにいます', 'side.lift': 'フロア移動', 'side.office': '個室オフィス',

  // ---- lift ----
  'lift.title': 'リフト', 'lift.where': '現在{n}階にいます。行き先を選んでください:', 'lift.projAgents': 'プロジェクト{p}件 · エージェント{a}人',
  'lift.waiting': '{n}件があなたを待機中', 'lift.yours': 'あなたのフロア', 'lift.hint': '数字キーを押すか、リフトから出ると閉じます。', 'lift.going': '{n}階へ移動中…',

  // ---- guards ----
  'guard.name': 'セキュリティ', 'guard.title': 'セキュリティ · {name}',
  'guard.watch': '👀 プロジェクト間の混在を監視中', 'guard.block': '🚫 別のプロジェクトです！',
  'guard.scanning': '🔍 スキャン中…', 'guard.skipped': '🔍 プロジェクトではありません', 'guard.findings': '🔍 検出{n}件',

  // ---- poses (what the agent is doing) ----
  'doing.work': 'デスクで作業中', 'doing.sleep': 'デスクで居眠り中', 'doing.sofa': 'ソファでくつろぎ中', 'doing.drink': 'コーヒーを飲んでいます',
  'doing.pingpong': '卓球中', 'doing.chat': '雑談中', 'doing.pee': '用を足しています', 'doing.poop': '大きい方をしています', 'doing.wash': '手を洗っています',
  'doing.stand': 'ぶらぶらしています', 'doing.wave': 'あなたに手を振っています', 'doing.cheer': '報告: 完了しました！', 'doing.plead': '解雇しないでと懇願中', 'doing.sad': '悲しんでいます',

  // ---- tools an agent is using ({target} is a file / pattern / command) ----
  'act.edit': '{target} を編集中', 'act.write': '{target} を書き込み中', 'act.read': '{target} を読み込み中', 'act.search': '{target} を検索中', 'act.run': '{target} を実行中',
  'act.delegate': '{target} を委任中', 'act.web': 'Webで調査中 {target}', 'act.fetch': 'Webを読み込み中 {target}', 'act.plan': '{target} を計画中', 'act.use': '{tool} を使用中 {target}',

  // ---- agent panel ----
  'p.close': '閉じる', 'p.closeDetail': '詳細を閉じる', 'p.chat': '💬 チャット / 指示を出す',
  'p.uniform': '制服', 'p.now': '現在の状況', 'p.activity': 'アクティビティ', 'p.tool': 'ツール', 'p.lastReply': '最後の返信', 'p.info': '情報',
  'p.type': '種類', 'p.folder': 'フォルダー', 'p.worktree': 'Worktree', 'p.source': 'ソース', 'p.pid': 'PID', 'p.lastActive': '最終アクティビティ', 'p.id': 'ID',
  'p.subagents': 'サブエージェント ({n})', 'p.noSubagents': '記録されたサブエージェントはありません。', 'p.fire': 'エージェントを解雇…',
  'p.ack': '確認しました — 部屋に戻る', 'p.noSummary': '(概要なし)',

  // ---- achievements ----
  'ach.title': '実績', 'ach.loading': '作業履歴を読み込み中… (大きなトランスクリプトは数秒かかることがあります)', 'ach.fail': '失敗しました: {msg}',
  'ach.prompts': '件のタスク (あなたから)', 'ach.edit': '個のファイルを編集/書き込み', 'ach.bash': '個のコマンドを実行', 'ach.read': '回の検索と読み込み', 'ach.web': '回のWeb調査', 'ach.agent': '件のサブエージェント委任',
  'ach.since': '{date} から作業中 · 最終 {ago}', 'ach.partial': ' · (履歴が非常に長いため、一部のみスキャン)',
  'ach.topics': '取り組んだトピック', 'ach.outline': 'タスクの概要', 'ach.none': '記録されたタスクはまだありません。', 'ach.noTranscript': 'このエージェントにはトランスクリプト履歴がありません。',

  // ---- firing ----
  'def.title': '🙏 {name} の弁明',
  'def.plea': '「待ってください、ボス！ 解雇する前に、まず私の仕事ぶりを見てください。」',
  'def.stats': '「あなたから{prompts}件のタスクを受け、{edits}個のファイルを編集し、{cmds}個のコマンドを実行しました。どうかご再考ください。」',
  'def.statsNone': '「これが私のすべての仕事です。どうかご再考ください。」',
  'def.view': '私の実績を見る', 'def.cancel': 'キャンセル', 'def.confirm': 'それでも解雇する', 'def.spare': 'もう一度チャンスを与える',
  'def.note': '解雇するとエージェントがオフィスから非表示になるだけです (「解雇済み」ボタンから復帰できます)。',
  'def.err409': 'サーバーに拒否されました: 解雇する前にこのエージェントの実績を確認してください。', 'def.errHttp': '解雇できませんでした (HTTP {n})',

  // ---- guard panel ----
  'g.title': '🛡 セキュリティ', 'g.badge': '部屋の警備員', 'g.duties': '任務',
  'g.duty1': '異なるプロジェクトのエージェント同士が会話したり、共同で作業したりしないようにします。', 'g.duty2': 'このプロジェクトで構築されたシステムのセキュリティを確認します。',
  'g.status': 'ステータス', 'g.vulns': 'システムの脆弱性', 'g.counts': '高 {h} · 中 {m} · 低 {l}', 'g.notproject': 'プロジェクトではありません', 'g.scanning': 'スキャン中…',
  'g.blocked': 'プロジェクト間を阻止', 'g.blockedVal': '{n}回 (このセッション)',
  'g.chat': '💬 セキュリティとチャット', 'g.report': 'セキュリティレポートを開く', 'g.chatHint': '検出内容の検証と、このプロジェクトのエージェントに渡せる修正プロンプトの作成をセキュリティに依頼できます。',

  // ---- project summary modal ----
  'pm.loading': 'プロジェクト概要を読み込み中…', 'pm.fail': '概要を読み込めませんでした: {msg}', 'pm.tasks': '現在のタスク', 'pm.noTasks': '記録されたタスクはまだありません。',
  'pm.docs': 'PRD / プロジェクト文書', 'pm.noDocs': 'このプロジェクトフォルダーに PRD.md / README.md はありません。', 'pm.excerpt': ' (冒頭部分のみ)',

  // ---- security report modal ----
  'sm.scanning': 'セキュリティがプロジェクトのコードをスキャンしています…', 'sm.title': '🛡 セキュリティレポート · {name}',
  'sm.chip.high': '高', 'sm.chip.medium': '中', 'sm.chip.low': '低', 'sm.files': '個のファイルをスキャン', 'sm.ms': 'ms',
  'sm.disclaimer': 'ローカルの静的スキャンです (コードや設定内の危険なパターンを検出します)。シークレットの値は常にマスクされます。完全な監査の代わりにはなりません。',
  'sm.truncated': ' 結果が切り詰められました (ファイル数/時間の上限)。', 'sm.rescan': '再スキャン', 'sm.clean': '使用したルールでは検出されませんでした。👍', 'sm.fail': 'レポートを読み込めませんでした: {msg}',
  'sm.skipped': 'このフォルダーはユーザーのホームフォルダーでありプロジェクトではないため、スキャンしませんでした。', 'sm.notFound': 'プロジェクトフォルダーが見つかりません。',
  'sev.high': '高', 'sev.medium': '中', 'sev.low': '低',
  'sec.aws-key.title': 'AWSアクセスキーがコードに埋め込まれています', 'sec.aws-key.advice': 'キーを失効させ、環境変数またはシークレットマネージャーに移してください。',
  'sec.private-key.title': '秘密鍵がリポジトリにコミットされています', 'sec.private-key.advice': 'リポジトリから削除し、鍵をローテーションして、保管庫に保存してください。',
  'sec.token.title': 'APIトークン (GitHub / OpenAI / Slack) が埋め込まれています', 'sec.token.advice': 'トークンを失効させ、環境変数を使用してください。',
  'sec.hardcoded-secret.title': 'パスワード / シークレット / トークンがハードコードされています', 'sec.hardcoded-secret.advice': '.env またはシークレットマネージャーに移してください。',
  'sec.cmd-injection.title': '動的な入力によるコマンド実行 (コマンドインジェクション)', 'sec.cmd-injection.advice': 'execFile / 引数配列を使用し、入力を検証してください。',
  'sec.eval.title': 'eval / new Function の使用', 'sec.eval.advice': 'eval を避け、データは JSON.parse または安全なライブラリで解析してください。',
  'sec.xss-innerhtml.title': 'XSSの可能性 (innerHTML / document.write)', 'sec.xss-innerhtml.advice': 'textContent を使用するか、サニタイズ (DOMPurify) してください。',
  'sec.php-xss.title': 'PHPがユーザー入力をエスケープせずに出力しています (XSS)', 'sec.php-xss.advice': 'htmlspecialchars() で囲んでください。',
  'sec.sqli-input.title': 'SQLクエリがユーザー入力を直接使用しています (SQLインジェクション)', 'sec.sqli-input.advice': 'プリペアドステートメント / パラメーターバインドを使用してください。',
  'sec.sqli-concat.title': 'SQLクエリが文字列から組み立てられています (値の出所を確認してください)', 'sec.sqli-concat.advice': '値が信頼できるコード由来であることを確認し、そうでなければパラメーターバインドを使用してください。',
  'sec.php-mysql.title': '非推奨の mysql_* 関数 (脆弱でサポート終了)', 'sec.php-mysql.advice': 'PDO / mysqli のプリペアドステートメントへ移行してください。',
  'sec.php-include.title': 'ユーザー入力に対する include/require または unserialize', 'sec.php-include.advice': 'include できるファイルをホワイトリストで制限し、ユーザー入力は決して unserialize しないでください。',
  'sec.weak-hash.title': '脆弱なハッシュ (md5 / sha1)', 'sec.weak-hash.advice': 'パスワードには bcrypt / argon2、整合性チェックには SHA-256 以上を使用してください。',
  'sec.cors-wildcard.title': 'CORSがすべてのオリジンに開放されています', 'sec.cors-wildcard.advice': 'オリジンを既知のドメインに制限してください。',
  'sec.tls-off.title': 'TLS検証が無効になっています', 'sec.tls-off.advice': '証明書の検証を有効にしてください。',
  'sec.weak-random.title': 'トークン / シークレットに Math.random を使用しています', 'sec.weak-random.advice': 'crypto.randomBytes / crypto.randomUUID を使用してください。',
  'sec.chmod-777.title': 'パーミッション 777', 'sec.chmod-777.advice': '必要最小限の権限のみを付与してください。',
  'sec.env-not-ignored.title': '.env ファイルが存在しますが、.gitignore で除外されていません', 'sec.env-not-ignored.advice': '.env を .gitignore に追加し、すでにコミットされた可能性のあるシークレットはローテーションしてください。',
  'sec.unpinned-deps.title': 'バージョンが固定されていない依存関係', 'sec.unpinned-deps.advice': 'ビルドを再現可能にするため、バージョン (semver) を固定してください。',

  // ---- fired list modal ----
  'fd.title': '解雇済みエージェント', 'fd.note': '解雇するとエージェントがオフィスから非表示になるだけです。~/.claude のセッションファイルは削除されないため、復帰できます。',
  'fd.restore': '復帰', 'fd.empty': '解雇されたエージェントはいません。', 'fd.when': '{project} · {ago}に解雇',

  // ---- chat ----
  'c.greetAgent': 'こんにちは！ {name} です。何か質問や指示はありますか？',
  'c.greetSec': 'こんにちは、プロジェクト {name} のセキュリティです。{scan} 検出内容の説明、コードの確認 (読み取り専用)、このプロジェクトのエージェントに渡せる修正プロンプトの作成ができます。',
  'c.scanCounts': '最新のスキャン: 高 {h}件、中 {m}件、低 {l}件。', 'c.scanPending': 'スキャンレポートを準備中です…', 'c.scanSkipped': 'このフォルダーはプロジェクトではないため、スキャンしませんでした。',
  'c.secTitle': '🛡 セキュリティ · {name}', 'c.secSub': '部屋の警備員 · 読み取り専用', 'c.agentSub': '{role} · {status}',
  'c.phAgent': '{name} へのメッセージまたは指示を入力…  (Enterで送信、Shift+Enterで改行)',
  'c.phSec': 'セキュリティに質問、または修正プロンプトを依頼…  (Enterで送信、Shift+Enterで改行)',
  'c.msgAria': 'メッセージ', 'c.send': '送信', 'c.stop': '停止', 'c.closeAria': 'チャットを閉じる',
  'c.q1.label': '主なリスクを要約', 'c.q1.text': 'このプロジェクトの主なリスクを要約し、優先度順に並べてください。',
  'c.q2.label': '検証 + 修正プロンプト', 'c.q2.text': '高/中の検出内容をコードを読んで検証し、このプロジェクトのエージェントに渡せる修正プロンプトを1つ作成してください。',
  'c.q3.label': '実際の検出すべてのプロンプト', 'c.q3.text': '実際の脆弱性である検出内容すべて (誤検出は除く) について修正プロンプトを作成してください。このプロジェクトのエージェントに渡します。',
  'c.secBanner': 'セキュリティはこのプロジェクトのコードを読み取ることしかできません (.env などのシークレットファイルは読み取りません)。何も変更しないため、修正プロンプトはあなた自身でプロジェクトのエージェントに渡してください。',
  'c.bannerLarge': 'このセッション履歴は非常に大きい ({mb} MB) ため、ここから再開できません (遅く、費用もかかりすぎます)。',
  'c.bannerFork': 'このエージェントは別の場所で実行中のため、ここでのチャットにはセッションのコピー (ブランチ) を使用します。元のセッションにはメッセージが届きません。',
  'c.bannerSize': 'セッション履歴は {mb} MB です。最初の返信は遅くなり、多くのトークンを消費する場合があります。',
  'c.modeSafe': '🔒 セーフモード (質問と読み取りのみ)', 'c.modeEdit': '✎ ファイル編集を許可',
  'c.modeTipSafe': 'エージェントは読み取りと回答のみ可能です。クリックするとファイル編集を許可します。', 'c.modeTipEdit': 'エージェントはプロジェクトフォルダー内のファイルを変更できます。クリックするとセーフモードに戻ります。',
  'c.modeRO': '🔒 読み取り専用', 'c.modeROtip': 'セキュリティはファイルを変更できません。',
  'c.cost': '会話コスト ≈ ${v}',
  'c.copy': 'コピー', 'c.copied': 'コピーしました ✓', 'c.copyFail': 'コピーに失敗しました', 'c.sendTo': 'エージェントに送る…',
  'c.pickAgent': '送信先のエージェントを選んでください。プロンプトはそのチャットに入力されます (まだ送信されません)。', 'c.noClaude': 'このプロジェクトにClaudeエージェントはいません。',
  'c.otherFloor': 'このエージェントは別のフロアにいます。リフトでそのフロアへ移動し、エージェントのチャットを開いてプロンプトを貼り付けてください (コピーボタンを使用)。',
  'c.prefillHint': 'セキュリティからのプロンプトがメッセージ欄に入力されています。内容を確認し、エージェントが修正を適用できるよう「ファイル編集を許可」を有効にしてから送信してください。',
  'c.noText': '(テキストの返信なし)', 'c.denied': '⛔ {tool} {target} は拒否されました',
  'c.deniedTipSec': 'セキュリティはシークレット以外のファイルしか読み取れません。', 'c.deniedTipSafe': 'セーフモードではこの操作は許可されません。「ファイル編集を許可」を有効にして、もう一度お試しください。',
  'c.needPerm': 'エージェントがそれを行うには許可が必要です。上の「ファイル編集を許可」を有効にして、指示をもう一度送ってください。',
  'c.aborted': '(停止しました)', 'c.abortedSuffix': ' …(停止)', 'c.connFail': '接続に失敗しました: {msg}', 'c.genericErr': '問題が発生しました。',
  'e.not-supported': 'ここからチャットできるのは Claude Code のエージェントのみです。', 'e.busy': 'このエージェントはまだ返信中です。しばらくお待ちください。', 'e.too-many': '同時に実行中の会話が多すぎます。',
  'e.too-large': 'このセッション履歴は非常に大きい ({mb} MB) ため、再開すると非常に遅く、費用もかかります。', 'e.empty': 'メッセージが空です。', 'e.no-folder': 'エージェントの作業フォルダーが見つかりませんでした。',
  'e.timeout': 'タイムアウトしました (10分)。', 'e.stopped': '停止しました。', 'e.spawn-failed': 'claude コマンドを実行できませんでした。Claude Code はインストールされていますか？ {detail}', 'e.cli-exit': 'claude が予期せず終了しました。{detail}',
  'e.sec-busy': 'セキュリティはまだ回答中です。しばらくお待ちください。', 'e.skipped': 'このフォルダーはプロジェクトではありません。', 'e.not-found': '見つかりません。',

  // ---- settings ----
  'set.title': '設定', 'set.language': '言語', 'set.langNote': '表示言語を選択します。すぐに反映され、このブラウザーに記憶されます。',
  'set.close': '閉じる',

  // ---- controller menu ----
  "set.tab.controller": "コントローラー",
  "ctl.keys": "キーボードとマウス",
  "ctl.actions": "表示と操作",
  "ctl.k.move": "W A S D / 矢印キー",
  "ctl.move": "歩く",
  "ctl.run": "走る",
  "ctl.follow": "カメラがキャラクターを追う",
  "ctl.overview": "フロア全体を表示",
  "ctl.k.pan": "ドラッグ",
  "ctl.pan": "マップを動かす",
  "ctl.k.zoom": "マウスホイール",
  "ctl.zoom": "拡大 / 縮小",
  "ctl.k.agent": "エージェントをクリック",
  "ctl.agent": "詳細・実績・チャット・解雇",
  "ctl.k.monitor": "壁のモニターをクリック",
  "ctl.monitor": "プロジェクト概要（タスク + PRD）",
  "ctl.k.guard": "警備員（🛡）をクリック",
  "ctl.guard": "セキュリティレポートとチャット",
  "ctl.k.lift": "リフトに入る",
  "ctl.lift": "別のフロアを選ぶ（または 1〜9 キー）",
  "ctl.close": "パネルを閉じる",
};

// Bahasa Indonesia
export default {
  // ---- header / static UI ----
  'hdr.sleeping': 'Tampilkan agent tidur',
  'hdr.follow': 'Ikuti karakter', 'hdr.follow.tip': 'Kamera mengikuti karakter Anda (C)',
  'hdr.overview': 'Lihat satu lantai', 'hdr.overview.tip': 'Lihat seluruh lantai',
  'hdr.fired': 'Dipecat', 'hdr.fired.tip': 'Daftar agent yang dipecat (bisa dipulihkan)',
  'hdr.demo': 'Demo panggilan', 'hdr.demo.stop': 'Hentikan demo', 'hdr.demo.tip': 'Pratinjau: beberapa agent berjalan menemui Anda',
  'hdr.settings': 'Pengaturan', 'hdr.settings.tip': 'Pengaturan (bahasa)',
  'chip.floors': 'lantai', 'chip.rooms': 'ruangan', 'chip.agents': 'agent', 'chip.online': 'online', 'chip.working': 'bekerja', 'chip.waiting': 'menunggu Anda', 'chip.blocked': 'lintas project dicegah',
  'floor.badge': 'Lantai {n}', 'floor.badge.yours': 'Lantai {n} · lantai Anda',
  'updated': 'Diperbarui {time}',
  'canvas.aria': 'Denah 2D satu lantai gedung berisi ruangan project, fun area, toilet dan lift. Gunakan WASD untuk menggerakkan karakter Anda.',
  'rooms.aria': 'Daftar ruangan di lantai ini', 'detail.aria': 'Detail agent', 'lift.aria': 'Panel lift', 'modal.aria': 'Detail', 'chat.aria': 'Chat dengan agent',
  'legend.busy': 'Bekerja (di meja)', 'legend.idle': 'Siaga → fun area / toilet', 'legend.recent': 'Aktif < 24 jam', 'legend.sleeping': 'Tidur',
  'legend.ask': '? Butuh pendapat', 'legend.done': '✓ Selesai',
  "legend.hint": "WASD / panah: jalan · Klik agent untuk detail · ⚙ Pengaturan → Controller: semua kontrol",
  'err.load': 'Gagal memuat data agent: {msg}',
  'you': 'Anda',

  // ---- status / kinds / calls ----
  'status.busy': 'Bekerja', 'status.idle': 'Siaga (sesi terbuka)', 'status.recent': 'Aktif < 24 jam', 'status.sleeping': 'Tidur',
  'kind.claude': 'Claude Code', 'kind.antigravity': 'Antigravity (Gemini)', 'kind.security': 'Security',
  'call.ask.label': 'Butuh pendapat Anda', 'call.ask.bubble': 'Pendapat Anda ?', 'call.done.label': 'Sudah selesai', 'call.done.bubble': 'Selesai ✓',
  'demo.ask': '[Demo] Pakai pendekatan A atau B?', 'demo.done': '[Demo] Tugas selesai, semua lulus',

  // ---- outfits ----
  'role.finance.label': 'Finance', 'role.finance.desc': 'jas, dasi & kacamata',
  'role.it.label': 'IT Support', 'role.it.desc': 'polo, lanyard & headset',
  'role.engineer.label': 'Engineer', 'role.engineer.desc': 'hoodie',
  'role.game.label': 'Game Dev', 'role.game.desc': 'topi & headphone',
  'role.ai.label': 'AI Lab', 'role.ai.desc': 'jas lab & goggles',
  'role.design.label': 'Designer', 'role.design.desc': 'beret & apron',
  'role.casual.label': 'Staf', 'role.casual.desc': 'kaos kasual',
  'role.security.label': 'Security', 'role.security.desc': 'seragam & rompi',

  // ---- relative time ----
  'ago.none': '—', 'ago.now': 'baru saja', 'ago.min': '{n} mnt lalu', 'ago.hour': '{n} jam lalu', 'ago.day': '{n} hari lalu',

  // ---- rooms drawn on the canvas / sidebar ----
  'room.fun': 'Fun Area', 'room.fun.sub': 'santai · ngopi · pingpong', 'room.fun.tv': '▶ FUN AREA',
  'room.toilet': 'Toilet', 'room.toilet.sub': 'WC',
  'room.lift': 'Lift', 'room.lift.sub': 'lift', 'room.lift.label': 'LIFT', 'room.floor': 'LANTAI {n}',
  'room.office': 'Ruang Anda', 'room.office.sub': 'lantai {n} · kantor pribadi',
  'room.lobby': 'Lobi lantai {n}',
  'room.empty': 'Ruang kosong', 'room.empty.sub': 'belum ada project',
  'room.projsub': '{role} · {agents} agent · {live} online',
  'board.none': 'Belum ada task.', 'board.click': 'KLIK: RINGKASAN TASK / PRD',
  'desk.inbox': 'INBOX {n}', 'desk.you': 'ANDA',
  'side.fun': '{n} agent bersantai', 'side.toilet': '{n} agent di toilet', 'side.lift': 'pindah lantai', 'side.office': 'kantor pribadi',

  // ---- lift ----
  'lift.title': 'Lift', 'lift.where': 'Anda di lantai {n}. Pilih lantai tujuan:', 'lift.projAgents': '{p} project · {a} agent',
  'lift.waiting': '{n} menunggu Anda', 'lift.yours': 'lantai Anda', 'lift.hint': 'Tekan angka di keyboard, atau keluar dari lift untuk menutup.', 'lift.going': 'Menuju lantai {n}…',

  // ---- guards ----
  'guard.name': 'Security', 'guard.title': 'Security · {name}',
  'guard.watch': '👀 awasi lintas project', 'guard.block': '🚫 Beda project!',
  'guard.scanning': '🔍 memindai…', 'guard.skipped': '🔍 bukan project', 'guard.findings': '🔍 {n} temuan',

  // ---- poses ----
  'doing.work': 'Bekerja di meja', 'doing.sleep': 'Tertidur di meja', 'doing.sofa': 'Santai di sofa', 'doing.drink': 'Ngopi',
  'doing.pingpong': 'Main pingpong', 'doing.chat': 'Ngobrol', 'doing.pee': 'Buang air kecil', 'doing.poop': 'Buang air besar', 'doing.wash': 'Cuci tangan',
  'doing.stand': 'Bersantai', 'doing.wave': 'Melambai ke Anda', 'doing.cheer': 'Melapor: selesai!', 'doing.plead': 'Memohon agar tidak dipecat', 'doing.sad': 'Sedih',

  // ---- tools ----
  'act.edit': 'Mengedit {target}', 'act.write': 'Menulis {target}', 'act.read': 'Membaca {target}', 'act.search': 'Mencari {target}', 'act.run': 'Menjalankan {target}',
  'act.delegate': 'Mendelegasikan {target}', 'act.web': 'Riset web {target}', 'act.fetch': 'Membaca web {target}', 'act.plan': 'Merencanakan {target}', 'act.use': 'Memakai {tool} {target}',

  // ---- agent panel ----
  'p.close': 'Tutup', 'p.closeDetail': 'Tutup detail', 'p.chat': '💬 Ngobrol / beri perintah',
  'p.uniform': 'Seragam', 'p.now': 'Sedang', 'p.activity': 'Aktivitas', 'p.tool': 'Tool', 'p.lastReply': 'Balasan terakhir', 'p.info': 'Info',
  'p.type': 'Jenis', 'p.folder': 'Folder', 'p.worktree': 'Worktree', 'p.source': 'Sumber', 'p.pid': 'PID', 'p.lastActive': 'Aktivitas terakhir', 'p.id': 'ID',
  'p.subagents': 'Subagent ({n})', 'p.noSubagents': 'Tidak ada subagent tercatat.', 'p.fire': 'Pecat agent…',
  'p.ack': 'Sudah saya lihat — kembali ke ruangan', 'p.noSummary': '(tidak ada ringkasan)',

  // ---- achievements ----
  'ach.title': 'Pencapaian', 'ach.loading': 'Membaca riwayat kerja… (transkrip besar bisa memakan beberapa detik)', 'ach.fail': 'Gagal: {msg}',
  'ach.prompts': 'tugas dari Anda', 'ach.edit': 'file diedit/ditulis', 'ach.bash': 'perintah dijalankan', 'ach.read': 'pencarian & bacaan', 'ach.web': 'riset web', 'ach.agent': 'subagent didelegasikan',
  'ach.since': 'Bekerja sejak {date} · terakhir {ago}', 'ach.partial': ' · (riwayat sangat panjang, sebagian dipindai)',
  'ach.topics': 'Topik yang dikerjakan', 'ach.outline': 'Garis besar tugas', 'ach.none': 'Belum ada tugas tercatat.', 'ach.noTranscript': 'Tidak ada riwayat transkrip untuk agent ini.',

  // ---- firing ----
  'def.title': '🙏 {name} membela diri',
  'def.plea': '“Tunggu dulu, Bos! Sebelum Anda memecat saya, tolong lihat dulu apa saja yang sudah saya kerjakan.”',
  'def.stats': '“Saya sudah menerima {prompts} tugas dari Anda, mengedit {edits} file dan menjalankan {cmds} perintah. Mohon pertimbangkan kembali.”',
  'def.statsNone': '“Itu semua yang sudah saya kerjakan. Mohon pertimbangkan kembali.”',
  'def.view': 'Lihat pencapaian saya', 'def.cancel': 'Batal', 'def.confirm': 'Tetap pecat', 'def.spare': 'Beri kesempatan lagi',
  'def.note': 'Pemecatan hanya menyembunyikan agent dari kantor (bisa dipulihkan lewat tombol “Dipecat”).',
  'def.err409': 'Server menolak: lihat pencapaian agent ini dulu sebelum memecatnya.', 'def.errHttp': 'Gagal memecat (HTTP {n})',

  // ---- guard panel ----
  'g.title': '🛡 Security', 'g.badge': 'Penjaga ruangan', 'g.duties': 'Tugas',
  'g.duty1': 'Mencegah agent dari project yang berbeda mengobrol atau bekerja bersamaan.', 'g.duty2': 'Memeriksa celah keamanan pada sistem yang dibangun di project ini.',
  'g.status': 'Status', 'g.vulns': 'Celah sistem', 'g.counts': '{h} tinggi · {m} sedang · {l} rendah', 'g.notproject': 'bukan project', 'g.scanning': 'memindai…',
  'g.blocked': 'Lintas project dicegah', 'g.blockedVal': '{n}× (sesi ini)',
  'g.chat': '💬 Ngobrol dengan Security', 'g.report': 'Buka laporan celah sistem', 'g.chatHint': 'Minta Security memverifikasi temuan dan membuatkan prompt perbaikan untuk dilempar ke agent project ini.',

  // ---- project summary modal ----
  'pm.loading': 'Memuat ringkasan project…', 'pm.fail': 'Gagal memuat ringkasan: {msg}', 'pm.tasks': 'Task saat ini', 'pm.noTasks': 'Belum ada task tercatat.',
  'pm.docs': 'PRD / dokumen project', 'pm.noDocs': 'Tidak ada PRD.md / README.md di folder project ini.', 'pm.excerpt': ' (potongan awal)',

  // ---- security report modal ----
  'sm.scanning': 'Security sedang memindai kode project…', 'sm.title': '🛡 Laporan Security · {name}',
  'sm.chip.high': 'tinggi', 'sm.chip.medium': 'sedang', 'sm.chip.low': 'rendah', 'sm.files': 'file dipindai', 'sm.ms': 'ms',
  'sm.disclaimer': 'Pemindaian statis lokal (pola berisiko di kode & konfigurasi). Nilai rahasia selalu disamarkan. Ini bukan pengganti audit penuh.',
  'sm.truncated': ' Hasil dipotong (batas file/waktu).', 'sm.rescan': 'Pindai ulang', 'sm.clean': 'Tidak ada temuan dari aturan yang dipakai. 👍', 'sm.fail': 'Gagal memuat laporan: {msg}',
  'sm.skipped': 'Folder ini adalah folder Home pengguna, bukan sebuah project, jadi tidak dipindai.', 'sm.notFound': 'Folder project tidak ditemukan.',
  'sev.high': 'Tinggi', 'sev.medium': 'Sedang', 'sev.low': 'Rendah',
  'sec.aws-key.title': 'AWS access key tertanam di kode', 'sec.aws-key.advice': 'Cabut kunci, pindahkan ke environment / secret manager.',
  'sec.private-key.title': 'Private key tertanam di repo', 'sec.private-key.advice': 'Hapus dari repo, rotasi key, simpan di vault.',
  'sec.token.title': 'Token API (GitHub / OpenAI / Slack) tertanam', 'sec.token.advice': 'Revoke token dan pakai environment variable.',
  'sec.hardcoded-secret.title': 'Password / secret / token di-hardcode', 'sec.hardcoded-secret.advice': 'Pindahkan ke .env atau secret manager.',
  'sec.cmd-injection.title': 'Eksekusi perintah dengan input dinamis (command injection)', 'sec.cmd-injection.advice': 'Pakai execFile / argumen array dan validasi input.',
  'sec.eval.title': 'Penggunaan eval / new Function', 'sec.eval.advice': 'Hindari eval; parse data dengan JSON.parse atau pustaka aman.',
  'sec.xss-innerhtml.title': 'Potensi XSS (innerHTML / document.write)', 'sec.xss-innerhtml.advice': 'Gunakan textContent atau sanitasi (DOMPurify).',
  'sec.php-xss.title': 'PHP mencetak input pengguna tanpa escape (XSS)', 'sec.php-xss.advice': 'Bungkus dengan htmlspecialchars().',
  'sec.sqli-input.title': 'Query SQL memakai input pengguna langsung (SQL injection)', 'sec.sqli-input.advice': 'Pakai prepared statement / parameter binding.',
  'sec.sqli-concat.title': 'Query SQL disusun dari string (periksa asal nilainya)', 'sec.sqli-concat.advice': 'Pastikan nilai berasal dari kode tepercaya; selebihnya pakai parameter binding.',
  'sec.php-mysql.title': 'Fungsi mysql_* usang (rentan & tidak didukung)', 'sec.php-mysql.advice': 'Migrasi ke PDO / mysqli prepared statement.',
  'sec.php-include.title': 'include/require atau unserialize dari input pengguna', 'sec.php-include.advice': 'Whitelist file yang boleh di-include; jangan unserialize input.',
  'sec.weak-hash.title': 'Hash lemah (md5 / sha1)', 'sec.weak-hash.advice': 'Gunakan bcrypt / argon2 untuk password, SHA-256+ untuk integritas.',
  'sec.cors-wildcard.title': 'CORS terbuka untuk semua origin', 'sec.cors-wildcard.advice': 'Batasi origin ke domain yang dikenal.',
  'sec.tls-off.title': 'Verifikasi TLS dimatikan', 'sec.tls-off.advice': 'Aktifkan verifikasi sertifikat.',
  'sec.weak-random.title': 'Math.random dipakai untuk token / secret', 'sec.weak-random.advice': 'Gunakan crypto.randomBytes / crypto.randomUUID.',
  'sec.chmod-777.title': 'Permission 777', 'sec.chmod-777.advice': 'Beri izin minimum yang dibutuhkan.',
  'sec.env-not-ignored.title': 'File .env ada tetapi .gitignore tidak mengecualikannya', 'sec.env-not-ignored.advice': 'Tambahkan .env ke .gitignore dan rotasi secret yang mungkin sudah ter-commit.',
  'sec.unpinned-deps.title': 'Dependensi tanpa versi terkunci', 'sec.unpinned-deps.advice': 'Kunci versi (semver) agar build bisa direproduksi.',

  // ---- fired list modal ----
  'fd.title': 'Agent yang dipecat', 'fd.note': 'Pemecatan hanya menyembunyikan agent dari kantor. File sesi di ~/.claude tidak dihapus, jadi bisa dipulihkan.',
  'fd.restore': 'Pulihkan', 'fd.empty': 'Belum ada agent yang dipecat.', 'fd.when': '{project} · dipecat {ago}',

  // ---- chat ----
  'c.greetAgent': 'Halo! Saya {name}. Mau tanya sesuatu atau beri saya perintah?',
  'c.greetSec': 'Halo, saya Security untuk project {name}. {scan} Saya bisa menjelaskan temuan, memeriksa kodenya (hanya baca), dan membuatkan prompt perbaikan yang bisa Anda lempar ke agent project ini.',
  'c.scanCounts': 'Pemindaian terakhir: {h} tinggi, {m} sedang, {l} rendah.', 'c.scanPending': 'Laporan pemindaian sedang disiapkan…', 'c.scanSkipped': 'Folder ini bukan project, jadi saya tidak memindainya.',
  'c.secTitle': '🛡 Security · {name}', 'c.secSub': 'Penjaga ruangan · hanya baca', 'c.agentSub': '{role} · {status}',
  'c.phAgent': 'Tulis pesan atau perintah untuk {name}…  (Enter kirim, Shift+Enter baris baru)',
  'c.phSec': 'Tanya Security, atau minta dibuatkan prompt perbaikan…  (Enter kirim, Shift+Enter baris baru)',
  'c.msgAria': 'Pesan', 'c.send': 'Kirim', 'c.stop': 'Stop', 'c.closeAria': 'Tutup chat',
  'c.q1.label': 'Rangkum risiko terbesar', 'c.q1.text': 'Rangkum risiko terbesar di project ini dan urutkan berdasarkan prioritas.',
  'c.q2.label': 'Verifikasi + prompt perbaikan', 'c.q2.text': 'Verifikasi temuan yang tinggi/sedang dengan membaca kodenya, lalu buatkan satu prompt perbaikan yang bisa saya lempar ke agent project ini.',
  'c.q3.label': 'Prompt untuk semua temuan nyata', 'c.q3.text': 'Buatkan prompt perbaikan untuk semua temuan yang benar-benar celah (abaikan false positive) agar bisa saya lempar ke agent project ini.',
  'c.secBanner': 'Security hanya bisa membaca kode project (file rahasia seperti .env tidak dibaca). Ia tidak mengubah apa pun; prompt perbaikan dilempar sendiri oleh Anda ke agent project.',
  'c.bannerLarge': 'Riwayat sesi ini sangat besar ({mb} MB), jadi tidak bisa dilanjutkan dari sini (terlalu lambat dan mahal).',
  'c.bannerFork': 'Agent ini sedang berjalan di tempat lain, jadi percakapan di sini memakai salinan (cabang) dari sesinya. Sesi aslinya tidak ikut mendengar pesan Anda.',
  'c.bannerSize': 'Riwayat sesi {mb} MB: balasan pertama bisa lambat dan memakai banyak token.',
  'c.modeSafe': '🔒 Mode aman (tanya & baca saja)', 'c.modeEdit': '✎ Boleh mengedit file',
  'c.modeTipSafe': 'Agent hanya boleh membaca dan menjawab. Klik untuk mengizinkan edit file.', 'c.modeTipEdit': 'Agent boleh mengubah file di folder project. Klik untuk kembali ke mode aman.',
  'c.modeRO': '🔒 Hanya baca', 'c.modeROtip': 'Security tidak dapat mengubah file.',
  'c.cost': 'biaya percakapan ≈ ${v}',
  'c.copy': 'Salin', 'c.copied': 'Tersalin ✓', 'c.copyFail': 'Gagal menyalin', 'c.sendTo': 'Kirim ke agent…',
  'c.pickAgent': 'Pilih agent penerima. Prompt akan diisi di chat-nya (belum dikirim).', 'c.noClaude': 'Tidak ada agent Claude di project ini.',
  'c.otherFloor': 'Agent ini ada di lantai lain. Naik lift ke lantainya, lalu buka chat agent tersebut dan tempel prompt (gunakan tombol Salin).',
  'c.prefillHint': 'Prompt dari Security sudah diisi di kolom pesan. Periksa dulu, aktifkan “Boleh mengedit file” agar agent boleh memperbaiki, lalu kirim.',
  'c.noText': '(tidak ada balasan teks)', 'c.denied': '⛔ {tool} {target} ditolak',
  'c.deniedTipSec': 'Security hanya boleh membaca file non-rahasia.', 'c.deniedTipSafe': 'Mode aman tidak mengizinkan tindakan ini. Aktifkan "Boleh mengedit file" lalu minta lagi.',
  'c.needPerm': 'Agent butuh izin untuk melakukan itu. Aktifkan “Boleh mengedit file” di atas lalu ulangi perintahnya.',
  'c.aborted': '(dihentikan)', 'c.abortedSuffix': ' …(dihentikan)', 'c.connFail': 'Gagal terhubung: {msg}', 'c.genericErr': 'Terjadi kesalahan.',
  'e.not-supported': 'Hanya agent Claude Code yang bisa diajak ngobrol dari sini.', 'e.busy': 'Agent ini sedang membalas, tunggu sebentar.', 'e.too-many': 'Terlalu banyak percakapan berjalan bersamaan.',
  'e.too-large': 'Riwayat sesi ini sangat besar ({mb} MB), melanjutkannya akan sangat lambat dan mahal.', 'e.empty': 'Pesan kosong.', 'e.no-folder': 'Folder kerja agent tidak ditemukan.',
  'e.timeout': 'Waktu habis (10 menit).', 'e.stopped': 'Dihentikan.', 'e.spawn-failed': 'Gagal menjalankan perintah claude. Apakah Claude Code sudah terpasang? {detail}', 'e.cli-exit': 'claude berhenti tiba-tiba. {detail}',
  'e.sec-busy': 'Security sedang menjawab, tunggu sebentar.', 'e.skipped': 'Folder ini bukan project.', 'e.not-found': 'Tidak ditemukan.',

  // ---- settings ----
  'set.title': 'Pengaturan', 'set.language': 'Bahasa', 'set.langNote': 'Pilih bahasa tampilan. Perubahan langsung berlaku dan diingat di browser ini.',
  'set.close': 'Tutup',

  // ---- controller menu ----
  "set.tab.controller": "Controller",
  "ctl.keys": "Keyboard & mouse",
  "ctl.actions": "Tampilan & aksi",
  "ctl.k.move": "W A S D / panah",
  "ctl.move": "Berjalan",
  "ctl.run": "Lari",
  "ctl.follow": "Kamera mengikuti karakter Anda",
  "ctl.overview": "Lihat seluruh lantai",
  "ctl.k.pan": "Seret",
  "ctl.pan": "Geser peta",
  "ctl.k.zoom": "Scroll mouse",
  "ctl.zoom": "Perbesar / perkecil",
  "ctl.k.agent": "Klik agent",
  "ctl.agent": "Detail, pencapaian, chat, pecat",
  "ctl.k.monitor": "Klik monitor dinding",
  "ctl.monitor": "Ringkasan project (task + PRD)",
  "ctl.k.guard": "Klik penjaga (🛡)",
  "ctl.guard": "Laporan dan chat Security",
  "ctl.k.lift": "Masuk lift",
  "ctl.lift": "Pilih lantai lain (atau tekan 1-9)",
  "ctl.close": "Tutup panel",
};

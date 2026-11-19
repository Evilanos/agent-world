// Español: traducción del diccionario de referencia (en.js). Mismas claves; los marcadores {name} no se traducen.
export default {
  // ---- header / static UI ----
  'hdr.sleeping': 'Mostrar agentes dormidos',
  'hdr.follow': 'Seguir personaje', 'hdr.follow.tip': 'La cámara sigue a tu personaje (C)',
  'hdr.overview': 'Ver toda la planta', 'hdr.overview.tip': 'Alejar para ver toda la planta',
  'hdr.fired': 'Despedidos', 'hdr.fired.tip': 'Lista de agentes despedidos (se pueden restaurar)',
  'hdr.demo': 'Llamadas de demo', 'hdr.demo.stop': 'Detener demo', 'hdr.demo.tip': 'Vista previa: algunos agentes caminan hacia ti',
  'hdr.settings': 'Ajustes', 'hdr.settings.tip': 'Ajustes (idioma)',
  'chip.floors': 'plantas', 'chip.rooms': 'salas', 'chip.agents': 'agentes', 'chip.online': 'en línea', 'chip.working': 'trabajando', 'chip.waiting': 'esperándote', 'chip.blocked': 'cruce entre proyectos detenido',
  'floor.badge': 'Planta {n}', 'floor.badge.yours': 'Planta {n} · tu planta',
  'updated': 'Actualizado {time}',
  'canvas.aria': 'Plano 2D de una planta del edificio con salas de proyecto, una zona de ocio, un baño y un ascensor. Usa WASD para mover a tu personaje.',
  'rooms.aria': 'Salas de esta planta', 'detail.aria': 'Detalles del agente', 'lift.aria': 'Panel del ascensor', 'modal.aria': 'Detalles', 'chat.aria': 'Chat con el agente',
  'legend.busy': 'Trabajando (en su escritorio)', 'legend.idle': 'Inactivo → zona de ocio / baño', 'legend.recent': 'Activo < 24 h', 'legend.sleeping': 'Dormido',
  'legend.ask': '? Necesita tu opinión', 'legend.done': '✓ Terminado',
  "legend.hint": "WASD / flechas: caminar · Clic en un agente: detalles · ⚙ Ajustes → Controles: todos los controles",
  'err.load': 'No se pudieron cargar los datos de los agentes: {msg}',
  'you': 'Tú',

  // ---- status / kinds / calls ----
  'status.busy': 'Trabajando', 'status.idle': 'Inactivo (sesión abierta)', 'status.recent': 'Activo < 24 h', 'status.sleeping': 'Dormido',
  'kind.claude': 'Claude Code', 'kind.antigravity': 'Antigravity (Gemini)', 'kind.security': 'Seguridad',
  'call.ask.label': 'Necesita tu opinión', 'call.ask.bubble': '¿Tu opinión?', 'call.done.label': 'Terminado', 'call.done.bubble': 'Listo ✓',
  'demo.ask': '[Demo] ¿Usamos el enfoque A o el B?', 'demo.done': '[Demo] Tarea terminada, todas las pruebas pasan',

  // ---- outfits ----
  'role.finance.label': 'Finanzas', 'role.finance.desc': 'traje, corbata y gafas',
  'role.it.label': 'Soporte de TI', 'role.it.desc': 'polo, credencial y auriculares con micrófono',
  'role.engineer.label': 'Ingeniería', 'role.engineer.desc': 'sudadera con capucha',
  'role.game.label': 'Desarrollo de juegos', 'role.game.desc': 'gorra y auriculares',
  'role.ai.label': 'Laboratorio de IA', 'role.ai.desc': 'bata de laboratorio y gafas protectoras',
  'role.design.label': 'Diseño', 'role.design.desc': 'boina y delantal',
  'role.casual.label': 'Personal', 'role.casual.desc': 'camiseta informal',
  'role.security.label': 'Seguridad', 'role.security.desc': 'uniforme y chaleco',

  // ---- relative time ----
  'ago.none': '—', 'ago.now': 'justo ahora', 'ago.min': 'hace {n} min', 'ago.hour': 'hace {n} h', 'ago.day': 'hace {n} d',

  // ---- rooms drawn on the canvas / sidebar ----
  'room.fun': 'Zona de ocio', 'room.fun.sub': 'relax · café · ping-pong', 'room.fun.tv': '▶ ZONA DE OCIO',
  'room.toilet': 'Baño', 'room.toilet.sub': 'WC',
  'room.lift': 'Ascensor', 'room.lift.sub': 'ascensor', 'room.lift.label': 'ASCENSOR', 'room.floor': 'PLANTA {n}',
  'room.office': 'Tu oficina', 'room.office.sub': 'planta {n} · oficina privada',
  'room.lobby': 'Vestíbulo planta {n}',
  'room.empty': 'Sala vacía', 'room.empty.sub': 'aún sin proyecto',
  'room.unknown': '{tool} (carpeta desconocida)',
  'room.projsub': '{role} · {agents} agentes · {live} en línea',
  'board.none': 'Aún no hay tareas.', 'board.click': 'CLIC: RESUMEN DE TAREAS / PRD',
  'desk.inbox': 'BANDEJA {n}', 'desk.you': 'TÚ',
  'side.fun': '{n} agentes relajándose', 'side.toilet': '{n} agentes en el baño', 'side.lift': 'cambiar de planta', 'side.office': 'oficina privada',

  // ---- lift ----
  'lift.title': 'Ascensor', 'lift.where': 'Estás en la planta {n}. Elige un destino:', 'lift.projAgents': '{p} proyectos · {a} agentes',
  'lift.waiting': '{n} esperándote', 'lift.yours': 'tu planta', 'lift.hint': 'Pulsa una tecla numérica, o sal del ascensor para cerrar.', 'lift.going': 'Yendo a la planta {n}…',

  // ---- guards ----
  'guard.name': 'Seguridad', 'guard.title': 'Seguridad · {name}',
  'guard.watch': '👀 vigilando mezclas entre proyectos', 'guard.block': '🚫 ¡Otro proyecto!',
  'guard.scanning': '🔍 analizando…', 'guard.skipped': '🔍 no es un proyecto', 'guard.findings': '🔍 {n} hallazgos',

  // ---- poses (what the agent is doing) ----
  'doing.work': 'Trabajando en su escritorio', 'doing.sleep': 'Dormido en su escritorio', 'doing.sofa': 'Relajándose en el sofá', 'doing.drink': 'Tomando un café',
  'doing.pingpong': 'Jugando al ping-pong', 'doing.chat': 'Charlando', 'doing.pee': 'Haciendo pipí', 'doing.poop': 'Haciendo caca', 'doing.wash': 'Lavándose las manos',
  'doing.stand': 'Dando vueltas', 'doing.wave': 'Saludándote', 'doing.cheer': 'Informa: ¡terminado!', 'doing.plead': 'Suplicando que no lo despidan', 'doing.sad': 'Triste',

  // ---- tools an agent is using ({target} is a file / pattern / command) ----
  'act.edit': 'Editando {target}', 'act.write': 'Escribiendo {target}', 'act.read': 'Leyendo {target}', 'act.search': 'Buscando {target}', 'act.run': 'Ejecutando {target}',
  'act.delegate': 'Delegando {target}', 'act.web': 'Investigando en la web {target}', 'act.fetch': 'Leyendo la web {target}', 'act.plan': 'Planificando {target}', 'act.use': 'Usando {tool} {target}',

  // ---- agent panel ----
  'p.close': 'Cerrar', 'p.closeDetail': 'Cerrar detalles', 'p.chat': '💬 Chatear / dar órdenes',
  'p.uniform': 'Uniforme', 'p.now': 'Ahora mismo', 'p.activity': 'Actividad', 'p.tool': 'Herramienta', 'p.lastReply': 'Última respuesta', 'p.info': 'Información',
  'p.type': 'Tipo', 'p.folder': 'Carpeta', 'p.worktree': 'Worktree', 'p.source': 'Origen', 'p.pid': 'PID', 'p.lastActive': 'Última actividad', 'p.id': 'ID',
  'p.subagents': 'Subagentes ({n})', 'p.noSubagents': 'No hay subagentes registrados.', 'p.fire': 'Despedir agente…',
  'p.ack': 'Ya lo vi — volver a la sala', 'p.noSummary': '(sin resumen)',

  // ---- achievements ----
  'ach.title': 'Logros', 'ach.loading': 'Leyendo el historial de trabajo… (las transcripciones grandes pueden tardar unos segundos)', 'ach.fail': 'Error: {msg}',
  'ach.prompts': 'tareas tuyas', 'ach.edit': 'archivos editados/escritos', 'ach.bash': 'comandos ejecutados', 'ach.read': 'búsquedas y lecturas', 'ach.web': 'investigación web', 'ach.agent': 'subagentes delegados',
  'ach.since': 'Trabajando desde {date} · última actividad {ago}', 'ach.partial': ' · (historial muy largo, analizado parcialmente)',
  'ach.topics': 'Temas trabajados', 'ach.outline': 'Resumen de tareas', 'ach.none': 'Aún no hay tareas registradas.', 'ach.noTranscript': 'No hay historial de transcripción para este agente.',

  // ---- firing ----
  'def.title': '🙏 {name} se defiende',
  'def.plea': '“¡Espera, jefe! Antes de despedirme, por favor mira primero lo que he hecho.”',
  'def.stats': '“He recibido {prompts} tareas tuyas, editado {edits} archivos y ejecutado {cmds} comandos. Por favor, reconsidéralo.”',
  'def.statsNone': '“Eso es todo lo que he hecho. Por favor, reconsidéralo.”',
  'def.view': 'Ver mis logros', 'def.cancel': 'Cancelar', 'def.confirm': 'Despedir de todos modos', 'def.spare': 'Dar otra oportunidad',
  'def.note': 'Despedir solo oculta al agente de la oficina (puedes restaurarlo con el botón “Despedidos”).',
  'def.err409': 'El servidor lo rechazó: mira los logros de este agente antes de despedirlo.', 'def.errHttp': 'No se pudo despedir (HTTP {n})',

  // ---- guard panel ----
  'g.title': '🛡 Seguridad', 'g.badge': 'Guardia de la sala', 'g.duties': 'Funciones',
  'g.duty1': 'Evitar que agentes de distintos proyectos conversen o trabajen juntos.', 'g.duty2': 'Revisar la seguridad del sistema construido en este proyecto.',
  'g.status': 'Estado', 'g.vulns': 'Debilidades del sistema', 'g.counts': '{h} altas · {m} medias · {l} bajas', 'g.notproject': 'no es un proyecto', 'g.scanning': 'analizando…',
  'g.blocked': 'Cruce entre proyectos detenido', 'g.blockedVal': '{n}× (esta sesión)',
  'g.chat': '💬 Chatear con Seguridad', 'g.report': 'Abrir informe de seguridad', 'g.chatHint': 'Pide a Seguridad que verifique los hallazgos y escriba prompts de corrección que puedas pasar al agente de este proyecto.',

  // ---- project summary modal ----
  'pm.loading': 'Cargando resumen del proyecto…', 'pm.fail': 'No se pudo cargar el resumen: {msg}', 'pm.tasks': 'Tareas actuales', 'pm.noTasks': 'Aún no hay tareas registradas.',
  'pm.docs': 'PRD / documentos del proyecto', 'pm.noDocs': 'No hay PRD.md / README.md en la carpeta de este proyecto.', 'pm.excerpt': ' (solo la primera parte)',

  // ---- security report modal ----
  'sm.scanning': 'Seguridad está analizando el código del proyecto…', 'sm.title': '🛡 Informe de seguridad · {name}',
  'sm.chip.high': 'alta', 'sm.chip.medium': 'media', 'sm.chip.low': 'baja', 'sm.files': 'archivos analizados', 'sm.ms': 'ms',
  'sm.disclaimer': 'Análisis estático local (patrones de riesgo en código y configuración). Los valores secretos siempre se enmascaran. No sustituye a una auditoría completa.',
  'sm.truncated': ' Resultados truncados (límite de archivos/tiempo).', 'sm.rescan': 'Analizar de nuevo', 'sm.clean': 'Sin hallazgos con las reglas utilizadas. 👍', 'sm.fail': 'No se pudo cargar el informe: {msg}',
  'sm.skipped': 'Esta carpeta es la carpeta Home del usuario, no un proyecto, por lo que no se analizó.', 'sm.notFound': 'No se encontró la carpeta del proyecto.',
  'sev.high': 'Alta', 'sev.medium': 'Media', 'sev.low': 'Baja',
  'sec.aws-key.title': 'Clave de acceso de AWS incrustada en el código', 'sec.aws-key.advice': 'Revoca la clave y pásala a variables de entorno o a un gestor de secretos.',
  'sec.private-key.title': 'Clave privada subida al repositorio', 'sec.private-key.advice': 'Elimínala del repositorio, rota la clave y guárdala en una bóveda.',
  'sec.token.title': 'Token de API (GitHub / OpenAI / Slack) incrustado', 'sec.token.advice': 'Revoca el token y usa una variable de entorno.',
  'sec.hardcoded-secret.title': 'Contraseña / secreto / token escrito directamente en el código', 'sec.hardcoded-secret.advice': 'Pásalo a .env o a un gestor de secretos.',
  'sec.cmd-injection.title': 'Ejecución de comandos con entrada dinámica (inyección de comandos)', 'sec.cmd-injection.advice': 'Usa execFile / arreglos de argumentos y valida la entrada.',
  'sec.eval.title': 'Uso de eval / new Function', 'sec.eval.advice': 'Evita eval; analiza los datos con JSON.parse o una biblioteca segura.',
  'sec.xss-innerhtml.title': 'Posible XSS (innerHTML / document.write)', 'sec.xss-innerhtml.advice': 'Usa textContent o sanitiza (DOMPurify).',
  'sec.php-xss.title': 'PHP imprime la entrada del usuario sin escapar (XSS)', 'sec.php-xss.advice': 'Envuélvela en htmlspecialchars().',
  'sec.sqli-input.title': 'La consulta SQL usa directamente la entrada del usuario (inyección SQL)', 'sec.sqli-input.advice': 'Usa sentencias preparadas / enlace de parámetros.',
  'sec.sqli-concat.title': 'Consulta SQL construida con cadenas (comprueba de dónde vienen los valores)', 'sec.sqli-concat.advice': 'Asegúrate de que los valores provengan de código de confianza; si no, usa enlace de parámetros.',
  'sec.php-mysql.title': 'Funciones mysql_* obsoletas (vulnerables y sin soporte)', 'sec.php-mysql.advice': 'Migra a sentencias preparadas de PDO / mysqli.',
  'sec.php-include.title': 'include/require o unserialize sobre entrada del usuario', 'sec.php-include.advice': 'Usa una lista blanca de archivos incluibles; nunca hagas unserialize de la entrada del usuario.',
  'sec.weak-hash.title': 'Hash débil (md5 / sha1)', 'sec.weak-hash.advice': 'Usa bcrypt / argon2 para contraseñas y SHA-256 o superior para integridad.',
  'sec.cors-wildcard.title': 'CORS abierto a todos los orígenes', 'sec.cors-wildcard.advice': 'Restringe los orígenes a dominios conocidos.',
  'sec.tls-off.title': 'Verificación TLS desactivada', 'sec.tls-off.advice': 'Activa la verificación de certificados.',
  'sec.weak-random.title': 'Math.random usado para tokens / secretos', 'sec.weak-random.advice': 'Usa crypto.randomBytes / crypto.randomUUID.',
  'sec.chmod-777.title': 'Permiso 777', 'sec.chmod-777.advice': 'Concede solo los permisos mínimos necesarios.',
  'sec.env-not-ignored.title': 'Existe un archivo .env pero .gitignore no lo excluye', 'sec.env-not-ignored.advice': 'Añade .env a .gitignore y rota cualquier secreto que ya pueda haberse subido.',
  'sec.unpinned-deps.title': 'Dependencias sin versión fija', 'sec.unpinned-deps.advice': 'Fija las versiones (semver) para que las compilaciones sean reproducibles.',

  // ---- fired list modal ----
  'fd.title': 'Agentes despedidos', 'fd.note': 'Despedir solo oculta a un agente de la oficina. Los archivos de sesión en ~/.claude no se borran, así que puedes restaurarlo.',
  'fd.restore': 'Restaurar', 'fd.empty': 'No se ha despedido a ningún agente.', 'fd.when': '{project} · despedido {ago}',

  // ---- chat ----
  'c.greetAgent': '¡Hola! Soy {name}. ¿Quieres preguntarme algo o darme una orden?',
  'c.greetSec': 'Hola, soy Seguridad del proyecto {name}. {scan} Puedo explicar los hallazgos, revisar el código (solo lectura) y escribir prompts de corrección que puedas pasar al agente de este proyecto.',
  'c.scanCounts': 'Último análisis: {h} altas, {m} medias, {l} bajas.', 'c.scanPending': 'Se está preparando el informe del análisis…', 'c.scanSkipped': 'Esta carpeta no es un proyecto, así que no la analicé.',
  'c.secTitle': '🛡 Seguridad · {name}', 'c.secSub': 'Guardia de la sala · solo lectura', 'c.agentSub': '{role} · {status}',
  'c.phAgent': 'Escribe un mensaje u orden para {name}…  (Enter para enviar, Shift+Enter para nueva línea)',
  'c.phSec': 'Pregunta a Seguridad o pide un prompt de corrección…  (Enter para enviar, Shift+Enter para nueva línea)',
  'c.msgAria': 'Mensaje', 'c.send': 'Enviar', 'c.stop': 'Detener', 'c.closeAria': 'Cerrar chat',
  'c.q1.label': 'Resumir los mayores riesgos', 'c.q1.text': 'Resume los mayores riesgos de este proyecto y ordénalos por prioridad.',
  'c.q2.label': 'Verificar + prompt de corrección', 'c.q2.text': 'Verifica los hallazgos de severidad alta/media leyendo el código y luego escribe un prompt de corrección que pueda pasar al agente de este proyecto.',
  'c.q3.label': 'Prompt para todos los hallazgos reales', 'c.q3.text': 'Escribe un prompt de corrección para cada hallazgo que sea una vulnerabilidad real (ignora los falsos positivos) para que pueda pasarlo al agente de este proyecto.',
  'c.secBanner': 'Seguridad solo puede leer el código de este proyecto (los archivos secretos como .env no se leen). No cambia nada; tú mismo pasas el prompt de corrección al agente del proyecto.',
  'c.bannerLarge': 'El historial de esta sesión es muy grande ({mb} MB), así que no se puede continuar desde aquí (sería demasiado lento y caro).',
  'c.bannerFork': 'Este agente se está ejecutando en otro lugar, por lo que el chat de aquí usa una copia (rama) de su sesión. La sesión original no recibirá tus mensajes.',
  'c.bannerSize': 'El historial de la sesión es de {mb} MB: la primera respuesta puede ser lenta y consumir muchos tokens.',
  'c.modeSafe': '🔒 Modo seguro (solo preguntar y leer)', 'c.modeEdit': '✎ Puede editar archivos',
  'c.modeTipSafe': 'El agente solo puede leer y responder. Haz clic para permitir la edición de archivos.', 'c.modeTipEdit': 'El agente puede modificar archivos en la carpeta del proyecto. Haz clic para volver al modo seguro.',
  'c.modeRO': '🔒 Solo lectura', 'c.modeROtip': 'Seguridad no puede modificar archivos.',
  'c.cost': 'costo de la conversación ≈ ${v}',
  'c.copy': 'Copiar', 'c.copied': 'Copiado ✓', 'c.copyFail': 'Error al copiar', 'c.sendTo': 'Enviar al agente…',
  'c.pickAgent': 'Elige el agente receptor. El prompt se rellena en su chat (aún no se envía).', 'c.noClaude': 'No hay agentes Claude en este proyecto.',
  'c.otherFloor': 'Este agente está en otra planta. Toma el ascensor hasta esa planta, abre el chat del agente y pega el prompt (usa el botón Copiar).',
  'c.prefillHint': 'El prompt de Seguridad está en el cuadro de mensaje. Revísalo, activa “Puede editar archivos” para que el agente pueda aplicar la corrección y luego envíalo.',
  'c.noText': '(respuesta sin texto)', 'c.denied': '⛔ {tool} {target} denegado',
  'c.deniedTipSec': 'Seguridad solo puede leer archivos no secretos.', 'c.deniedTipSafe': 'El modo seguro no permite esta acción. Activa “Puede editar archivos” y vuelve a preguntar.',
  'c.needPerm': 'El agente necesita permiso para hacer eso. Activa “Puede editar archivos” arriba y repite la orden.',
  'c.aborted': '(detenido)', 'c.abortedSuffix': ' …(detenido)', 'c.connFail': 'Falló la conexión: {msg}', 'c.genericErr': 'Algo salió mal.',
  'e.not-supported': 'Desde aquí solo se puede chatear con agentes de Claude Code.', 'e.busy': 'Este agente todavía está respondiendo, espera un momento.', 'e.too-many': 'Hay demasiadas conversaciones en curso a la vez.',
  'e.too-large': 'El historial de esta sesión es muy grande ({mb} MB); continuarlo sería muy lento y caro.', 'e.empty': 'El mensaje está vacío.', 'e.no-folder': 'No se encontró la carpeta de trabajo del agente.',
  'e.timeout': 'Tiempo de espera agotado (10 minutos).', 'e.stopped': 'Detenido.', 'e.spawn-failed': 'No se pudo ejecutar el comando claude. ¿Está instalado Claude Code? {detail}', 'e.cli-exit': 'claude terminó inesperadamente. {detail}',
  'e.sec-busy': 'Seguridad todavía está respondiendo, espera un momento.', 'e.skipped': 'Esta carpeta no es un proyecto.', 'e.not-found': 'No encontrado.',

  // ---- settings ----
  'set.title': 'Ajustes', 'set.language': 'Idioma', 'set.langNote': 'Elige el idioma de la interfaz. Se aplica de inmediato y se recuerda en este navegador.',
  'set.close': 'Cerrar',

  // ---- controller menu ----
  "set.tab.controller": "Controles",
  "ctl.keys": "Teclado y ratón",
  "ctl.actions": "Vista y acciones",
  "ctl.k.move": "W A S D / flechas",
  "ctl.move": "Caminar",
  "ctl.run": "Correr",
  "ctl.follow": "La cámara sigue a tu personaje",
  "ctl.overview": "Ver toda la planta",
  "ctl.k.pan": "Arrastrar",
  "ctl.pan": "Mover el mapa",
  "ctl.k.zoom": "Rueda del ratón",
  "ctl.zoom": "Acercar / alejar",
  "ctl.k.agent": "Clic en un agente",
  "ctl.agent": "Detalles, logros, chat, despedir",
  "ctl.k.monitor": "Clic en un monitor de pared",
  "ctl.monitor": "Resumen del proyecto (tareas + PRD)",
  "ctl.k.guard": "Clic en un guardia (🛡)",
  "ctl.guard": "Informe y chat de Seguridad",
  "ctl.k.lift": "Entrar al ascensor",
  "ctl.lift": "Elegir otra planta (o pulsa 1-9)",
  "ctl.close": "Cerrar paneles",

  // ---- project dropdown / call ----
  "side.call": "Llamar",
  "side.callTip": "Pide a este agente que venga hacia ti",
  "side.back": "Volver",
  "side.backTip": "Enviar al agente de vuelta a donde estaba",
  "side.more": "+{n} más sin mostrar",
  "side.agentsAria": "Agentes en {name}",
  "p.callMe": "📞 Llamar aquí",
  "p.sendBack": "↩ Enviar de vuelta",
  "summon.bubble": "🙋 ¿Sí?",
  "ctl.k.card": "Clic en una tarjeta de proyecto",
  "ctl.card": "Abre su lista de agentes; 📞 Llamar trae a un agente hacia ti",

  // ---- floor browser ----
  "fl.here": "Estás en la planta {n}",
  "fl.viewing": "Viendo la planta {n}",
  "fl.menu": "Elige una planta para ver",
  "fl.you": "estás aquí",
  "fl.note": "Los agentes que llames desde aquí llegan a ti en ascensor.",
  "side.traveling": "🛗 en camino por el ascensor…",
  "side.floorEmpty": "No hay proyectos en esta planta.",
  "p.floor": "Planta",
};

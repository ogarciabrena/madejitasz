// Worker: recibe el formulario de contacto del sitio y lo manda a Telegram.
// El token del bot y el chat_id se leen de env (Worker Secrets), nunca hardcodeados aquí.

const ALLOWED_ORIGINS = [
  'https://14hilosdelana.com',
  'https://www.14hilosdelana.com',
  'https://ogarciabrena.github.io',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, cors);
    }

    let data;
    try {
      data = await request.json();
    } catch (e) {
      return jsonResponse({ error: 'JSON inválido' }, 400, cors);
    }

    const nombre = (data.nombre || '').toString().trim().slice(0, 200);
    const contacto = (data.contacto || '').toString().trim().slice(0, 200);
    const tipo = (data.tipo || '').toString().trim().slice(0, 100);
    const mensaje = (data.mensaje || '').toString().trim().slice(0, 2000);
    const origenLabel = (data.origen || '').toString().trim().slice(0, 100);

    if (!nombre || !contacto) {
      return jsonResponse({ error: 'Falta nombre o contacto' }, 400, cors);
    }

    const lineas = [
      '🧵 Nuevo lead de 14 Hilos de Lana',
      '',
      `Nombre: ${nombre}`,
      `Contacto: ${contacto}`,
    ];
    if (tipo) lineas.push(`Tipo: ${tipo}`);
    if (mensaje) lineas.push(`Mensaje: ${mensaje}`);
    if (origenLabel) lineas.push(`Origen: ${origenLabel}`);

    const tgUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const tgResp = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: lineas.join('\n'),
      }),
    });

    if (!tgResp.ok) {
      return jsonResponse({ error: 'No se pudo enviar a Telegram' }, 502, cors);
    }

    return jsonResponse({ ok: true }, 200, cors);
  },
};

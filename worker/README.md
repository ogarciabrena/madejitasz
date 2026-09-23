# Worker: leads a Telegram

Recibe el formulario de contacto del sitio (POST con JSON) y lo reenvía como
mensaje de Telegram. No usa correo ni WhatsApp Business (evita su costo de API).

## Antes de desplegar

Necesitas, de parte de Hilario o de quien vaya a recibir los leads:

1. **Token del bot**: en Telegram, abre chat con `@BotFather`, manda `/newbot`
   y sigue los pasos. Te da un token tipo `123456:ABC-...`.
2. **Chat ID**: la persona que va a recibir los mensajes le escribe al bot
   recién creado (cualquier mensaje), y luego usas `@userinfobot` o la API
   de Telegram para obtener su `chat_id` numérico.

## Deploy

Desde esta carpeta (`worker/`), con Wrangler instalado y sesión de Cloudflare
iniciada:

```
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
wrangler deploy
```

El deploy te da una URL pública, algo como:

```
https://hilos-de-lana-leads.<tu-subdominio>.workers.dev
```

Esa URL hay que pasársela a Claude para conectar el formulario del sitio
(`index.html`, `historia.html`, `tienda.html`); ahora mismo esos formularios
usan `mailto:` como respaldo temporal.

## Pruebas antes de tener el bot de Hilario

Mientras Hilario no te pase su bot, puedes desplegar el Worker con tu propio
`chat_id` de prueba (búscalo mandándole un mensaje a `@userinfobot` en
Telegram) y así probar el flujo completo de principio a fin. Cuando Hilario
te dé su token y chat_id reales, solo vuelve a correr:

```
wrangler secret put TELEGRAM_CHAT_ID
```

con el valor de él. Sobreescribe el secret anterior al instante, sin tocar
código ni volver a hacer deploy del bot.

## Qué recibe el Worker

POST con JSON:

```json
{
  "nombre": "...",
  "contacto": "...",
  "tipo": "...",
  "mensaje": "...",
  "origen": "..."
}
```

`nombre` y `contacto` son obligatorios. Responde `{"ok": true}` en éxito.

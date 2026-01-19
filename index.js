const fs = require("fs");
if (!fs.existsSync("./sessions")) fs.mkdirSync("./sessions");

const express = require("express");
const http = require("http");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");

const app = express();
const server = http.createServer(app);

let sock;
let qrAtual = "Aguardando QR...";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./sessions");

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (qr) {
            qrAtual = await qrcode.toDataURL(qr);
            console.log("QR GERADO");
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("Conexão fechada. Reconectando:", shouldReconnect);
            if (shouldReconnect) startBot();
        }

        if (connection === "open") {
            console.log("BOT CONECTADO AO WHATSAPP");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (texto?.toLowerCase() === "oi") {
            await sock.sendMessage(msg.key.remoteJid, { text: "Olá! 🤖 Bot online com sucesso." });
        }
    });
}

startBot();

app.get("/", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>BOT WHATSAPP ONLINE</title>
            <meta http-equiv="refresh" content="5">
            <style>
                body { background:#0f172a; color:white; text-align:center; font-family:Arial }
                img { margin-top:30px; width:300px }
            </style>
        </head>
        <body>
            <h1>📲 Escaneie o QR no WhatsApp</h1>
            ${qrAtual.startsWith("data") ? `<img src="${qrAtual}" />` : "<p>Gerando QR...</p>"}
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Servidor rodando na porta", PORT));

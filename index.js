const fs = require("fs");
if (!fs.existsSync("./sessions")) fs.mkdirSync("./sessions");

const express = require("express");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");

const app = express();
let sock;
let qrAtual = "";

async function start() {
const { state, saveCreds } = await useMultiFileAuthState("sessions");

sock = makeWASocket({
auth: state,
printQRInTerminal: false
});

sock.ev.on("creds.update", saveCreds);

sock.ev.on("connection.update", async ({ qr, connection }) => {
if (qr) {
qrAtual = await QRCode.toDataURL(qr);
console.log("QR GERADO");
}
if (connection === "open") console.log("BOT CONECTADO");
});
}

start();

app.get("/", async (req, res) => {
res.send(`
<body style="background:#0f172a; color:white; text-align:center; font-family:Arial">
<h2>📲 Escaneie o QR</h2>
${qrAtual ? `<img src="${qrAtual}" width="300"/>` : "<p>Gerando QR... aguarde 5s</p>"}
<meta http-equiv="refresh" content="5">
</body>
`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando"));

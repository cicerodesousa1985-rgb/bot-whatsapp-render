const fs = require("fs");
if (!fs.existsSync("./sessions")) fs.mkdirSync("./sessions");

const express = require("express");
const http = require("http");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");

const app = express();
const server = http.createServer(app);

let sock;
let qrBase64 = null;

async function iniciarBot() {
const { state, saveCreds } = await useMultiFileAuthState("sessions");

sock = makeWASocket({
auth: state,
printQRInTerminal: true
});

sock.ev.on("creds.update", saveCreds);

sock.ev.on("connection.update", async ({ qr, connection, lastDisconnect }) => {

if (qr) {
qrBase64 = await QRCode.toDataURL(qr);
console.log("QR ATUALIZADO");
}

if (connection === "close") {
const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

if (shouldReconnect) iniciarBot();
}

if (connection === "open") {
console.log("WHATSAPP CONECTADO COM SUCESSO");
}
});
}

iniciarBot();

app.get("/", (req, res) => {
res.send(`
<h2>BOT WHATSAPP</h2>
${qrBase64 ? `<img src="${qrBase64}" width="300"/>` : "<p>Gerando QR... aguarde e atualize</p>"}
<meta http-equiv="refresh" content="5">
`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Servidor ativo"));

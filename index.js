const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let BOT_ATIVO = true;
let sock;

async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState("sessions");
sock = makeWASocket({ auth: state });

sock.ev.on("creds.update", saveCreds);

sock.ev.on("connection.update", async ({ qr }) => {
if (qr) {
const qrImg = await QRCode.toDataURL(qr);
io.emit("qr", qrImg);
}
});

sock.ev.on("messages.upsert", async ({ messages }) => {
const msg = messages[0];
if (!msg.message || msg.key.fromMe) return;

const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
io.emit("nova_msg", { numero: msg.key.remoteJid, texto });

if (!BOT_ATIVO) return;
await sock.sendMessage(msg.key.remoteJid, { text: "👋 Atendimento automático ativo!" });
});
}
startBot();

app.get("/", (req, res) => res.sendFile(__dirname + "/painel.html"));

app.post("/toggle", (req, res) => {
BOT_ATIVO = !BOT_ATIVO;
res.json({ status: BOT_ATIVO });
});

app.post("/send", async (req, res) => {
const { numero, mensagem } = req.body;
await sock.sendMessage(numero + "@s.whatsapp.net", { text: mensagem });
res.json({ enviado: true });
});

server.listen(3000);

const express = require("express");
const bodyParser = require("body-parser");
const { sendMessage } = require("./cloudzapi");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const msg = req.body;

  if (!msg.message || !msg.phone) return res.sendStatus(200);

  const texto = msg.message.toLowerCase();
  const numero = msg.phone;

  if (texto.includes("oi") || texto.includes("olá")) {
    await sendMessage(numero, "Olá 👋 Sou o atendimento automático. Digite:\n1️⃣ Produtos\n2️⃣ Suporte\n3️⃣ Falar com humano");
  }

  if (texto === "1") {
    await sendMessage(numero, "🛒 Aqui estão nossos produtos...");
  }

  if (texto === "2") {
    await sendMessage(numero, "🛠 Nosso suporte irá te ajudar.");
  }

  if (texto === "3") {
    await sendMessage(numero, "👨‍💼 Um atendente humano falará com você.");
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT, () =>
  console.log("Bot rodando com CloudZapi 🚀")
);

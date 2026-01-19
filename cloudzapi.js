const axios = require("axios");
require("dotenv").config();

const base = `https://api.cloudzapi.com/instances/${process.env.CLOUDZAPI_INSTANCE}/token/${process.env.CLOUDZAPI_TOKEN}`;

async function sendMessage(number, text) {
  return axios.post(`${base}/send-text`, {
    phone: number,
    message: text
  });
}

module.exports = { sendMessage };

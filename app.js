const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

const app = express();

const PORT = process.env.PORT || 3000;

const url =
  "https://www.amazon.com/Logitech-Advanced-Wireless-Illuminated-Keyboard/dp/B07S92QBCJ/ref=sr_1_fkmr0_1?crid=3QPPZJ98XHYK&keywords=hhjk+keyboard&qid=1684844410&sprefix=hhjk+keyboard%2Caps%2C269&sr=8-1-fkmr0";

const product = { name: "", price: "", link: "" };

const handle = setInterval(scraper, 20000);

async function scraper() {
  const { data } = await axios.get(url);

  const $ = cheerio.load(data);
  const item = $("div#dp-container");
  product.name = $(item).find("h1 span#productTitle").text();
  product.link = url;
  const price = $(item)
    .find("span .a-price-whole")
    .first()
    .text()
    .replace(/[,.]/g, "");

  const priceNum = parseInt(price);
  product.price = priceNum;

  if (priceNum < 100) {
    client.messages
      .create({
        body: `The price of ${product.name} went below ${price}. Purchase it at ${product.link}`,
        to: "+234706xxx",
        from: "+12543205193",
      })
      .then((message) => {
        console.log(message.sid);
        clearInterval(handle);
      });
  }
}

scraper();

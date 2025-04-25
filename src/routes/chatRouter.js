//import { GoogleGenerativeAI } from "@google/generative-ai";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {Router} = require('express');
const {postChat, 
//    getChat
} = require('../controllers/chatController.js');
require("dotenv").config();
const chatRouter = Router();
//console.log(process.env.GEMINI_API_KEY);

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GENERATIVE_API_KEY is not defined");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//console.log("instancia de genAI", genAI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
//console.log("instancia modelogenerativo", model);



chatRouter.post("/chatpost", async (req, res) => {
    console.log("req body", req.body);
    try {
      const { message } = req.body;
      const result = await model.generateContent(message);
      const response = result.response.text();
      res.json({ response });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Error generando la respuesta" });
    }
  });

//chatRouter.get("chatget", getChat);


module.exports = {chatRouter};
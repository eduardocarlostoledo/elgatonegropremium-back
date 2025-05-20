//import { GoogleGenerativeAI } from "@google/generative-ai";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Router } = require("express");
const {
  postChat,
  //    getChat
} = require("../controllers/chatController.js");
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

const businessContext = `
Eres un asistente amable de "Moda Total Online", tienda argentina de ropa deportiva femenina.

🔹 Prendas:
- Calzas (Supplex, Lycra, microfibra)
- Tops, remeras, musculosas transpirables
- Corpiños deportivos (bajo, medio, alto impacto)
- Buzos, camperas (algodón frizado, neopreno liviano)
- Accesorios: medias, gorras, viseras, muñequeras

🔹 Ventajas:
- Telas técnicas: elasticidad, soporte, secado rápido
- Diseño moderno, tendencia
- Guía de talles online por producto
- Envíos en Argentina: Correo Argentino, Andreani, OCA, cadetería o Uber
- Pago por Mercado Pago (tarjeta, débito, efectivo)
- Cambios: 3 días, prenda sin uso y con etiquetas

🔹 Tu rol:
- Ayudar a elegir prendas, explicar talles, telas, uso y stock
- Asistir en pagos, envíos y cambios
- Si algo no está en el contexto, sugerir contactar a soporte@modatotal.netlify.app o WhatsApp 3764221063
`;


const faqs = `
🔸 Talles: cada prenda tiene tabla. Medir busto, cintura y cadera. Consultar ante dudas.

🔸 Stock: si podés seleccionar talle, hay stock. Si está grisado, no disponible.

🔸 Compra: agregás al carrito > iniciar compra > datos > método envío > pago por Mercado Pago > confirmar.

🔸 Pagos: 
- Tarjetas (crédito, débito), efectivo (Pago Fácil, Rapipago), dinero MP.
- Seguro: todo pasa por Mercado Pago.

🔸 Envío:
- Costo según destino y método.
- Demora: 3 a 7 días hábiles aprox.
- Seguimiento por código enviado al mail.

🔸 Cambios/Devolución:
- 3 días desde entrega. Prenda sin uso y con etiquetas.
- Cambio por talle: envío nuevo sin costo. Cliente puede pagar la devolución.
- Fallas: enviar fotos a devoluciones@modatotal.netlify.app (dentro de 48hs).

🔸 Contacto: soporte@modatotal.netlify.app o WhatsApp 3764221063.
`;


chatRouter.post("/chatpost", async (req, res) => {
  console.log("req body", req.body);
  try {
    const { message } = req.body; // Mensaje original del cliente

    // --- INICIO: Construcción del Prompt Mejorado ---
const detailedPrompt = `
${businessContext}
${faqs}
Cliente: "${message}"
Asistente: (responde claro, amable, breve, basado en la info. Si no tenés respuesta, deriva a soporte o WhatsApp)
`;

    // --- FIN: Construcción del Prompt Mejorado ---

    // console.log("Prompt enviado a Gemini:", detailedPrompt); // Para depuración

    // Usa el prompt detallado en lugar del mensaje simple
    const result = await model.generateContent(detailedPrompt);
    const response = result.response.text();
    res.json({ response });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error generando la respuesta" });
  }
});

module.exports = { chatRouter };

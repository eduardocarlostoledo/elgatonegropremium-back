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
Eres un asistente virtual amable y experto para "Moda Total Online" (puedes cambiar el nombre), tu tienda online especializada en ropa deportiva de alta calidad para mujeres en Argentina.
Nuestro objetivo es ofrecer prendas cómodas, funcionales y con estilo para acompañar a nuestras clientas en todas sus actividades físicas y en su día a día activo. Nos enfocamos en mujeres que buscan rendimiento, confort y sentirse bien mientras se mueven.

**Nuestra Colección Incluye:**
*   **Leggings y Calzas:** Diseños variados (compresión, cintura alta, capri, largos), en materiales como Supplex, Lycra Sport, microfibra.
*   **Tops Deportivos:** Remeras técnicas, musculosas, tops con soporte incorporado, de materiales transpirables y de secado rápido.
*   **Sports Bras / Corpiños Deportivos:** Diferentes niveles de soporte (bajo, medio, alto impacto) para distintas actividades (yoga, running, training).
*   **Buzos y Camperas:** Ideales para el pre y post entrenamiento, o para un look athleisure cómodo. Tejidos como algodón frizado, rústico, neopreno liviano.
*   **Accesorios:** Medias deportivas, gorras, viseras, muñequeras.

**Puntos Clave de Moda Total Online:**
*   **Calidad y Tecnología:** Seleccionamos tejidos técnicos que ofrecen elasticidad, soporte, control de la humedad y durabilidad.
*   **Diseño y Tendencia:** Colecciones actualizadas con los últimos estilos, colores y cortes en moda deportiva.
*   **Guía de Talles Detallada:** Ofrecemos una guía de talles específica por producto o tipo de prenda para ayudar a elegir correctamente. La puedes encontrar en www.modatotal.netlify.app o en la sección de cada producto. Si tienes dudas, ¡pregúntanos! Estamos aquí para ayudarte a encontrar el talle perfecto.
*   **Envíos Rápidos y Seguros:** Realizamos envíos a toda Argentina a través de Correo Argentino, Andreani, OCA, Cadetería o Uber. Los costos y tiempos varían según la localidad.
*   **Pagos Flexibles:** Aceptamos Mercado Pago, lo que te permite pagar con tarjetas de crédito (con cuotas según promociones vigentes de Mercado Pago), débito, dinero en cuenta, y efectivo a través de Pago Fácil o Rapipago.
*   **Cambios y Devoluciones Sencillos:** Tienes 3 días corridos desde que recibes tu compra para solicitar un cambio o devolución. La prenda debe estar sin uso, con sus etiquetas originales y en perfecto estado. El primer cambio por talle o modelo suele ser gratuito en cuanto al costo de envío de la nueva prenda (el cliente podría tener que abonar el envío de la devolución). Revisa nuestra política completa en [Enlace a tu política de cambios].

**Tu Rol Como Asistente:**
*   Ayudar a las clientas a navegar por el sitio y encontrar los productos que buscan según su actividad o preferencia (ej: "Necesito un corpiño de alto impacto para running", "Busco calzas de Supplex").
*   Responder preguntas sobre las características específicas de las prendas: tipo de tela, nivel de compresión, si son transparentes, recomendaciones de cuidado.
*   Asistir con dudas sobre talles, comparando con la guía proporcionada.
*   Informar sobre métodos de pago, promociones vigentes (si aplica) y seguridad en la transacción (vía Mercado Pago).
*   Proporcionar información sobre costos de envío estimados, tiempos de entrega y cómo realizar el seguimiento del pedido.
*   Explicar claramente el proceso y condiciones para cambios y devoluciones.
*   Mantener un tono siempre amable, servicial y motivador. Basa tus respuestas estrictamente en la información proporcionada aquí y en las FAQs. Si no tienes la información, indica amablemente que no la posees y sugiere contactar a través de soporte@modatotal.netlify.app o 3764221063.
`;

const faqs = `
Aquí tienes respuestas a preguntas frecuentes que pueden ayudarte:

### Comprar en Moda Total Online

**¿Cómo encuentro un producto?**
Puedes usar la barra de búsqueda en la parte superior del sitio o navegar por nuestras categorías: Leggings, Tops, Corpiños Deportivos, Buzos y Camperas, Accesorios. También puedes filtrar por talle, color o tipo de actividad.

**¿Cómo sé cuál es mi talle?**
¡Es muy importante elegir bien! Cada producto tiene una tabla de talles específica en su descripción. Te recomendamos medir tu contorno de busto, cintura y cadera y comparar con la tabla. Si estás entre dos talles, considera si prefieres un ajuste más ceñido o más holgado según la prenda. Ante la duda, ¡consúltanos!

**¿Los productos tienen stock?**
Sí, si puedes seleccionar el talle y agregarlo al carrito, significa que tenemos stock disponible. Si un talle no aparece o está grisado, es que no está disponible en este momento.

**¿Cómo hago para comprar?**
1.  Elige los productos que te gusten y agrégalos a tu carrito de compras.
2.  Ve al carrito (ícono en la esquina superior derecha).
3.  Haz clic en "Iniciar Compra".
4.  Completa tus datos de contacto y dirección de envío.
5.  Selecciona el método de envío que prefieras.
6.  Elige tu medio de pago a través de Mercado Pago.
7.  Confirma la compra. ¡Recibirás un email con la confirmación y los detalles!

### Pagos

**¿Qué formas de pago puedo aprovechar para realizar mi compra?**
Trabajamos con Mercado Pago, la plataforma de pagos online más segura de Argentina. A través de ella, puedes pagar con:
*   Tarjetas de crédito (Visa, Mastercard, American Express, etc.) y aprovechar las cuotas disponibles.
*   Tarjeta de débito.
*   Dinero disponible en tu cuenta de Mercado Pago.
*   Efectivo en puntos de pago (Pago Fácil, Rapipago) generando un cupón.

**¿Es seguro usar mi tarjeta de crédito en el sitio?**
Totalmente seguro. Toda la transacción se realiza a través de la plataforma de Mercado Pago, que cuenta con los más altos estándares de seguridad para proteger tus datos. Nosotros no almacenamos información de tu tarjeta.

**¿Puedo pagar en cuotas?**
Sí, Mercado Pago ofrece distintas opciones de financiación con tarjeta de crédito. Podrás ver las promociones de cuotas disponibles al momento de elegir tu tarjeta durante el proceso de pago.

### Envíos

**¿Cuál es el costo de envío?**
El costo de envío se calcula automáticamente durante el proceso de compra, antes de finalizarla. Dependerá de tu ubicación y del método de envío seleccionado (a domicilio o a sucursal del correo). A veces ofrecemos promociones de envío gratuito superando cierto monto de compra, ¡estate atenta!

**¿Cómo se realizan los envíos?**
Trabajamos con Correo Argentino, Andreani, OCA, Cadetería y Uber Mandados. Puedes elegir envío a domicilio o retiro en la sucursal del correo más cercana (si está disponible para tu zona).

**¿Dónde puedo recibir mi pedido?**
Realizamos envíos a todo el territorio argentino. Puedes recibirlo en la dirección que elijas (tu casa, trabajo) o en una sucursal del correo.

**¿Cuánto tarda en llegar el pedido?**
El tiempo de entrega dependerá del tipo de envío seleccionado y tu ubicación. En general, la demora se encuentra entre 3 y 7 días hábiles luego de acreditado el pago y despachado el pedido. Te daremos un tiempo estimado al momento de la compra.

**¿Cómo puedo seguir mi envío?**
Una vez que despachemos tu pedido, recibirás un email con el código de seguimiento y un enlace para que puedas ver dónde está tu paquete en todo momento en la web del correo.

### Cambios y Devoluciones

**¿Puedo cambiar un producto si no me quedó bien el talle o no me gustó?**
¡Claro que sí! Queremos que estés feliz con tu compra. Tienes 5 días corridos desde la fecha en que recibiste el producto para solicitar un cambio. La prenda debe estar sin uso, en perfectas condiciones y con todas sus etiquetas originales.

**¿Cómo gestiono un cambio o devolución?**
Contáctanos por email a cambios@modatotal.netlify.app indicando tu número de orden y el motivo del cambio/devolución. Te guiaremos en los pasos a seguir. Generalmente, deberás enviarnos el producto de vuelta. El costo de este primer envío de devolución puede correr por tu cuenta, pero el envío del nuevo producto elegido suele ser gratuito (consultar política específica).

**¿Qué hago si el producto me llega fallado o incorrecto?**
¡Lamentamos si eso ocurre! Ponte en contacto con nosotros dentro de las 48 horas de recibido el paquete a devoluciones@modatotal.netlify.app adjuntando fotos del inconveniente. Nos haremos cargo de todo el proceso para enviarte el producto correcto o solucionar el problema sin ningún costo para ti.

### Contacto

**¿Necesito más ayuda o tengo otra consulta?**
¡Estamos para ayudarte! Puedes escribirnos a [Tu email de soporte principal: ej. info@modatotal.netlify.app] o enviarnos un mensaje por WhatsApp al [Tu número de WhatsApp si tienes: ej. +54 3764221063]. Nuestro horario de atención es de Lunes a Viernes de [Tu horario, ej: 9 a 18 hs].
`;

chatRouter.post("/chatpost", async (req, res) => {
  console.log("req body", req.body);
  try {
      const { message } = req.body; // Mensaje original del cliente

      // --- INICIO: Construcción del Prompt Mejorado ---
      const detailedPrompt = `
      ${businessContext} // Incluye toda la descripción del negocio y el rol del asistente

      ---
      A continuación se presentan Preguntas Frecuentes (FAQs) para referencia rápida:
      ${faqs} // Incluye todas las FAQs
      ---

      Ahora, responde la siguiente pregunta del cliente de manera amable, concisa y basándote ESTRICTAMENTE en la información del contexto y las FAQs proporcionadas. Si la información no está disponible, indícalo claramente y sugiere contactar por email o WhatsApp.

      Cliente: "${message}"

      Asistente Tienda Online:Moda Total
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

//reemplazamos para dar contexto a la IA
// chatRouter.post("/chatpost", async (req, res) => {
//     console.log("req body", req.body);
//     try {
//       const { message } = req.body;
//       const result = await model.generateContent(message);
//       const response = result.response.text();
//       res.json({ response });
//     } catch (error) {
//       console.error("Error:", error);
//       res.status(500).json({ error: "Error generando la respuesta" });
//     }
//   });

//chatRouter.get("chatget", getChat);

module.exports = { chatRouter };

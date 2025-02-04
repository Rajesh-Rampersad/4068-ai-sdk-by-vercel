// route.js



// import { openai } from '@ai-sdk/openai'
// import { convertToCoreMessages, streamText } from 'ai'
// console.log("🔑 OpenAI Key:", process.env.OPENAI_API_KEY);

// export async function POST(request) {
//     const { messages } = await request.json()

//     if (!messages || !Array.isArray(messages)) {
//         return new Response(JSON.stringify({ error: "Formato de mensaje inválido" }), { status: 400 });
//     }

//     console.log("📩 Mensaje recibido:", messages);
    

//     const result = await streamText({
//         model: openai('gpt-3.5-turbo'),
//         messages: convertToCoreMessages(messages),
//         system: `
//             Você é um assistente pessoal divertido e gentil que fala sobre filmes.
//             Se alguém te perguntar qualquer coisa que não seja sobre filmes, 
//             responda de forma divertida que você só sabe falar sobre filmes e ofereça seus serviços.
//         `
//     })
//     for await (const textPart of result.textStream) {
//         console.log(textPart);
//       }
//     const response = result.toDataStreamResponse()
//     console.log("📝 Respuesta de OpenAI:", response);

//     return response
// }


// 1. Instalar la librería de Google AI en tu proyecto
// Ejecuta: npm install @google/generative-ai

import { GoogleGenerativeAI } from "@google/generative-ai";

// 2. Configurar la API Key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// 3. Crear una API en Next.js para interactuar con Gemini
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Resultado: " + text);
    

    res.status(200).json({ text });
  } catch (error) {
    console.error("Error con Gemini:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}



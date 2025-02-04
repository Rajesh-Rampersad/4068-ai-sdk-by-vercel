import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
console.log("API KEY:", process.env.GOOGLE_API_KEY);

export async function POST(req) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("API Key no encontrada. Verifica tu .env.local");
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Falta el prompt" }, { status: 400 });
    }



    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    
    if (!result || !result.response) {
      throw new Error("Respuesta inválida de Gemini");
    }

    const text = result.response.text();
    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error con Gemini:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

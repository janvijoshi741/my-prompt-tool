import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyBdngdiJSPl1z64-kTu6C8zwX3gkSUTHno",
});

export async function POST(req) {
  const body = await req.json();
  const { chatId, message } = body;
  if (!message) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-pro",
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      responseFormat: "text",
      temperature: 0.2,
      maxOutputTokens: 1000,
    });

    const reply = response;
    // console.log("Gemini from server", reply);
    return NextResponse.json({ reply, chatId });
  } catch (error) {
    console.error("Google GenAI Error:", error?.message);
    return NextResponse.json(
      { error: "Google GenAI request failed" },
      { status: 500 }
    );
  }
}

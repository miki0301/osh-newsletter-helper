import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔍 [Debug] Body:", body);

    // 1. 處理 Prompt
    let prompt = "";
    if (body.prompt) {
      prompt = body.prompt;
    } else if (body.messages && Array.isArray(body.messages)) {
      const lastMessage = body.messages[body.messages.length - 1];
      prompt = lastMessage.content || "";
    }

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
    
    // ⭐【關鍵修改】：改用 Lite 版本，避開主模型的額度限制
    // 這是你清單裡有的，通常比較不會被擋
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // 2. 發送請求
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("🔥 [API Error]:", error);
    // 這裡我們把完整的錯誤訊息印出來，方便除錯
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 如果是 429 錯誤，回傳比較友善的訊息
    if (errorMessage.includes("429") || errorMessage.includes("Quota")) {
       return NextResponse.json(
        { error: "Quota Exceeded", details: "Google 額度不足，請稍後再試或檢查模型。" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
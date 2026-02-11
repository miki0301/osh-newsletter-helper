import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔍 [Debug] Body:", body);
    
    // ⭐【強制更新標記】確保 Vercel 更新
    console.log("🚀 嘗試使用清單中的 gemini-flash-latest ..."); 

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
    
    // ⭐【關鍵修改】：使用你清單裡明確存在的 "gemini-flash-latest"
    // 這通常會指向目前最穩定的 Flash 版本 (通常是 1.5)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("🔥 [API Error]:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("429") || errorMessage.includes("Quota")) {
      return NextResponse.json(
        { error: "Quota Exceeded", details: "額度不足，請稍後再試。" },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
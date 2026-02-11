import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔍 [Debug] Body:", body);
    
    // ⭐【強制更新標記】
    console.log("🚀 切換至穩定版 gemini-1.5-flash ..."); 

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
    
    // ⭐【關鍵修改】：使用 1.5 Flash
    // 這是目前 Google 的「主力」模型，免費額度最穩定 (每分鐘 15 次請求)
    // 之前報錯是因為 SDK 舊，現在 SDK 新了，這個一定可以用
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("🔥 [API Error]:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 如果還是遇到 429，代表整個帳號都被鎖了 (機率低)
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
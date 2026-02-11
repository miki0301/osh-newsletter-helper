import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // ⭐【強制更新標記】：請加上這行，確認部署有沒有成功
    console.log("🚀 正在使用 gemini-2.0-flash-lite 模型..."); 

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
    
    // ⭐【再次確認】：必須是這個名字
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

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
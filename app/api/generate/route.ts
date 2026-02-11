import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. 取得 Body 內容
    const { prompt } = await req.json();

    // 2. 初始化 Google AI (記得檢查環境變數名稱)
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

    // 3. 設定模型 (既然 SDK 很新，我們直接用這個名稱)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 4. 發送請求
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. 回傳結果
    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate content", details: error.message },
      { status: 500 }
    );
  }
}
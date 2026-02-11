import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. 取得 Body 內容
    const { prompt } = await req.json();

    // 2. 初始化 Google AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

    // 3. 設定模型
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 4. 發送請求
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. 回傳結果
    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("API Error:", error);
    
    // 🔧 修正重點：我們加上了 (error as Error) 來告訴 TypeScript 這是什麼
    // 或者更保險的做法是轉成字串
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: "Failed to generate content", details: errorMessage },
      { status: 500 }
    );
  }
}
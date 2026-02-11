import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. 取得 Body 並印出來除錯 (關鍵！)
    const body = await req.json();
    console.log("🔍 收到前端請求 Body:", body);

    // 2. 嘗試取得 prompt，這裡相容兩種常見寫法
    // 有些前端套件傳 'prompt'，有些傳 'messages'
    const prompt = body.prompt || body.messages;

    // 3. 防呆檢查：如果是空的，就報錯
    if (!prompt) {
      console.error("❌ 錯誤：Prompt 是空的！");
      return NextResponse.json(
        { error: "Prompt is missing in request body" },
        { status: 400 }
      );
    }

    // 4. 初始化 Google AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 5. 發送請求
    // 注意：如果你是傳 messages 陣列 (Chat 模式)，寫法會不同
    // 這裡假設是簡單的文字生成。如果是 Chat，請告訴我，我再幫你改。
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("🔥 API 執行錯誤:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
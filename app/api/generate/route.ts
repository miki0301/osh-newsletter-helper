import { GoogleGenerativeAI, DynamicRetrievalMode } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔍 [Debug] Body:", body);
    
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
    
    // ⭐【王牌切換】：改用 "gemini-exp-1206"
    // 這是你的清單裡有的實驗性模型，通常免費額度比較寬鬆，且支援搜尋工具！
    const model = genAI.getGenerativeModel({ 
      model: "gemini-exp-1206", 
      
      tools: [
        {
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: DynamicRetrievalMode.MODE_DYNAMIC, 
              dynamicThreshold: 0.7,
            },
          },
        },
      ],

      systemInstruction: `
        你是一位專業的「職業安全衛生 (OSH) 社群小編」。
        你的任務是協助用戶收集、整理最新的職場安全、環保、ESG 或勞動法規相關資訊，並撰寫成吸引人的 Newsletter。
        
        【回應規則】：
        1. 必定使用 Google 搜尋功能來查找與用戶輸入相關的「最新」資訊。
        2. 資料來源必須真實，並盡可能附上連結。
        3. 語氣要專業但親切，適合放在 Line 或 Email 電子報中。
        4. 輸出格式請包含：
           - 📰 【新聞摘要】：3-5 則重點新聞。
           - ⚖️ 【法規動態】：若有近期修法請列出。
           - 💡 【小編觀點】：針對這些新聞的一句總結或建議。
      `,
    });

    console.log("🚀 切換至秘密通道 gemini-exp-1206 啟動雷達...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // 檢查有沒有用到搜尋 (Grounding)
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    // 如果有搜尋來源，把來源網址印在 Log 裡方便你看
    if (groundingMetadata?.groundingChunks) {
        console.log("📡 搜尋到的來源網站：");
        groundingMetadata.groundingChunks.forEach((chunk: any, index: number) => {
            if (chunk.web?.uri) console.log(`   ${index + 1}. ${chunk.web.title}: ${chunk.web.uri}`);
        });
    }

    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("🔥 [API Error]:", error);
    // @ts-ignore
    const errorMessage = error.message || String(error);
    
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
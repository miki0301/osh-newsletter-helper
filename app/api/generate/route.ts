// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. 輔助函式：計算「近三個月」的日期區間
function getQuarterRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 3);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  return { start: formatDate(start), end: formatDate(end) };
}

export async function POST(req: Request) {
  try {
    // 檢查 API Key 是否存在
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("錯誤：找不到 GEMINI_API_KEY");
      return NextResponse.json({ error: '伺服器未設定 API Key' }, { status: 500 });
    }

    const { topic, context } = await req.json();
    const { start, end } = getQuarterRange();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model:'gemini-1.5-flash'});

    // 2. 定義「智慧雷達」的搜尋邏輯
    const radarPrompt = `
      角色：你現在是「職安衛情報雷達系統」。
      
      【任務參數】
      - 資料搜尋區間：${start} 至 ${end} (近三個月)
      - 目標讀者：企業職安管理人員、HR、一般勞工
      - 核心任務：針對下列「四大來源」，模擬並抓取該期間內最可能發生的「關鍵法規變動」或「熱門職安議題」。

      【四大偵測來源與關鍵字】
      1. 🏛️ 勞動部 (MOL) / 職安署 (OSHA)：
         - 關鍵字：職業安全衛生法修正、職場不法侵害、過勞認定標準、職災保險法、勞檢重點、職安衛補助。
      2. 🏥 衛福部 (MOHW) / 國健署 (HPA)：
         - 關鍵字：職場健康促進、北極星計畫、績優職場認證、職場心理健康、中高齡職務再設計。
      3. 🦠 疾管署 (CDC)：
         - 關鍵字：季節性流感、COVID-19職場防疫指引、登革熱、腸病毒。
      4. 📰 新聞媒體 (News)：
         - 關鍵字：工安意外判決、過勞死案例、職場霸凌新聞、知名企業違規裁罰。

      【使用者補充指令】
      ${topic ? `特別聚焦主題：${topic}` : ''}
      ${context ? `額外參考素材：${context}` : ''}

      【輸出格式】
      請直接產出「電子報素材包」，使用 Markdown 格式，包含四個區塊：
      ## 🔍 智慧雷達偵測報告 (${start} ~ ${end})
      ### 1. 🏛️ 法規與官方動態 (MOL/OSHA)
      ### 2. 🏥 職場身心健康 (MOHW/HPA)
      ### 3. 🦠 季節性防疫提醒 (CDC)
      ### 4. 📰 輿情與警示 (News)
      ---
      ### 📝 綜合電子報大綱建議 (3-5 個主標題)
    `;

    const result = await model.generateContent(radarPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: '生成失敗，請檢查後端 Terminal 錯誤訊息' }, { status: 500 });
  }
}
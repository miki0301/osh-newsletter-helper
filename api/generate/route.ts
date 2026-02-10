// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. 輔助函式：計算「近三個月」的日期區間
function getQuarterRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 3);
  
  // 格式化日期為 YYYY/MM/DD
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  return { start: formatDate(start), end: formatDate(end) };
}

export async function POST(req: Request) {
  try {
    const { topic, context } = await req.json();
    const { start, end } = getQuarterRange();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // 2. 定義「智慧雷達」的搜尋邏輯 (Prompt Engineering)
    // 這裡我們指示 AI 模擬一個強大的搜尋引擎與分析師
    const radarPrompt = `
      角色：你現在是「職安衛情報雷達系統」。
      
      【任務參數】
      - 資料搜尋區間：${start} 至 ${end} (近三個月)
      - 目標讀者：企業職安管理人員、HR、一般勞工
      - 核心任務：針對下列「四大來源」，模擬並抓取該期間內最可能發生的「關鍵法規變動」或「熱門職安議題」。

      【四大偵測來源與關鍵字】
      1. 🏛️ 勞動部 (MOL) / 職安署 (OSHA)：
         - 關鍵字：職業安全衛生法修正、職場不法侵害、過勞認定標準、職災保險法、勞檢重點、職安衛補助。
         - 重點搜尋：是否有新修法？是否有擴大補助？

      2. 🏥 衛福部 (MOHW) / 國健署 (HPA)：
         - 關鍵字：職場健康促進、北極星計畫、績優職場認證、職場心理健康、中高齡職務再設計(健康面)、母性健康保護。
         - 重點搜尋：健康促進標章申請時間、心理健康支持方案。

      3. 🦠 疾管署 (CDC)：
         - 關鍵字：季節性流感(流感疫苗)、COVID-19職場防疫指引、登革熱(戶外作業)、腸病毒(托育機構職場)。
         - 重點搜尋：依據目前季節(${new Date().getMonth() + 1}月)，預測最需注意的傳染病。

      4. 📰 新聞媒體 (News)：
         - 關鍵字：工安意外判決(借鏡)、過勞死案例、職場霸凌新聞、知名企業違規裁罰。
         - 重點搜尋：近三個月社會關注的重大職安新聞事件。

      【使用者補充指令】
      ${topic ? `特別聚焦主題：${topic}` : ''}
      ${context ? `額外參考素材：${context}` : ''}

      【輸出格式】
      請直接產出「電子報素材包」，使用 Markdown 格式，包含四個區塊：
      
      ## 🔍 智慧雷達偵測報告 (${start} ~ ${end})

      ### 1. 🏛️ 法規與官方動態 (MOL/OSHA)
      - [標題] (重點摘要 50 字)
      - *小編建議：* (如何應用於公司政策)

      ### 2. 🏥 職場身心健康 (MOHW/HPA)
      - [標題] (重點摘要 50 字)
      - *小編建議：* (如何申請補助或推廣)

      ### 3. 🦠 季節性防疫提醒 (CDC)
      - [目前風險] (例如：流感高峰期)
      - *小編建議：* (公司疫苗假或消毒措施)

      ### 4. 📰 輿情與警示 (News)
      - [新聞事件] (簡述事件與判決結果)
      - *小編警示：* (我們公司該如何避免)

      ---
      
      ### 📝 綜合電子報大綱建議
      (基於以上素材，生成本季電子報的 3-5 個主標題)
    `;

    const result = await model.generateContent(radarPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });

  } catch (error) {
    console.error('Radar Error:', error);
    return NextResponse.json({ error: '雷達掃描失敗' }, { status: 500 });
  }
}
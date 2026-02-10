"use client";
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('');

  // 初始化：計算並顯示「近三個月」的日期區間
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    // 格式化日期 (例如: 2023/10/01 ~ 2024/01/01)
    setDateRange(`${start.toLocaleDateString()} ~ ${end.toLocaleDateString()}`);
  }, []);

  const generateNewsletter = async () => {
    if (!topic) {
      alert('請至少輸入本季的主題或是關鍵字喔！');
      return;
    }

    setLoading(true);
    setResult(''); // 清空舊結果

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context }),
      });

      const data = await response.json();
      
      if (data.error) {
        setResult(`發生錯誤: ${data.error}`);
      } else {
        setResult(data.result);
      }
    } catch (error) {
      setResult('連線發生錯誤，請稍後再試。');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        
        {/* 標題區 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">
            🛡️ 職安衛電子報生成助手
          </h1>
          <p className="text-gray-500 mt-2">AI 驅動・法規合規・全自動化情報彙整</p>
        </div>

        {/* 📡 智慧雷達儀表板 (視覺化顯示) */}
        <div className="mb-8 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4 border-b border-slate-600 pb-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              智慧資訊雷達 (已啟動)
            </h3>
            <span className="text-sm bg-slate-600 px-3 py-1 rounded-full text-slate-200">
              搜尋區間：{dateRange || '載入中...'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-slate-600/50 rounded-lg">
              <div className="text-2xl">🏛️</div>
              <div>
                <strong className="block text-blue-300">勞動部 (MOL) / 職安署</strong>
                <span className="text-slate-300 text-xs">鎖定：修法動態、職災保險、過勞認定</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-600/50 rounded-lg">
              <div className="text-2xl">🏥</div>
              <div>
                <strong className="block text-pink-300">衛福部 (MOHW) / 國健署</strong>
                <span className="text-slate-300 text-xs">鎖定：職場健康促進、心理健康、中高齡</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-600/50 rounded-lg">
              <div className="text-2xl">🦠</div>
              <div>
                <strong className="block text-green-300">疾管署 (CDC)</strong>
                <span className="text-slate-300 text-xs">鎖定：季節性傳染病、職場防疫指引</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-600/50 rounded-lg">
              <div className="text-2xl">📰</div>
              <div>
                <strong className="block text-yellow-300">新聞媒體 (News)</strong>
                <span className="text-slate-300 text-xs">鎖定：工安判決、社會輿情、警示案例</span>
              </div>
            </div>
          </div>
        </div>

        {/* 輸入區 */}
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              本季主打焦點 / 關鍵字
            </label>
            <input 
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition outline-none text-lg"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：2026 第一季、夏季熱危害預防、流感季節..."
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              補充參考素材 (選填)
            </label>
            <textarea 
              className="w-full p-4 border border-gray-300 rounded-xl h-32 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition outline-none"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="若您手邊有特定的新聞標題或內部公告想要 AI 參考，請貼在這裡..."
            />
          </div>

          <button 
            onClick={generateNewsletter}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold text-xl shadow-lg transform transition active:scale-95 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                雷達掃描與撰寫中...
              </span>
            ) : '🚀 開始生成電子報大綱'}
          </button>
        </div>

        {/* 結果顯示區 */}
        {result && (
          <div className="mt-10 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
              <span className="text-2xl">📝</span>
              <h2 className="text-2xl font-bold text-gray-800">生成結果預覽</h2>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 shadow-inner overflow-hidden">
              <article className="prose prose-blue prose-lg max-w-none text-gray-700">
                {/* 使用 ReactMarkdown 渲染 AI 回傳的 Markdown 語法 */}
                <ReactMarkdown>{result}</ReactMarkdown>
              </article>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
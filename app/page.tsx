// app/page.tsx
"use client";
import { useState } from 'react';
import ReactMarkdown from 'react-markdown'; // 若報錯可先忽略，或執行 npm install react-markdown

export default function Home() {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generateNewsletter = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context }),
      });
      const data = await response.json();
      setResult(data.result || '發生錯誤');
    } catch (error) {
      setResult('連線錯誤');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">🛡️ 職安衛電子報生成助手</h1>
        
        <div className="mb-4">
          <label className="block mb-2 font-bold">本季主打焦點 (例如：夏季防熱危害、流感季節)</label>
          <input 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="請輸入本季想強調的主題..."
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-bold">貼上近期新聞/法規重點 (作為 AI 參考素材)</label>
          <textarea 
            className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="您可以從勞動部網站複製近期標題貼在這裡，增加準確度..."
          />
        </div>

        <button 
          onClick={generateNewsletter}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-bold text-lg transition duration-200 ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? '小編正在撰寫中...' : '✨ 生成電子報大綱'}
        </button>

        {result && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 prose prose-blue max-w-none">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">生成結果：</h2>
            <div className="whitespace-pre-wrap">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
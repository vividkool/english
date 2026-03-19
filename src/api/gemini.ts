import { GoogleGenerativeAI } from "@google/generative-ai";

// VITE_GEMINI_API_KEY を .env ファイルから取得することを想定
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiResponse = async (prompt: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * 学習用プロンプト生成
 * @param grade US Grade (1-12)
 * @param situation シチュエーション
 */
export const generateDrillPrompt = (grade: string, situation: string) => {
  return `あなたは米国の小学校の先生です。${grade}レベルの英語学習者のために、以下のシチュエーションに基づいた短い英会話のフレーズを1つだけ生成してください。
  
シチュエーション: ${situation}

出力は以下のJSON形式でお願いします:
{
  "japanese": "状況の説明",
  "english": "学習すべき正しい英文",
  "hint": "学習者へのヒント"
}`;
};

/**
 * 採点用プロンプト生成
 */
export const generateScoringPrompt = (original: string, userTyped: string) => {
  return `あなたは厳格な小学校の先生です。以下の正解とユーザーの回答を比較し、採点してください。
冠詞(a, the)、複数形のs、時制、綴りのミスが1つでもあれば不合格(Fail)としてください。

正解: ${original}
回答: ${userTyped}

出力は以下のJSON形式でお願いします:
{
  "result": "Pass/Fail",
  "feedback": "ミスがある場合の具体的な指摘（日本語）",
  "is_perfect": true/false
}`;
};

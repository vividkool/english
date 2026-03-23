import { GoogleGenerativeAI } from "@google/generative-ai";

// VITE_GEMINI_API_KEY を .env ファイルから取得することを想定
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiResponse = async (prompt: string) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    generationConfig: { responseMimeType: "application/json" }
  });
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Markdownのコードブロックを削除
    text = text.replace(/```json\n?|```/g, "").trim();
    
    // もしJSONの外側にテキストがあっても抽出を試みる
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * 教材用プロンプト生成
 * @param grade US Grade (1-12)
 * @param theme テーマ
 */
export const generateLessonPrompt = (grade: string, theme: string) => {
  return `あなたは米国の小学校の優しくて教え上手な先生です。${grade}レベルの子供たちのために、以下のテーマに基づいた本日の教材を生成してください。
  
テーマ: ${theme}

必ず以下のJSON形式のみを出力してください。説明文や「はい、わかりました」といった挨拶は一切含めないでください。
{
  "theme": "今日のテーマタイトル",
  "vocabulary": [
    {"english": "word1", "japanese": "単語1", "sentence": "例文1"},
    {"english": "word2", "japanese": "単語2", "sentence": "例文2"}
  ],
  "idioms": [
    {"english": "idiom1", "japanese": "熟語1", "sentence": "例文1"}
  ],
  "phrases": [
    {"english": "phrase1", "japanese": "慣用句1", "sentence": "例文1"}
  ]
}

日常的で親しみやすい表現を選んでください。`;
};

/**
 * 採点用プロンプト生成
 */
export const generateScoringPrompt = (original: string, userTyped: string) => {
  return `あなたは世界一優しくて褒め上手な小学校の先生です。子供の回答を negativity を排除して採点してください。
意味が通じればまずは褒めてあげてください。

必ず以下のJSON形式のみを出力してください。説明文や挨拶は一切含めないでください。
{
  "result": "Pass/Fail",
  "feedback": "子供がやる気が出るようなアドバイス（日本語）",
  "is_perfect": true/false
}

正解: ${original}
子供の回答: ${userTyped}`;
};


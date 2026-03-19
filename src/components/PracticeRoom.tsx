import { useState, useEffect } from "react";
import { getGeminiResponse, generateDrillPrompt, generateScoringPrompt } from "../api/gemini";

interface Drill {
  japanese: string;
  english: string;
  hint: string;
}

export const PracticeRoom = () => {
  const [drill, setDrill] = useState<Drill | null>(null);
  const [consecutiveCount, setConsecutiveCount] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [userSpeech, setUserSpeech] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 初回ロード時に問題を生成
  useEffect(() => {
    fetchNewDrill();
  }, []);

  const fetchNewDrill = async () => {
    setIsLoading(true);
    try {
      const prompt = generateDrillPrompt("US Grade 1", "おやつが欲しい時");
      const response = await getGeminiResponse(prompt);
      const parsedDrill = JSON.parse(response);
      setDrill(parsedDrill);
      setFeedback("");
      setUserSpeech("");
    } catch (error) {
      console.error("Failed to fetch drill:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFeedback("このブラウザは音声認識をサポートしていません。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserSpeech(transcript);
      handleScoring(transcript);
    };

    recognition.start();
  };

  const handleScoring = async (speechText: string) => {
    if (!drill) return;
    setIsLoading(true);
    try {
      const prompt = generateScoringPrompt(drill.english, speechText);
      const response = await getGeminiResponse(prompt);
      const score = JSON.parse(response);

      if (score.result === "Pass") {
        const newCount = consecutiveCount + 1;
        setConsecutiveCount(newCount);
        setFeedback("🎉 正解！完璧です！");
        if (newCount >= 10) {
          setFeedback("🏆 10回連続達成！おめでとうございます！マスターしました。");
          // 次のレベルや新しい問題へ
        }
      } else {
        setConsecutiveCount(0);
        setFeedback(`❌ 不合格: ${score.feedback}`);
      }
    } catch (error) {
      setFeedback("採点中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="practice-room card">
      {isLoading && <div className="loader">Geminiが考えています...</div>}
      
      {drill && (
        <div className="drill-content">
          <div className="status-badge">連続正解: {consecutiveCount} / 10</div>
          <h2>{drill.japanese}</h2>
          <p className="hint">ヒント: {drill.hint}</p>
          
          <div className="speech-section">
            <button 
              className={`mic-button ${isRecording ? 'recording' : ''}`}
              onClick={startSpeechRecognition}
              disabled={isLoading || isRecording}
            >
              {isRecording ? "🎤 聞いています..." : "🎤 話して答える"}
            </button>
            {userSpeech && <p className="user-speech">あなたの発話: "{userSpeech}"</p>}
          </div>

          {feedback && <div className={`feedback-area ${consecutiveCount === 0 ? 'fail' : 'pass'}`}>{feedback}</div>}
          
          <button className="secondary-button" onClick={fetchNewDrill} disabled={isLoading}>
            別の問題に変える
          </button>
        </div>
      )}
    </div>
  );
};

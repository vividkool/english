import { useState, useEffect } from "react";
import { getGeminiResponse, generateLessonPrompt, generateScoringPrompt } from "../api/gemini";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

interface LessonItem {
  english: string;
  japanese: string;
  sentence: string;
}

interface Lesson {
  theme: string;
  vocabulary: LessonItem[];
  idioms: LessonItem[];
  phrases: LessonItem[];
}

export const PracticeRoom = () => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<"read" | "write" | "speak">("read");
  const [consecutiveCount, setConsecutiveCount] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [userGrade, setUserGrade] = useState("US Grade 1");
  const [feedback, setFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [userSpeech, setUserSpeech] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentType, setCurrentType] = useState<"vocabulary" | "idioms" | "phrases">("vocabulary");

  // 初回ロード：進捗データの読み込みと教材生成
  useEffect(() => {
    const initialize = async () => {
      const savedProgress = await fetchProgress();
      let grade = "US Grade 1";
      if (savedProgress) {
        setTotalCorrect(savedProgress.totalCorrect || 0);
        grade = calculateGrade(savedProgress.totalCorrect || 0);
        setUserGrade(grade);
      }
      fetchNewLesson(grade);
    };
    initialize();
  }, []);

  const fetchProgress = async () => {
    try {
      const docRef = doc(db, "user_progress", "current_user");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (e) {
      console.error("Error fetching progress:", e);
      return null;
    }
  };

  const calculateGrade = (total: number) => {
    if (total > 200) return "US Grade 4";
    if (total > 100) return "US Grade 3";
    if (total > 50) return "US Grade 2";
    return "US Grade 1";
  };

  const saveProgress = async (isCorrect: boolean) => {
    try {
      const docRef = doc(db, "user_progress", "current_user");
      const docSnap = await getDoc(docRef);
      
      const updateData = isCorrect 
        ? { totalCorrect: increment(1), lastUpdate: new Date().toISOString() }
        : { lastUpdate: new Date().toISOString() };

      if (!docSnap.exists()) {
        await setDoc(docRef, { totalCorrect: isCorrect ? 1 : 0, grade: "US Grade 1", lastUpdate: new Date().toISOString() });
      } else {
        await updateDoc(docRef, updateData);
      }

      if (isCorrect) {
        const newTotal = totalCorrect + 1;
        setTotalCorrect(newTotal);
        const newGrade = calculateGrade(newTotal);
        if (newGrade !== userGrade) {
          setUserGrade(newGrade);
          setFeedback(`🎖 レベルアップ！ ${newGrade} になったよ！`);
        }
      }
    } catch (e) {
      console.error("Error saving progress:", e);
    }
  };

  const fetchNewLesson = async (gradeOverride?: string) => {
    setIsLoading(true);
    try {
      const grade = gradeOverride || userGrade;
      const themeList = ["学校での挨拶", "おやつが欲しい時", "公園で遊ぶ", "好きな動物", "家族の紹介"];
      const randomTheme = themeList[Math.floor(Math.random() * themeList.length)];
      
      const prompt = generateLessonPrompt(grade, randomTheme);
      const response = await getGeminiResponse(prompt);
      const parsedLesson = JSON.parse(response);
      setLesson(parsedLesson);
      setFeedback("");
      setUserSpeech("");
      setUserInput("");
      setConsecutiveCount(0);
      setCurrentIndex(0);
      setCurrentType("vocabulary");
    } catch (error) {
      console.error("Failed to fetch lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentItem = (): LessonItem | null => {
    if (!lesson) return null;
    return lesson[currentType][currentIndex] || null;
  };

  const nextItem = () => {
    if (!lesson) return;
    const types: ("vocabulary" | "idioms" | "phrases")[] = ["vocabulary", "idioms", "phrases"];
    const typeIndex = types.indexOf(currentType);
    
    if (currentIndex < lesson[currentType].length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (typeIndex < types.length - 1) {
      setCurrentType(types[typeIndex + 1]);
      setCurrentIndex(0);
    } else {
      setCurrentType("vocabulary");
      setCurrentIndex(0);
    }
    setFeedback("");
    setUserInput("");
    setUserSpeech("");
  };

  const handleScoring = async (answer: string) => {
    const currentItem = getCurrentItem();
    if (!currentItem) return;

    setIsLoading(true);
    try {
      const prompt = generateScoringPrompt(currentItem.english, answer);
      const response = await getGeminiResponse(prompt);
      const score = JSON.parse(response);

      if (score.result === "Pass") {
        const newCount = consecutiveCount + 1;
        setConsecutiveCount(newCount);
        setFeedback(`✨ ${score.feedback}`);
        await saveProgress(true);
        if (newCount >= 10) {
          setFeedback("🌈 すっごい！10回連続正解だよ！マスターしたね！");
        }
      } else {
        setConsecutiveCount(0);
        setFeedback(`💡 ${score.feedback}`);
        await saveProgress(false);
      }
    } catch (error) {
      setFeedback("先生がちょっとお休み中みたい。もう一度送ってみてね。");
    } finally {
      setIsLoading(false);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFeedback("このブラウザは音声認識が使えないみたい。");
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

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const renderRead = () => (
    <div className="read-view">
      <h3>📚 {lesson?.theme}</h3>
      <div className="lesson-section">
        <h4>🌟 たんご (Words)</h4>
        {lesson?.vocabulary.map((v, i) => (
          <div key={i} className="lesson-item">
            <button className="speak-icon-button" onClick={() => speakText(v.english)}>🔊</button>
            <strong>{v.english}</strong>: {v.japanese}
            <p className="sentence">{v.sentence}</p>
          </div>
        ))}
      </div>
      <div className="lesson-section">
        <h4>💫 じゅくご (Idioms)</h4>
        {lesson?.idioms.map((v, i) => (
          <div key={i} className="lesson-item">
            <button className="speak-icon-button" onClick={() => speakText(v.english)}>🔊</button>
            <strong>{v.english}</strong>: {v.japanese}
            <p className="sentence">{v.sentence}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWrite = () => {
    const item = getCurrentItem();
    return (
      <div className="write-view">
        <div className="status-badge">連続正解: {consecutiveCount} / 10</div>
        <h3>✍️ かいてみよう</h3>
        {item && (
          <div className="quiz-container">
            <div className="q-header">
              <button className="speak-icon-button" onClick={() => speakText(item.english)}>🔊</button>
              <p className="japanese-hint">{item.japanese} を英語でいうと？</p>
            </div>
            <input 
              type="text" 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="ここに英語をかいてね"
              onKeyDown={(e) => e.key === 'Enter' && handleScoring(userInput)}
            />
            <button className="primary-button" onClick={() => handleScoring(userInput)} disabled={isLoading || !userInput}>
              こたえあわせ
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSpeak = () => {
    const item = getCurrentItem();
    return (
      <div className="speak-view">
        <div className="status-badge">連続正解: {consecutiveCount} / 10</div>
        <h3>🎤 はなしてみよう</h3>
        {item && (
          <div className="quiz-container">
            <div className="q-header">
              <button className="speak-icon-button" onClick={() => speakText(item.english)}>🔊</button>
              <p className="english-target">{item.english}</p>
            </div>
            <p className="japanese-sub">({item.japanese})</p>
            <button 
              className={`mic-button ${isRecording ? 'recording' : ''}`}
              onClick={startSpeechRecognition}
              disabled={isLoading || isRecording}
            >
              {isRecording ? "👂 きいてるよ..." : "🎤 おしてからはなしてね"}
            </button>
            {userSpeech && <p className="user-speech">きこえたよ: "{userSpeech}"</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="practice-room card">
      {isLoading && (
        <div className="loader-overlay">
          <div className="spinner"></div>
          <div className="loader-text">Gemini先生が準備中... 💫</div>
        </div>
      )}
      
      <div className="scroll-content">
        <div className="progress-header">
          <span>現在のレベル: <strong>{userGrade}</strong></span>
          <span>累計正解数: <strong>{totalCorrect}</strong></span>
        </div>

        {activeTab === "read" && renderRead()}
        {activeTab === "write" && renderWrite()}
        {activeTab === "speak" && renderSpeak()}
        
        {feedback && <div className={`feedback-area ${consecutiveCount === 0 ? 'hint-box' : 'pass-box'}`}>{feedback}</div>}
        
        {(activeTab === "write" || activeTab === "speak") && (
          <button className="secondary-button" onClick={nextItem}>つぎの問題へ</button>
        )}

        <button className="text-button" onClick={() => fetchNewLesson()} disabled={isLoading}>
          あたらしいテーマにする
        </button>
      </div>

      <div className="fixed-bottom-nav">
        <button className={activeTab === 'read' ? 'active' : ''} onClick={() => {setActiveTab('read'); setFeedback("");}}>📖 Read</button>
        <button className={activeTab === 'write' ? 'active' : ''} onClick={() => {setActiveTab('write'); setFeedback("");}}>✍️ Write</button>
        <button className={activeTab === 'speak' ? 'active' : ''} onClick={() => {setActiveTab('speak'); setFeedback("");}}>🎤 Speak</button>
      </div>
    </div>
  );
};


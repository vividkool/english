import { PracticeRoom } from './components/PracticeRoom'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Step-by-Step Mastery</h1>
        <p>アメリカの子供が学ぶように、1つずつ完璧に。</p>
      </header>
      <main>
        <PracticeRoom />
      </main>
    </div>
  )
}

export default App

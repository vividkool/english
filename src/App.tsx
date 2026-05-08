import { PracticeRoom } from './components/PracticeRoom'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>English Teacher</h1>
        <p>Let's Speak English</p>
      </header>
      <main>
        <PracticeRoom />
      </main>
    </div>
  )
}

export default App

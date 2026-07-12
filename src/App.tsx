import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import { Home } from './pages/Home'
import { PassDetail } from './pages/PassDetail'

function App() {
  return (
    <Router>
      <div className="max-w-md mx-auto w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pass/:id" element={<PassDetail />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  )
}

export default App

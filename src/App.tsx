import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import { Home } from './pages/Home'
import { PassDetail } from './pages/PassDetail'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pass/:id" element={<PassDetail />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </Router>
  )
}

export default App

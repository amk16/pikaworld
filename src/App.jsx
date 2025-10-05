import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainPage from './components/MainPage'
import Gyming from './pages/gyming'
import Socializing from './pages/socializing'
import Working from './pages/working'
import './App.css'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/gyming" element={<Gyming />} />
        <Route path="/socializing" element={<Socializing />} />
        <Route path="/working" element={<Working />} />
      </Routes>
    </Router>
  )
}

export default App
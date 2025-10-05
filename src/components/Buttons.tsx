import React from 'react'
import { useNavigate } from 'react-router-dom'

// Individual Button Components
export const GokuButton = () => {
  const handleGokuClick = () => {
    console.log('Goku Pikachu button clicked!')
  }

  return (
    <button 
      onClick={handleGokuClick}
      className="transition-transform hover:scale-110 active:scale-95 rounded-lg overflow-hidden relative mb-5"
      style={{
        animation: 'bounceIn 0.8s ease-out 0.4s both'
      }}
    >
      <img src="/gokuPika.png" alt="Goku Pikachu" className="w-50 h-50 object-cover" />
      <span className="text-white font-bold text-sm absolute top-53 left-1/2 transform -translate-x-1/2 z-10">SOCIALIZING</span>
    </button>
  )
}

export const KratosButton = () => {
  const navigate = useNavigate()
  
  const handleKratosClick = () => {
    console.log('Kratos Pikachu button clicked!')
    navigate('/gyming')
  }

  return (
    <button 
      onClick={handleKratosClick}
      className="transition-transform hover:scale-110 active:scale-95 rounded-lg overflow-hidden pb-20 pr-20"
      style={{
        animation: 'fadeInUp 0.6s ease-out 0.1s both'
      }}
    >
      <img src="/kratosPika.png" alt="Kratos Pikachu" className="w-50 h-50 object-cover" />
      <span className="text-white font-bold mt-53 text-sm">GYMING</span>
    </button>
  )
}

export const DeskButton = () => {
  const handleDeskClick = () => {
    console.log('Desk Pikachu button clicked!')
  }

  return (
    <button 
      onClick={handleDeskClick}
      className="transition-transform hover:scale-110 active:scale-95 rounded-lg overflow-hidden mb-5 ml-10"
      style={{
        animation: 'bounceIn 0.8s ease-out 0.7s both'
      }}
    >
      <img src="/deskPika.png" alt="Desk Pikachu" className="w-40 h-40 object-cover" />
      <span className="text-white font-bold mt-2 text-sm">WORKING</span>
    </button>
  )
}

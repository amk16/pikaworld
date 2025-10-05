import React, { useState, useEffect } from 'react'

interface PikachuLoadingProps {
  onLoadingComplete?: () => void
}

const PikachuLoading = ({ onLoadingComplete }: PikachuLoadingProps) => {
  const [progress, setProgress] = useState(0)
  const [fadeOutElements, setFadeOutElements] = useState(false)
  const [slidePikachu, setSlidePikachu] = useState(false)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          // First fade out loader and road, then slide Pikachu
          setTimeout(() => {
            setFadeOutElements(true)
            // After elements fade out, slide Pikachu
            setTimeout(() => {
              setSlidePikachu(true)
              // After Pikachu slides out completely, call the callback
              setTimeout(() => {
                onLoadingComplete?.()
              }, 2000) // Wait 2 seconds for slide animation to complete
            }, 1000) // Wait 1 second for fade out to complete
          }, 500)
          return 100
        }
        return prev + 1
      })
    }, 50)
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ffeabb]">
      <div className="transform -translate-x-8">
      <style>{`
        @keyframes scrollRight {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        @keyframes slideOutLeft {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100vw);
          }
        }
      `}</style>
      
      {/* Loading Percentage */}
      <div 
        className="mb-8 text-center"
        style={{
          animation: fadeOutElements ? 'fadeOut 1s ease-out forwards' : 'none'
        }}
      >
        <span className="text-4xl font-bold text-gray-800">
          {progress}%
        </span>
      </div>
      
      {/* Pikachu Image */}
      <div className="flex flex-col items-center">
        <img
          src="/pikachu.png"
          alt="Pikachu"
          className="w-32 h-32 md:w-48 md:h-32"
          style={{
            animation: slidePikachu ? 'slideOutLeft 2s ease-in-out forwards' : 'none'
          }}
        />
        
        {/* Road container with overflow hidden */}
        <div 
          className="w-40 md:w-48 overflow-hidden relative h-8"
          style={{
            animation: fadeOutElements ? 'fadeOut 1s ease-out forwards' : 'none'
          }}
        >
          <div 
            className="flex absolute top-0 left-0" 
            style={{ 
              width: '200%',
              animation: 'scrollRight 3s linear infinite'
            }}
          >
            <img
              src="/pikachuLine.jpg"
              alt="Pikachu Line"
              className="w-32 md:w-48 h-auto flex-shrink-0"
            />
            <img
              src="/pikachuLine.jpg"
              alt="Pikachu Line"
              className="w-32 md:w-48 h-auto flex-shrink-0"
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default PikachuLoading
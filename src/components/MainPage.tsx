import React, { useState } from 'react'
import PikachuLoading from './PikachuLoading'
import {GokuButton, KratosButton, DeskButton} from './Buttons.tsx'

const MainPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [currentComponent, setCurrentComponent] = useState<'home' | 'bugs'>('home')

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#ffeabb]">
      {isLoading ? (
        <PikachuLoading onLoadingComplete={handleLoadingComplete} />
      ) : (
        <div className="flex flex-col items-center justify-center mr-20 min-h-screen p-8">
          <div className="flex gap-6 flex-wrap justify-center">
            <KratosButton />
            <GokuButton />
            <DeskButton />
          </div>
        </div>
      )}
    </div>
  )
}

export default MainPage

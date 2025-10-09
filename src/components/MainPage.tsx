import React from 'react'
import {GokuButton, KratosButton, DeskButton} from './Buttons.tsx'
import MinimalAuth from './MinimalAuth'

const MainPage = () => {
  return (
    <div className="min-h-screen bg-[#ffeabb]">
      <MinimalAuth />
      <div className="flex flex-col items-center justify-center mr-20 min-h-screen p-8">
        <div className="flex gap-6 flex-wrap justify-center">
          <KratosButton />
          <GokuButton />
          <DeskButton />
        </div>
      </div>
    </div>
  )
}

export default MainPage

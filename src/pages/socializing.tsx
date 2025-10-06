import React from 'react'
import NavigationDock from '../components/NavigationDock'   

const Socializing = () => {
  return (
    <div className='bg-[#ffeabb] min-h-screen relative'>
        {/* Goku Pikachu image in bottom left */}
        <img 
          src="/gokuPika.png" 
          alt="Goku Pikachu" 
          className="absolute -bottom-20 -left-10 w-100 h-150 opacity-30 object-contain"
        />
        
        {/* SOCIALIZING text positioned at bottom left under the pikachu image */}
        <h1 className="absolute bottom-4 left-4 font-bold text-6xl z-10 opacity-30">
          <span className="text-black">SOCIAL</span>
          <span className="text-orange-500">IZING</span>
        </h1>
        
        {/* Navigation Dock */}
        <NavigationDock />
    </div>
    
  )
}

export default Socializing

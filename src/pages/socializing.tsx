import React from 'react'   

const Socializing = () => {
  return (
    <div className='bg-[#ffeabb] min-h-screen relative'>
        <h1>SOCIALIZING</h1>
        
        {/* Goku Pikachu image in bottom left */}
        <img 
          src="/gokuPika.png" 
          alt="Goku Pikachu" 
          className="absolute bottom-4 left-4 w-32 h-32 object-contain"
        />
    </div>
    
  )
}

export default Socializing

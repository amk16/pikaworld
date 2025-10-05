import React from 'react'   

const Working = () => {
  return (
    <div className='bg-[#ffeabb] min-h-screen relative'>
        <h1>WORKING</h1>
        
        {/* Desk Pikachu image in bottom left */}
        <img 
          src="/deskPika.png" 
          alt="Desk Pikachu" 
          className="absolute bottom-4 left-4 w-32 h-32 object-contain"
        />
    </div>
    
  )
}

export default Working

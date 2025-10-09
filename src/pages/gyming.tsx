import React from 'react'   
import CustomCalendar from '../components/CustomCalendar'
import NavigationDock from '../components/NavigationDock'

const Gyming = () => {
  return (
    <div className='bg-[#ffeabb] min-h-screen relative'>
        {/* Calendar in the center */}
        <div className="flex items-center justify-center min-h-screen">
          <CustomCalendar />
        </div>
        
        {/* Kratos Pikachu image in bottom left */}
        <img 
          src="/kratosPika.png" 
          alt="Kratos Pikachu" 
          className="absolute bottom-4 -left-35 w-100 h-150 opacity-30 object-contain"
        />
        
        {/* GYMING text positioned at bottom left under the pikachu image */}
        <h1 className="absolute bottom-4 left-4 font-bold text-6xl z-10 opacity-30">
          <span className="text-black">G</span>
          <span className="text-red-600">Y</span>
          <span className="text-red-600">M</span>
          <span className="text-black">ING</span>
        </h1>
        
        {/* Navigation Dock */}
        <NavigationDock />
    </div>
  )
}

export default Gyming
import React, { useState, useEffect } from 'react'
import { dataService, type DateData, type Exercise } from '../services/dataService'
import DataManager from './DataManager'

const CustomCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDataManager, setShowDataManager] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Force re-render when refreshTrigger changes
  useEffect(() => {
    // This effect will run whenever refreshTrigger changes, forcing a re-render
  }, [refreshTrigger])
  
  // Get the first day of the month and number of days
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Create array of days to display
  const calendarDays: (number | null)[] = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }
  
  // Add empty cells at the end to make a complete 6×7 grid (42 total cells)
  while (calendarDays.length < 42) {
    calendarDays.push(null)
  }
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Handle date selection
  const handleDateClick = (day: number) => {
    setSelectedDate(day)
    setIsMinimized(true)
  }

  // Handle back to calendar
  const handleBackToCalendar = () => {
    setIsMinimized(false)
    setSelectedDate(null)
    setIsEditing(false)
  }

  // Get data for specific date
  const getDateData = (day: number): DateData => {
    return dataService.getDateData(currentDate.getFullYear(), currentDate.getMonth(), day)
  }

  // Save data for specific date
  const saveDateData = (day: number, data: DateData) => {
    dataService.saveDateData(currentDate.getFullYear(), currentDate.getMonth(), day, data)
  }

  // Toggle editing mode
  const toggleEditing = () => {
    setIsEditing(!isEditing)
  }

  // Add exercise row function
  const addExerciseRow = () => {
    if (!selectedDate) return
    
    const currentData = getDateData(selectedDate)
    const newExercises = [...currentData.exercises, { exercise: '', reps: '', sets: '', weight: '', time: '', completed: false }]
    saveDateData(selectedDate, { 
      ...currentData,
      exercises: newExercises 
    })
    // Trigger re-render
    setRefreshTrigger(prev => prev + 1)
  }

  // Update exercise function
  const updateExercise = (index: number, field: 'exercise' | 'reps' | 'sets' | 'weight' | 'time', value: string) => {
    if (!selectedDate) return
    
    const currentData = getDateData(selectedDate)
    const newExercises = [...currentData.exercises]
    newExercises[index][field] = value
    saveDateData(selectedDate, { 
      ...currentData,
      exercises: newExercises 
    })
    // Trigger re-render
    setRefreshTrigger(prev => prev + 1)
  }

  // Toggle completed function
  const toggleCompleted = (index: number) => {
    if (!selectedDate) return
    
    const currentData = getDateData(selectedDate)
    const newExercises = [...currentData.exercises]
    newExercises[index].completed = !newExercises[index].completed
    saveDateData(selectedDate, { 
      ...currentData,
      exercises: newExercises 
    })
    // Trigger re-render
    setRefreshTrigger(prev => prev + 1)
  }

  // Remove exercise function
  const removeExercise = (index: number) => {
    if (!selectedDate) return
    
    const currentData = getDateData(selectedDate)
    const newExercises = currentData.exercises.filter((_, i) => i !== index)
    saveDateData(selectedDate, { 
      ...currentData,
      exercises: newExercises 
    })
    // Trigger re-render
    setRefreshTrigger(prev => prev + 1)
  }
  

  // Render selected date content
  const renderSelectedDateContent = () => {
    if (!selectedDate) return null
    
    // Use refreshTrigger to ensure we get fresh data
    const currentData = getDateData(selectedDate)
    


    return (
      <div className="flex-1 h-full">
        {/* Date header */}
        <h1 className="text-6xl font-bold text-black text-center mb-8">
          {monthNames[currentDate.getMonth()]} {selectedDate}
        </h1>
        
        {/* Five column layout with check circle */}
        <div className="px-8">
          {/* Header row */}
          <div className="grid gap-0" style={{ gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 1fr 60px' }}>
            <div className="p-3 text-center font-bold text-base border-r-2 border-b-2 border-black"></div>
            <div className="p-3 text-center font-bold text-base border-r-2 border-b-2 border-black">EXERCISE</div>
            <div className="p-3 text-center font-bold text-base border-r-2 border-b-2 border-black">REPS</div>
            <div className="p-3 text-center font-bold text-base border-r-2 border-b-2 border-black">SETS</div>
            <div className="p-3 text-center font-bold text-base border-r-2 border-b-2 border-black">WEIGHT</div>
            <div className="p-3 text-center font-bold text-base border-r-2 border-b-2 border-black">TIME</div>
            <div className="p-3 text-center font-bold text-base border-b-2 border-black">DELETE</div>
          </div>
          
          {/* Exercise rows */}
          <div>
            {currentData.exercises.map((exercise, index) => (
              <div key={index} className="grid gap-0" style={{ gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 1fr 60px' }}>
                <div className="flex justify-center items-center p-3 border-r-2 border-b-2 border-black">
                  <button
                    onClick={() => toggleCompleted(index)}
                    className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                  >
                    {exercise.completed && (
                      <span className="text-black text-sm">✓</span>
                    )}
                  </button>
                </div>
                <div className="border-r-2 border-b-2 border-black overflow-hidden">
                  <input
                    type="text"
                    value={exercise.exercise || ''}
                    onChange={(e) => updateExercise(index, 'exercise', e.target.value)}
                    className="w-full p-3 bg-transparent border-none outline-none text-base"
                    placeholder="Exercise name"
                  />
                </div>
                <div className="border-r-2 border-b-2 border-black overflow-hidden">
                  <input
                    type="text"
                    value={exercise.reps || ''}
                    onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                    className="w-full p-3 bg-transparent border-none outline-none text-base text-center"
                    placeholder=""
                  />
                </div>
                <div className="border-r-2 border-b-2 border-black overflow-hidden">
                  <input
                    type="text"
                    value={exercise.sets || ''}
                    onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                    className="w-full p-3 bg-transparent border-none outline-none text-base text-center"
                    placeholder=""
                  />
                </div>
                <div className="border-r-2 border-b-2 border-black overflow-hidden">
                  <input
                    type="text"
                    value={exercise.weight || ''}
                    onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                    className="w-full p-3 bg-transparent border-none outline-none text-base text-center"
                    placeholder=""
                  />
                </div>
                <div className="border-r-2 border-b-2 border-black overflow-hidden">
                  <input
                    type="text"
                    value={exercise.time || ''}
                    onChange={(e) => updateExercise(index, 'time', e.target.value)}
                    className="w-full p-3 bg-transparent border-none outline-none text-base text-center"
                    placeholder=""
                  />
                </div>
                <div className="flex justify-center items-center p-3 border-b-2 border-black">
                  <button
                    onClick={() => removeExercise(index)}
                    className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Delete exercise"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add new row button */}
          <div className="mt-8 text-center">
            <button
              onClick={addExerciseRow}
              className="text-gray-600 hover:text-black text-2xl"
            >
              +
            </button>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="max-w-2xl mx-auto">
      {!isMinimized ? (
        <>
          {/* Month title and data manager button */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setShowDataManager(true)}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
            >
              📊 Data Manager
            </button>
            <h2 className="text-5xl font-bold text-black tracking-wider">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
          
          {/* Creative black grid with enhanced borders */}
          <div className="grid grid-cols-7 gap-0 border-4 border-black shadow-2xl bg-transparent rounded-lg overflow-hidden">
            {calendarDays.map((day, index) => {
              const isTopRow = index < 7
              const isBottomRow = index >= 35
              const isLeftColumn = index % 7 === 0
              const isRightColumn = index % 7 === 6
              const isCorner = (isTopRow && isLeftColumn) || (isTopRow && isRightColumn) || 
                              (isBottomRow && isLeftColumn) || (isBottomRow && isRightColumn)
              
              return (
                <div
                  key={index}
                  onClick={day ? () => handleDateClick(day) : undefined}
                  className={`
                    w-20 h-20 flex items-center justify-center relative
                    border-r-2 border-b-2 border-black
                    ${isRightColumn ? 'border-r-0' : ''}
                    ${isBottomRow ? 'border-b-0' : ''}
                    hover:bg-gray-100 transition-colors duration-200
                    ${day ? 'cursor-pointer' : ''}
                  `}
                >
                  {day && (
                    <>
                      <span className="text-2xl font-bold text-black select-none">
                        {day}
                      </span>
                      {/* Show indicator if date has data */}
                      {(() => {
                        const dateData = getDateData(day)
                        const hasData = dateData.exercises.length > 0
                        const hasCompleted = dateData.exercises.some(ex => ex.completed)
                        return hasData && (
                          <div className="absolute bottom-1 right-1">
                            {hasCompleted ? (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            ) : (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        )
                      })()}
                    </>
                  )}
                  
                  {/* Decorative corner accents for corner cells */}
                  {isCorner && (
                    <div className="absolute inset-0">
                      <div className="absolute top-1 left-1 w-2 h-2 border-l-2 border-t-2 border-black"></div>
                      <div className="absolute top-1 right-1 w-2 h-2 border-r-2 border-t-2 border-black"></div>
                      <div className="absolute bottom-1 left-1 w-2 h-2 border-l-2 border-b-2 border-black"></div>
                      <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-black"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col min-h-screen">
          <div className="mb-4">
            <button
              onClick={handleBackToCalendar}
              className="p-2 text-gray-600 hover:text-black transition-colors duration-200"
            >
              ‹
            </button>
          </div>
          {renderSelectedDateContent()}
        </div>
      )}
      
      {/* Data Manager Modal */}
      <DataManager 
        isOpen={showDataManager} 
        onClose={() => setShowDataManager(false)} 
      />
    </div>
  )
}

export default CustomCalendar
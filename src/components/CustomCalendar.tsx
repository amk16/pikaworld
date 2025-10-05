import React, { useState } from 'react'

interface DateData {
  exercises: Array<{
    exercise: string
    reps: string
    sets: string
    completed: boolean
  }>
}

const CustomCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [dateData, setDateData] = useState<Record<string, DateData>>({})
  const [isEditing, setIsEditing] = useState(false)
  
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

  // Generate unique key for date
  const getDateKey = (day: number) => {
    return `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`
  }

  // Get data for specific date
  const getDateData = (day: number): DateData => {
    const key = getDateKey(day)
    return dateData[key] || {
      exercises: []
    }
  }

  // Save data for specific date
  const saveDateData = (day: number, data: DateData) => {
    const key = getDateKey(day)
    setDateData(prev => ({
      ...prev,
      [key]: data
    }))
  }

  // Toggle editing mode
  const toggleEditing = () => {
    setIsEditing(!isEditing)
  }
  

  // Render selected date content
  const renderSelectedDateContent = () => {
    if (!selectedDate) return null
    
    const currentData = getDateData(selectedDate)
    
    const addExerciseRow = () => {
      const newExercises = [...currentData.exercises, { exercise: '', reps: '', sets: '', completed: false }]
      saveDateData(selectedDate, { exercises: newExercises })
    }

    const updateExercise = (index: number, field: 'exercise' | 'reps' | 'sets', value: string) => {
      const newExercises = [...currentData.exercises]
      newExercises[index][field] = value
      saveDateData(selectedDate, { exercises: newExercises })
    }

    const toggleCompleted = (index: number) => {
      const newExercises = [...currentData.exercises]
      newExercises[index].completed = !newExercises[index].completed
      saveDateData(selectedDate, { exercises: newExercises })
    }

    const removeExercise = (index: number) => {
      const newExercises = currentData.exercises.filter((_, i) => i !== index)
      saveDateData(selectedDate, { exercises: newExercises })
    }

    return (
      <div className="flex-1 h-full">
        {/* Date header */}
        <h1 className="text-6xl font-bold text-black text-center mb-8">
          {monthNames[currentDate.getMonth()]} {selectedDate}
        </h1>
        
        {/* Four column layout with check circle */}
        <div className="px-8">
          {/* Header row */}
          <div className="grid gap-0 mb-4" style={{ gridTemplateColumns: '60px 1fr 120px 120px' }}>
            <div className="p-4 text-center font-bold text-xl"></div>
            <div className="p-4 text-left font-bold text-xl">Exercise</div>
            <div className="p-4 text-center font-bold text-xl border-l-2 border-r-2 border-black rounded-sm">Reps</div>
            <div className="p-4 text-center font-bold text-xl">Sets</div>
          </div>
          
          {/* Exercise rows */}
          <div className="space-y-2">
            {currentData.exercises.map((exercise, index) => (
              <div key={index} className="grid gap-0 items-center" style={{ gridTemplateColumns: '60px 1fr 120px 120px' }}>
                <div className="flex justify-center p-4">
                  <button
                    onClick={() => toggleCompleted(index)}
                    className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                  >
                    {exercise.completed && (
                      <span className="text-black text-sm">✓</span>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={exercise.exercise}
                  onChange={(e) => updateExercise(index, 'exercise', e.target.value)}
                  className={`p-4 bg-transparent border-none outline-none text-lg ${exercise.completed ? 'line-through text-gray-500' : ''}`}
                  placeholder="Exercise name"
                />
                <input
                  type="text"
                  value={exercise.reps}
                  onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                  className={`p-4 bg-transparent border-none outline-none text-lg text-center border-l-2 border-r-2 border-black rounded-sm ${exercise.completed ? 'line-through text-gray-500' : ''}`}
                  placeholder="Reps"
                />
                <input
                  type="text"
                  value={exercise.sets}
                  onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                  className={`p-4 bg-transparent border-none outline-none text-lg text-center ${exercise.completed ? 'line-through text-gray-500' : ''}`}
                  placeholder="Sets"
                />
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
          {/* Month title */}
          <h2 className="text-5xl font-bold text-black text-center mb-8 tracking-wider">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
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
                    <span className="text-2xl font-bold text-black select-none">
                      {day}
                    </span>
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
    </div>
  )
}

export default CustomCalendar

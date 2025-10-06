// Lightweight database service using localStorage
export interface Exercise {
  exercise: string
  reps: string
  sets: string
  weight: string
  time: string
  completed: boolean
}

export interface DateData {
  exercises: Exercise[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CalendarData {
  [dateKey: string]: DateData
}

class DataService {
  private readonly STORAGE_KEY = 'pikaworld_calendar_data'
  private readonly BACKUP_KEY = 'pikaworld_calendar_backup'

  // Get all data from localStorage
  private getData(): CalendarData {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Error reading data from localStorage:', error)
      return {}
    }
  }

  // Save data to localStorage
  private saveData(data: CalendarData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      // Create backup
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving data to localStorage:', error)
      throw new Error('Failed to save data')
    }
  }

  // Generate date key in format: YYYY-MM-DD
  private generateDateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // Get data for a specific date
  getDateData(year: number, month: number, day: number): DateData {
    const dateKey = this.generateDateKey(year, month, day)
    const allData = this.getData()
    return allData[dateKey] || {
      exercises: [],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  // Save data for a specific date
  saveDateData(year: number, month: number, day: number, data: DateData): void {
    const dateKey = this.generateDateKey(year, month, day)
    const allData = this.getData()
    
    // Update timestamps
    const now = new Date().toISOString()
    const existingData = allData[dateKey]
    
    allData[dateKey] = {
      ...data,
      createdAt: existingData?.createdAt || now,
      updatedAt: now
    }
    
    this.saveData(allData)
  }

  // Add exercise to a specific date
  addExercise(year: number, month: number, day: number, exercise: Exercise): void {
    const currentData = this.getDateData(year, month, day)
    const updatedData = {
      ...currentData,
      exercises: [...currentData.exercises, exercise]
    }
    this.saveDateData(year, month, day, updatedData)
  }

  // Update exercise at specific index
  updateExercise(year: number, month: number, day: number, index: number, exercise: Exercise): void {
    const currentData = this.getDateData(year, month, day)
    const updatedExercises = [...currentData.exercises]
    updatedExercises[index] = exercise
    
    const updatedData = {
      ...currentData,
      exercises: updatedExercises
    }
    this.saveDateData(year, month, day, updatedData)
  }

  // Remove exercise at specific index
  removeExercise(year: number, month: number, day: number, index: number): void {
    const currentData = this.getDateData(year, month, day)
    const updatedExercises = currentData.exercises.filter((_, i) => i !== index)
    
    const updatedData = {
      ...currentData,
      exercises: updatedExercises
    }
    this.saveDateData(year, month, day, updatedData)
  }

  // Get all data for a specific month
  getMonthData(year: number, month: number): { [day: number]: DateData } {
    const allData = this.getData()
    const monthData: { [day: number]: DateData } = {}
    
    // Get number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = this.generateDateKey(year, month, day)
      if (allData[dateKey]) {
        monthData[day] = allData[dateKey]
      }
    }
    
    return monthData
  }

  // Get all data
  getAllData(): CalendarData {
    return this.getData()
  }

  // Export data as JSON string
  exportData(): string {
    const data = this.getData()
    return JSON.stringify(data, null, 2)
  }

  // Import data from JSON string
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)
      this.saveData(data)
    } catch (error) {
      console.error('Error importing data:', error)
      throw new Error('Invalid data format')
    }
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.BACKUP_KEY)
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    const data = this.getData()
    const dataSize = JSON.stringify(data).length
    const maxSize = 5 * 1024 * 1024 // 5MB typical localStorage limit
    const percentage = (dataSize / maxSize) * 100
    
    return {
      used: dataSize,
      available: maxSize - dataSize,
      percentage: Math.round(percentage * 100) / 100
    }
  }

  // Restore from backup
  restoreFromBackup(): void {
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY)
      if (backupData) {
        const data = JSON.parse(backupData)
        this.saveData(data)
      }
    } catch (error) {
      console.error('Error restoring from backup:', error)
      throw new Error('Failed to restore from backup')
    }
  }
}

// Export singleton instance
export const dataService = new DataService()
export default dataService

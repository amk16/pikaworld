// Workspace management service for different projects
export interface Workspace {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  textContent: string
  drawingData: any // Canvas drawing data
}

export interface WorkspaceData {
  [workspaceId: string]: Workspace
}

class WorkspaceService {
  private readonly STORAGE_KEY = 'pikaworld_workspaces'
  private readonly CURRENT_WORKSPACE_KEY = 'pikaworld_current_workspace'

  // Get all workspaces from localStorage
  private getWorkspaces(): WorkspaceData {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Error reading workspaces from localStorage:', error)
      return {}
    }
  }

  // Save workspaces to localStorage
  private saveWorkspaces(workspaces: WorkspaceData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workspaces))
    } catch (error) {
      console.error('Error saving workspaces to localStorage:', error)
      throw new Error('Failed to save workspaces')
    }
  }

  // Generate unique workspace ID
  private generateWorkspaceId(): string {
    return `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get current workspace ID
  getCurrentWorkspaceId(): string | null {
    return localStorage.getItem(this.CURRENT_WORKSPACE_KEY)
  }

  // Set current workspace ID
  setCurrentWorkspaceId(workspaceId: string): void {
    localStorage.setItem(this.CURRENT_WORKSPACE_KEY, workspaceId)
  }

  // Get current workspace
  getCurrentWorkspace(): Workspace | null {
    const currentId = this.getCurrentWorkspaceId()
    if (!currentId) return null
    
    const workspaces = this.getWorkspaces()
    return workspaces[currentId] || null
  }

  // Get all workspaces
  getAllWorkspaces(): Workspace[] {
    const workspaces = this.getWorkspaces()
    return Object.values(workspaces).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  // Create a new workspace
  createWorkspace(name: string): Workspace {
    const workspaces = this.getWorkspaces()
    const id = this.generateWorkspaceId()
    const now = new Date().toISOString()
    
    const newWorkspace: Workspace = {
      id,
      name,
      createdAt: now,
      updatedAt: now,
      textContent: '',
      drawingData: null
    }
    
    workspaces[id] = newWorkspace
    this.saveWorkspaces(workspaces)
    this.setCurrentWorkspaceId(id)
    
    return newWorkspace
  }

  // Update workspace
  updateWorkspace(workspaceId: string, updates: Partial<Workspace>): void {
    const workspaces = this.getWorkspaces()
    const workspace = workspaces[workspaceId]
    
    if (!workspace) {
      throw new Error('Workspace not found')
    }
    
    workspaces[workspaceId] = {
      ...workspace,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.saveWorkspaces(workspaces)
  }

  // Update workspace text content
  updateWorkspaceText(workspaceId: string, textContent: string): void {
    this.updateWorkspace(workspaceId, { textContent })
  }

  // Update workspace drawing data
  updateWorkspaceDrawing(workspaceId: string, drawingData: any): void {
    this.updateWorkspace(workspaceId, { drawingData })
  }

  // Delete workspace
  deleteWorkspace(workspaceId: string): void {
    const workspaces = this.getWorkspaces()
    delete workspaces[workspaceId]
    this.saveWorkspaces(workspaces)
    
    // If this was the current workspace, clear it
    if (this.getCurrentWorkspaceId() === workspaceId) {
      localStorage.removeItem(this.CURRENT_WORKSPACE_KEY)
    }
  }

  // Rename workspace
  renameWorkspace(workspaceId: string, newName: string): void {
    this.updateWorkspace(workspaceId, { name: newName })
  }

  // Switch to a workspace
  switchToWorkspace(workspaceId: string): Workspace | null {
    const workspaces = this.getWorkspaces()
    const workspace = workspaces[workspaceId]
    
    if (!workspace) {
      throw new Error('Workspace not found')
    }
    
    this.setCurrentWorkspaceId(workspaceId)
    return workspace
  }

  // Get or create default workspace
  getOrCreateDefaultWorkspace(): Workspace {
    const workspaces = this.getWorkspaces()
    const workspaceList = Object.values(workspaces)
    
    // If no workspaces exist, create a default one
    if (workspaceList.length === 0) {
      return this.createWorkspace('My Workspace')
    }
    
    // If no current workspace is set, use the first one
    const currentId = this.getCurrentWorkspaceId()
    if (!currentId || !workspaces[currentId]) {
      const firstWorkspace = workspaceList[0]
      this.setCurrentWorkspaceId(firstWorkspace.id)
      return firstWorkspace
    }
    
    return workspaces[currentId]
  }

  // Export workspace data
  exportWorkspace(workspaceId: string): string {
    const workspaces = this.getWorkspaces()
    const workspace = workspaces[workspaceId]
    
    if (!workspace) {
      throw new Error('Workspace not found')
    }
    
    return JSON.stringify(workspace, null, 2)
  }

  // Import workspace data
  importWorkspace(jsonData: string, name?: string): Workspace {
    try {
      const workspaceData = JSON.parse(jsonData)
      const id = this.generateWorkspaceId()
      const now = new Date().toISOString()
      
      const importedWorkspace: Workspace = {
        id,
        name: name || workspaceData.name || 'Imported Workspace',
        createdAt: now,
        updatedAt: now,
        textContent: workspaceData.textContent || '',
        drawingData: workspaceData.drawingData || null
      }
      
      const workspaces = this.getWorkspaces()
      workspaces[id] = importedWorkspace
      this.saveWorkspaces(workspaces)
      
      return importedWorkspace
    } catch (error) {
      console.error('Error importing workspace:', error)
      throw new Error('Invalid workspace data format')
    }
  }

  // Clear all workspaces
  clearAllWorkspaces(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.CURRENT_WORKSPACE_KEY)
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    const workspaces = this.getWorkspaces()
    const dataSize = JSON.stringify(workspaces).length
    const maxSize = 5 * 1024 * 1024 // 5MB typical localStorage limit
    const percentage = (dataSize / maxSize) * 100
    
    return {
      used: dataSize,
      available: maxSize - dataSize,
      percentage: Math.round(percentage * 100) / 100
    }
  }
}

// Export singleton instance
export const workspaceService = new WorkspaceService()
export default workspaceService

import React, { useState, useEffect } from 'react'
import { enhancedWorkspaceService } from '../services/enhancedWorkspaceService'
import { Workspace } from '../services/workspaceService'

interface WorkspaceManagerProps {
  currentWorkspace: Workspace | null
  onWorkspaceChange: (workspace: Workspace) => void
}

const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ 
  currentWorkspace, 
  onWorkspaceChange 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Load workspaces when component mounts or when current workspace changes
  useEffect(() => {
    loadWorkspaces()
  }, [currentWorkspace])

  const loadWorkspaces = async () => {
    try {
      const allWorkspaces = await enhancedWorkspaceService.getAllWorkspaces()
      setWorkspaces(allWorkspaces)
    } catch (error) {
      console.error('Error loading workspaces:', error)
      // Fallback to local workspaces
      const { workspaceService } = await import('../services/workspaceService')
      const localWorkspaces = workspaceService.getAllWorkspaces()
      setWorkspaces(localWorkspaces)
    }
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return
    
    try {
      const newWorkspace = await enhancedWorkspaceService.createWorkspace(newWorkspaceName.trim())
      setNewWorkspaceName('')
      setIsCreating(false)
      loadWorkspaces()
      onWorkspaceChange(newWorkspace)
    } catch (error) {
      console.error('Error creating workspace:', error)
    }
  }

  const handleSwitchWorkspace = async (workspaceId: string) => {
    try {
      const workspace = await enhancedWorkspaceService.switchToWorkspace(workspaceId)
      if (workspace) {
        onWorkspaceChange(workspace)
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Error switching workspace:', error)
    }
  }

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (workspaces.length <= 1) {
      alert('Cannot delete the last workspace')
      return
    }
    
    if (confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      try {
        await enhancedWorkspaceService.deleteWorkspace(workspaceId)
        loadWorkspaces()
        
        // If we deleted the current workspace, switch to the first available one
        if (currentWorkspace?.id === workspaceId) {
          const remainingWorkspaces = await enhancedWorkspaceService.getAllWorkspaces()
          if (remainingWorkspaces.length > 0) {
            const newCurrent = await enhancedWorkspaceService.switchToWorkspace(remainingWorkspaces[0].id)
            if (newCurrent) {
              onWorkspaceChange(newCurrent)
            }
          }
        }
      } catch (error) {
        console.error('Error deleting workspace:', error)
      }
    }
  }

  const handleRenameWorkspace = async (workspaceId: string) => {
    if (!editingName.trim()) return
    
    try {
      await enhancedWorkspaceService.renameWorkspace(workspaceId, editingName.trim())
      setEditingId(null)
      setEditingName('')
      loadWorkspaces()
    } catch (error) {
      console.error('Error renaming workspace:', error)
    }
  }

  const startEditing = (workspace: Workspace) => {
    setEditingId(workspace.id)
    setEditingName(workspace.name)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingName('')
  }

  return (
    <div className="relative">
      {/* Workspace Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="backdrop-blur-sm bg-white bg-opacity-10 rounded-full px-4 py-2 border border-gray-200 border-opacity-30 text-sm font-medium text-gray-800 hover:bg-white hover:bg-opacity-20 transition-all duration-200 flex items-center gap-2"
      >
        <span>📁</span>
        <span className="max-w-32 truncate">
          {currentWorkspace?.name || 'No Workspace'}
        </span>
        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Workspace Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg border border-gray-200 border-opacity-30 shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Workspaces</h3>
              <button
                onClick={() => setIsCreating(true)}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
              >
                + New
              </button>
            </div>

            {/* Create New Workspace */}
            {isCreating && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Workspace name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleCreateWorkspace()
                    if (e.key === 'Escape') {
                      setIsCreating(false)
                      setNewWorkspaceName('')
                    }
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleCreateWorkspace}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setNewWorkspaceName('')
                    }}
                    className="text-sm bg-gray-500 text-white px-3 py-1 rounded-full hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Workspace List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={`p-3 rounded-lg border transition-all ${
                    currentWorkspace?.id === workspace.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {editingId === workspace.id ? (
                    <div>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleRenameWorkspace(workspace.id)
                          if (e.key === 'Escape') cancelEditing()
                        }}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleRenameWorkspace(workspace.id)}
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium text-sm cursor-pointer truncate ${
                            currentWorkspace?.id === workspace.id
                              ? 'text-blue-700'
                              : 'text-gray-800'
                          }`}
                          onClick={() => handleSwitchWorkspace(workspace.id)}
                        >
                          {workspace.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Updated {new Date(workspace.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditing(workspace)}
                          className="text-xs text-gray-500 hover:text-gray-700 p-1"
                          title="Rename"
                        >
                          ✏️
                        </button>
                        {workspaces.length > 1 && (
                          <button
                            onClick={() => handleDeleteWorkspace(workspace.id)}
                            className="text-xs text-red-500 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {workspaces.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No workspaces yet. Create your first workspace to get started!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default WorkspaceManager

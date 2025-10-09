// Enhanced workspace service with autosave functionality
import { workspaceService, Workspace } from './workspaceService';
import { firebaseService, CloudWorkspace } from './firebaseService';
import { Timestamp } from 'firebase/firestore';

interface AutosaveStatus {
  isOnline: boolean;
  lastAutosave: Date | null;
  isAutosaving: boolean;
}

class EnhancedWorkspaceService {
  private autosaveStatus: AutosaveStatus = {
    isOnline: false,
    lastAutosave: null,
    isAutosaving: false
  };

  // Initialize the enhanced service
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Firebase service...');
      await firebaseService.initialize();
      
      console.log('Checking Firebase connection...');
      this.autosaveStatus.isOnline = await firebaseService.checkConnection();
      
      console.log('Enhanced workspace service initialized with autosave:', this.autosaveStatus.isOnline);
    } catch (error) {
      console.error('Error initializing enhanced workspace service:', error);
      console.log('Falling back to local storage only');
      this.autosaveStatus.isOnline = false;
    }
  }

  // Get autosave status
  getAutosaveStatus(): AutosaveStatus {
    return { ...this.autosaveStatus };
  }

  // Create workspace (local + autosave to cloud)
  async createWorkspace(name: string): Promise<Workspace> {
    // Create locally first
    const localWorkspace = workspaceService.createWorkspace(name);
    
    // Autosave to cloud if online
    if (this.autosaveStatus.isOnline) {
      await this.autosaveWorkspaceToCloud(localWorkspace);
    }
    
    return localWorkspace;
  }

  // Update workspace (local + autosave to cloud)
  async updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<void> {
    console.log('Updating workspace:', workspaceId, updates);
    
    // Update locally first
    workspaceService.updateWorkspace(workspaceId, updates);
    
    // Autosave to cloud if online
    if (this.autosaveStatus.isOnline) {
      const workspace = workspaceService.getCurrentWorkspace();
      if (workspace && workspace.id === workspaceId) {
        await this.autosaveWorkspaceToCloud(workspace);
      }
    }
  }

  // Update workspace text with autosave
  async updateWorkspaceText(workspaceId: string, textContent: string): Promise<void> {
    console.log('📝 TEXT UPDATE - Workspace ID:', workspaceId);
    console.log('📝 TEXT UPDATE - New text content length:', textContent.length);
    console.log('📝 TEXT UPDATE - Text preview:', textContent.substring(0, 100) + '...');
    await this.updateWorkspace(workspaceId, { textContent });
  }

  // Update workspace drawing with autosave
  async updateWorkspaceDrawing(workspaceId: string, drawingData: any): Promise<void> {
    console.log('🎨 DRAWING UPDATE - Workspace ID:', workspaceId);
    console.log('🎨 DRAWING UPDATE - Drawing data:', drawingData);
    console.log('🎨 DRAWING UPDATE - Drawing data size:', drawingData ? JSON.stringify(drawingData).length + ' chars' : 'None');
    await this.updateWorkspace(workspaceId, { drawingData });
  }

  // Delete workspace (local + cloud)
  async deleteWorkspace(workspaceId: string): Promise<void> {
    // Delete locally first
    workspaceService.deleteWorkspace(workspaceId);
    
    // Delete from cloud if online
    if (this.autosaveStatus.isOnline) {
      try {
        await firebaseService.deleteWorkspace(workspaceId);
        this.autosaveStatus.lastAutosave = new Date();
      } catch (error) {
        console.error('Error deleting workspace from cloud:', error);
      }
    }
  }

  // Switch workspace
  async switchToWorkspace(workspaceId: string): Promise<Workspace | null> {
    return workspaceService.switchToWorkspace(workspaceId);
  }

  // Get all workspaces (local only for now)
  async getAllWorkspaces(): Promise<Workspace[]> {
    return workspaceService.getAllWorkspaces();
  }

  // Autosave single workspace to cloud
  private async autosaveWorkspaceToCloud(workspace: Workspace): Promise<void> {
    if (!this.autosaveStatus.isOnline || this.autosaveStatus.isAutosaving) {
      return;
    }

    this.autosaveStatus.isAutosaving = true;
    
    try {
      console.log('☁️ ENHANCED SERVICE - Preparing workspace for cloud autosave:', workspace.id);
      console.log('☁️ ENHANCED SERVICE - Local workspace data:', workspace);
      
      const cloudWorkspace: CloudWorkspace = {
        id: workspace.id,
        name: workspace.name,
        textContent: workspace.textContent || '',
        drawingData: workspace.drawingData || null,
        userId: '', // Will be set by Firebase service
        createdAt: Timestamp.fromDate(new Date(workspace.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(workspace.updatedAt))
      };
      
      console.log('☁️ ENHANCED SERVICE - Cloud workspace data prepared:', cloudWorkspace);
      console.log('☁️ ENHANCED SERVICE - Text content preview:', cloudWorkspace.textContent?.substring(0, 100) + '...');
      console.log('☁️ ENHANCED SERVICE - Drawing data size:', cloudWorkspace.drawingData ? JSON.stringify(cloudWorkspace.drawingData).length + ' chars' : 'None');
      
      await firebaseService.autosaveWorkspace(cloudWorkspace);
      this.autosaveStatus.lastAutosave = new Date();
      console.log('☁️ ENHANCED SERVICE - Workspace autosaved successfully');
    } catch (error) {
      console.error('☁️ ENHANCED SERVICE - Error autosaving workspace to cloud:', error);
    } finally {
      this.autosaveStatus.isAutosaving = false;
    }
  }

  // Check connection status
  async checkConnection(): Promise<boolean> {
    this.autosaveStatus.isOnline = await firebaseService.checkConnection();
    return this.autosaveStatus.isOnline;
  }

  // Get current workspace (from local service)
  getCurrentWorkspace(): Workspace | null {
    return workspaceService.getCurrentWorkspace();
  }

  // Get or create default workspace
  async getOrCreateDefaultWorkspace(): Promise<Workspace> {
    return workspaceService.getOrCreateDefaultWorkspace();
  }

  // Rename workspace
  async renameWorkspace(workspaceId: string, newName: string): Promise<void> {
    await this.updateWorkspace(workspaceId, { name: newName });
  }
}

// Export singleton instance
export const enhancedWorkspaceService = new EnhancedWorkspaceService();
export default enhancedWorkspaceService;
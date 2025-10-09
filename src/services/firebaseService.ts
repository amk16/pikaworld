// Firebase service for autosave functionality
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { authService } from './authService';

// Get the same Firebase app instance from authService
const auth = getAuth();
const db = getFirestore();

// TODO: Make it so that the CloudWorkspace can be indexed by userid

export interface CloudWorkspace {
  id: string;
  name: string;
  textContent: string;
  drawingData: string | null;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CloudUser {
  uid: string;
  workspaces: string[]; // Array of workspace IDs
  createdAt: Timestamp;
  lastActive: Timestamp;
}

class FirebaseService {
  private currentUser: User | null = null;
  private isInitialized = false;

  // Initialize Firebase service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize auth service first
      await authService.initialize();
      this.currentUser = authService.getCurrentUser();

      this.setupAuthListener();
      
      if (!this.currentUser) {
        throw new Error('No user authenticated');
      }
      
      console.log('Firebase service initialized with user:', this.currentUser.uid);
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing Firebase service:', error);
      throw error;
    }
  }
  // Add this after the initialize() method in FirebaseService class
private setupAuthListener(): void {
  onAuthStateChanged(auth, (user) => {
    this.currentUser = user;
    if (user) {
      console.log('Firebase service: User signed in:', user.uid);
    } else {
      console.log('Firebase service: User signed out');
    }
  });
}
  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Check if service is ready for autosave
  isReady(): boolean {
    return this.isInitialized && this.currentUser !== null;
  }

  // Autosave workspace to cloud
  async autosaveWorkspace(workspace: CloudWorkspace): Promise<void> {
    if (!this.isReady()) {
      console.log('Firebase not ready for autosave, skipping...');
      return;
    }

    try {
      console.log('🔥 FIREBASE AUTOSAVE - Workspace ID:', workspace.id);
      console.log('🔥 FIREBASE AUTOSAVE - Raw workspace data:', workspace);
      
      const workspaceRef = doc(db, 'workspaces', workspace.id);
      const workspaceData = {
        ...workspace,
        userId: this.currentUser!.uid,
        updatedAt: serverTimestamp()
      };
      
      console.log('🔥 FIREBASE AUTOSAVE - Final data being saved:', workspaceData);
      console.log('🔥 FIREBASE AUTOSAVE - Text content length:', workspaceData.textContent?.length || 0);
      console.log('🔥 FIREBASE AUTOSAVE - Drawing data:', workspaceData.drawingData ? 'Present' : 'None');
      
      await setDoc(workspaceRef, workspaceData, { merge: true });
      
      console.log('🔥 FIREBASE AUTOSAVE - Successfully saved to Firebase:', workspace.id);
    } catch (error) {
      console.error('🔥 FIREBASE AUTOSAVE - Error saving workspace:', error);
      // Don't throw error for autosave - just log it
    }
  }

  // Load all user workspaces from cloud
  async loadUserWorkspaces(): Promise<CloudWorkspace[]> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const workspacesRef = collection(db, 'workspaces');
      const q = query(workspacesRef, where('userId', '==', this.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const workspaces: CloudWorkspace[] = [];
      querySnapshot.forEach((doc) => {
        workspaces.push(doc.data() as CloudWorkspace);
      });
      
      // Sort by updatedAt
      workspaces.sort((a, b) => 
        b.updatedAt.toMillis() - a.updatedAt.toMillis()
      );
      
      return workspaces;
    } catch (error) {
      console.error('Error loading user workspaces:', error);
      throw error;
    }
  }

  // Delete workspace from cloud
  async deleteWorkspace(workspaceId: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const workspaceRef = doc(db, 'workspaces', workspaceId);
      await deleteDoc(workspaceRef);
      
      console.log('Workspace deleted from cloud:', workspaceId);
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }
  }

  // Check connection status
  async checkConnection(): Promise<boolean> {
    try {
      // Simple connectivity test - try to access Firestore
      const testRef = doc(db, 'test', 'connection');
      await setDoc(testRef, { 
        timestamp: serverTimestamp(),
        test: true 
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;

// Firebase service for autosave functionality
import { initializeApp } from 'firebase/app';
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

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIRZdpavne6MFQJmcTKSpQUtnZqmPJgP4",
  authDomain: "pikaworld-67eb3.firebaseapp.com",
  projectId: "pikaworld-67eb3",
  storageBucket: "pikaworld-67eb3.firebasestorage.app",
  messagingSenderId: "20702699625",
  appId: "1:20702699625:web:46095756c3e03c446542f8",
  measurementId: "G-8NPYW5ZJB7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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
      console.log('Autosaving workspace to Firebase:', workspace.id);
      
      const workspaceRef = doc(db, 'workspaces', workspace.id);
      const workspaceData = {
        ...workspace,
        userId: this.currentUser!.uid,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(workspaceRef, workspaceData, { merge: true });
      
      console.log('Workspace autosaved successfully:', workspace.id);
    } catch (error) {
      console.error('Error autosaving workspace:', error);
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

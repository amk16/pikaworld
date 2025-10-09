// Enhanced authentication service with email/password support
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';

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
const auth = getAuth(app);

class AuthService {
  private currentUser: User | null = null;
  private isInitialized = false;

  // Initialize authentication
  async initialize(): Promise<void> {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        
        if (user) {
          console.log('User authenticated:', user.uid, user.isAnonymous ? '(anonymous)' : '(email)');
        } else {
          console.log('No user authenticated - please sign in');
        }
        
        this.isInitialized = true;
        resolve();
      });
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

  // Check if user is anonymous
  isAnonymous(): boolean {
    return this.currentUser?.isAnonymous ?? true;
  }

  // Sign up with email and password
  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      console.log('User signed up:', result.user.uid);
      return result.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in:', result.user.uid);
      return result.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Get user display name
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Guest';
    
    if (this.currentUser.isAnonymous) {
      return 'Anonymous User';
    }
    
    return this.currentUser.displayName || this.currentUser.email || 'User';
  }

  // Get user email
  getUserEmail(): string | null {
    if (!this.currentUser || this.currentUser.isAnonymous) {
      return null;
    }
    
    return this.currentUser.email;
  }

  // Check if service is initialized
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
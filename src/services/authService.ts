// Enhanced authentication service with email/password support
import { 
  getAuth, 
  signInAnonymously, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';

class AuthService {
  private currentUser: User | null = null;
  private isInitialized = false;

  // Initialize authentication
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(getAuth(), async (user) => {
        this.currentUser = user;
        
        if (!user) {
          // No user signed in, sign in anonymously
          try {
            const result = await signInAnonymously(getAuth());
            this.currentUser = result.user;
            console.log('Anonymous user created:', result.user.uid);
          } catch (error) {
            console.error('Error signing in anonymously:', error);
            reject(error);
            return;
          }
        } else {
          console.log('User authenticated:', user.uid, user.isAnonymous ? '(anonymous)' : '(email)');
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
      const result = await createUserWithEmailAndPassword(getAuth(), email, password);
      
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
      const result = await signInWithEmailAndPassword(getAuth(), email, password);
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
      await signOut(getAuth());
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Get user display name
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Anonymous User';
    
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

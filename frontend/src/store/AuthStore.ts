import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loginUser, registerUser, logoutUser } from '../api/Auth';
import { AuthState, LoginCredentials, RegisterCredentials, AuthResponse, IUser } from '../types/AuthTypes';

interface AuthStore extends AuthState {
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    register: (userData: RegisterCredentials) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    updateUserProfile: (updatedUser: Partial<IUser>) => void;
    updateUserFollowing: (userId: string, isFollowing: boolean) => void;
    clearError: () => void;
}

const useAuthStore = create<AuthStore>()(
    persist(
    (set, get) => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,

    login: async (credentials: LoginCredentials) => {
        set({loading: true, error: null});
        try {
            const response = await loginUser(credentials);
            if(response.success) {
                set({
                    user: response.user,
                    isAuthenticated: true,
                    loading: false
                });
                return response
            } else {
                set({error: response.message || 'Login failed', loading: false});
                throw new Error(response.message || 'Login failed');
            }
        }  catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const response = await registerUser(userData);
            if(response.success) {
                set({
                    user: response.user,
                    isAuthenticated: true,
                    loading: false
                });
                return response;
            } else {
                set({ error: response.message || 'Registration failed', loading: false });
                throw new Error(response.message || 'Registration failed');
            }
        }  catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    logout: async () => {
        set({loading: true});
        try {
            await logoutUser();
            set({user: null, isAuthenticated: false, loading: false }); 
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Logout failed';
            set({ error: errorMessage, loading: false });
            set({ user: null, isAuthenticated: false });
        }
    },

    // Optimized update user profile that only changes what's needed
    updateUserProfile: (updatedUser) => {
        const currentUser = get().user;
        if (!currentUser) return;

        // Only update changed fields
        set({ 
            user: { 
                ...currentUser, 
                ...updatedUser
            } 
        });
    },

    // Specialized method for following/unfollowing to minimize re-renders
    updateUserFollowing: (userId: string, isFollowing: boolean) => {
        const currentUser = get().user;
        if (!currentUser) return;

        // Get current following array
        const following = Array.isArray(currentUser.following) 
            ? [...currentUser.following]
            : [];

        // Update following array efficiently
        const updatedFollowing = isFollowing
            ? following.includes(userId) ? following : [...following, userId]
            : following.filter(id => id !== userId);

        // Create a new user object with only the following property updated
        // This minimizes the diff and prevents unnecessary re-renders
        set(state => ({
            user: {
                ...state.user,
                following: updatedFollowing
            } as IUser
        }));
    },

    clearError: () => set({error: null})

}), {
        name: 'auth-storage', // numele pentru localStorage
        storage: createJSONStorage(() => localStorage)
    }
    )
)

export default useAuthStore;
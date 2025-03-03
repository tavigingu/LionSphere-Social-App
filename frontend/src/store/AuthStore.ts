import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loginUser, registerUser, logoutUser } from '../api/Auth';
import { AuthState, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/AuthTypes';


interface AuthStore extends AuthState {
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    register: (userData: RegisterCredentials) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const useAuthStore = create<AuthStore>()(
    persist(
    (set) => ({
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

    clearError: () => set({error: null})

}), {
        name: 'auth-storage', // numele pentru localStorage
        storage: createJSONStorage(() => localStorage)
    }
    )
)

export default useAuthStore;


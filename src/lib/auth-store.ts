/**
 * 璁よ瘉鐘舵€佺鐞?Store
 * 浣跨敤 Zustand 绠＄悊鐢ㄦ埛璁よ瘉鐘舵€?
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from './api-auth';
import { getToken, removeToken } from './api-config';
import * as authApi from './api-auth';

// ==========================================
// 绫诲瀷瀹氫箟
// ==========================================

interface AuthState {
  // 鐘舵€?
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (data: authApi.RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearUser: () => void;
}

// ==========================================
// Store
// ==========================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 鍒濆鐘舵€?
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // 鐧诲綍
      login: async (login: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await authApi.login({ login, password });

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // 娉ㄥ唽
      register: async (data: authApi.RegisterRequest) => {
        set({ isLoading: true });

        try {
          const response = await authApi.register(data);

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // 鐧诲嚭
      logout: async () => {
        set({ isLoading: true });

        try {
          await authApi.logout();
        } catch (error) { /* ignore */ } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // 鍔犺浇鐢ㄦ埛淇℃伅
      loadUser: async () => {
        const token = getToken();

        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        set({ isLoading: true });

        try {
          const user = await authApi.getCurrentUser();

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Load user error:', error);
          removeToken();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // 娓呴櫎鐢ㄦ埛淇℃伅
      clearUser: () => {
        removeToken();
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        // 鍙寔涔呭寲鐢ㄦ埛淇℃伅鍜岃璇佺姸鎬?
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


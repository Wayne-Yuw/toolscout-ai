/**
 * 认证相关 API 请求函数
 */
import axios from 'axios';
import { API_BASE_URL, getAuthHeader, saveToken, removeToken } from './api-config';

// ==========================================
// 类型定义
// ==========================================

export interface RegisterRequest {
  username: string;
  phone: string;
  password: string;
  email?: string;
  nickname?: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface UserResponse {
  id: string;
  username: string;
  phone: string;
  phone_verified: boolean;
  email?: string;
  email_verified: boolean;
  nickname?: string;
  avatar_url?: string;
  bio?: string;
  membership_level: 'free' | 'basic' | 'pro' | 'enterprise';
  membership_expire_at?: string;
  total_analysis_count: number;
  total_script_count: number;
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  last_login_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
}

export interface MessageResponse {
  message: string;
  code: number;
}

export interface ApiError {
  detail: string;
}

// ==========================================
// API 请求函数
// ==========================================

/**
 * 用户注册
 */
export async function register(data: RegisterRequest): Promise<TokenResponse> {
  try {
    const response = await axios.post<TokenResponse>(
      `${API_BASE_URL}/auth/register`,
      data
    );

    // 保存 token
    saveToken(response.data.access_token);

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiError;
      throw new Error(apiError.detail || '注册失败');
    }
    throw new Error('网络错误，请稍后重试');
  }
}

/**
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<TokenResponse> {
  try {
    const response = await axios.post<TokenResponse>(
      `${API_BASE_URL}/auth/login`,
      data
    );

    // 保存 token
    saveToken(response.data.access_token);

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiError;
      throw new Error(apiError.detail || '登录失败');
    }
    throw new Error('网络错误，请稍后重试');
  }
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  try {
    await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
  } catch (_error) {
    // 忽略；后端无法使 JWT 失效，删除本地 token 即可
  } finally {
    removeToken();
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<UserResponse> {
  try {
    const response = await axios.get<UserResponse>(
      `${API_BASE_URL}/auth/me`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      removeToken();
      throw new Error('请先登录');
    }
    throw new Error('获取用户信息失败');
  }
}

/**
 * 验证 Token 是否有效
 */
export async function verifyToken(): Promise<UserResponse> {
  try {
    const response = await axios.get<UserResponse>(
      `${API_BASE_URL}/auth/verify`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (_error) {
    removeToken();
    throw new Error('Token invalid');
  }
}

/**
 * 修改密码
 */
export async function changePassword(data: PasswordChangeRequest): Promise<MessageResponse> {
  try {
    const response = await axios.post<MessageResponse>(
      `${API_BASE_URL}/auth/change-password`,
      data,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiError;
      throw new Error(apiError.detail || '修改密码失败');
    }
    throw new Error('网络错误，请稍后重试');
  }
}

/**
 * 检查用户名是否可用
 */
export async function checkUsername(username: string): Promise<boolean> {
  try {
    const response = await axios.get<MessageResponse>(
      `${API_BASE_URL}/auth/check-username/${username}`
    );

    return response.data.code === 0;
  } catch (_error) {
    return false;
  }
}

/**
 * 检查手机号是否可用
 */
export async function checkPhone(phone: string): Promise<boolean> {
  try {
    const response = await axios.get<MessageResponse>(
      `${API_BASE_URL}/auth/check-phone/${phone}`
    );

    return response.data.code === 0;
  } catch (_error) {
    return false;
  }
}

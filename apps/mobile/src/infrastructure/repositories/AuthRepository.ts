/**
 * Auth Repository Implementation
 * Implements IAuthRepository using the HTTP client
 */

import { API_ENDPOINTS } from "../../config/api";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import {
  AuthSyncResponse,
  AuthMeResponse,
  AuthNonceResponse,
  AuthVerifyResponse,
} from "../../domain/dto/auth.dto";
import { getApiClient } from "../http/ApiClient";

export class AuthRepository implements IAuthRepository {
  async syncUser(): Promise<AuthSyncResponse> {
    return getApiClient().post<AuthSyncResponse>(API_ENDPOINTS.AUTH.SYNC);
  }

  async getMe(): Promise<AuthMeResponse> {
    return getApiClient().get<AuthMeResponse>(API_ENDPOINTS.AUTH.ME);
  }

  async getNonce(): Promise<AuthNonceResponse> {
    return getApiClient().get<AuthNonceResponse>(API_ENDPOINTS.AUTH.NONCE);
  }

  async verifyAuth(): Promise<AuthVerifyResponse> {
    return getApiClient().get<AuthVerifyResponse>(API_ENDPOINTS.AUTH.VERIFY);
  }
}

// Singleton instance
let authRepositoryInstance: AuthRepository | null = null;

export function getAuthRepository(): IAuthRepository {
  if (!authRepositoryInstance) {
    authRepositoryInstance = new AuthRepository();
  }
  return authRepositoryInstance;
}

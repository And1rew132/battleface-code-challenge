import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ApiConfig } from '../../core/config/api.config';
import { AuthApiService, LoginRequest } from './auth-api.service';

describe('AuthApiService', () => {
  const config: ApiConfig = { apiBaseUrl: '/api' };

  it('posts login credentials with browser credentials enabled', () => {
    const payload: LoginRequest = {
      email: 'demo@battleface.test',
      password: 'local-test-password',
    };
    const http = {
      post: vi.fn().mockReturnValue(of(undefined)),
    } as unknown as HttpClient;

    new AuthApiService(config, http).login(payload).subscribe();

    expect(http.post).toHaveBeenCalledWith('/api/auth/login', payload, {
      withCredentials: true,
    });
  });

  it('posts logout with browser credentials enabled', () => {
    const http = {
      post: vi.fn().mockReturnValue(of(undefined)),
    } as unknown as HttpClient;

    new AuthApiService(config, http).logout().subscribe();

    expect(http.post).toHaveBeenCalledWith(
      '/api/auth/logout',
      {},
      {
        withCredentials: true,
      },
    );
  });
});

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG, ApiConfig } from '../../core/config/api.config';

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(
    @Inject(API_CONFIG) private readonly config: ApiConfig,
    private readonly http: HttpClient,
  ) {}

  login(payload: LoginRequest): Observable<void> {
    return this.http.post<void>(`${this.config.apiBaseUrl}/auth/login`, payload, {
      withCredentials: true,
    });
  }

  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.config.apiBaseUrl}/auth/logout`,
      {},
      { withCredentials: true },
    );
  }
}

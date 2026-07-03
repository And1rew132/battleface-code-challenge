import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  apiBaseUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('api.config');

export const apiConfig: ApiConfig = {
  apiBaseUrl: '',
};

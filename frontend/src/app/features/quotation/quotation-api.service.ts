import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG, ApiConfig } from '../../core/config/api.config';

export type Currency = 'EUR' | 'GBP' | 'USD';

export interface QuotationRequest {
  age: string;
  currency_id: Currency;
  start_date: string;
  end_date: string;
}

export interface QuotationResponse {
  total: string;
  currency_id: Currency;
  quotation_id: string;
}

export interface ApiValidationError {
  message?: string;
  errors?: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
export class QuotationApiService {
  constructor(
    @Inject(API_CONFIG) private readonly config: ApiConfig,
    private readonly http: HttpClient,
  ) {}

  createQuote(payload: QuotationRequest): Observable<QuotationResponse> {
    return this.http.post<QuotationResponse>(`${this.config.apiBaseUrl}/quotation`, payload, {
      withCredentials: true,
    });
  }

  errorMessage(response: HttpErrorResponse): string {
    const body = response.error as ApiValidationError | null;

    if (body?.errors) {
      return Object.values(body.errors).flat().join(' ');
    }

    if (body?.message) {
      return body.message;
    }

    if (response.status === 0) {
      return 'Unable to reach the quotation API.';
    }

    return 'The quotation could not be calculated.';
  }
}

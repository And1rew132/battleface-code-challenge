import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ApiConfig } from '../../core/config/api.config';
import { QuotationApiService, QuotationRequest } from './quotation-api.service';

describe('QuotationApiService', () => {
  const config: ApiConfig = { apiBaseUrl: '/api' };

  it('posts quotation requests with browser credentials enabled', () => {
    const payload: QuotationRequest = {
      age: '28,35',
      currency_id: 'EUR',
      start_date: '2026-10-01',
      end_date: '2026-10-30',
    };
    const http = {
      post: vi.fn().mockReturnValue(of({ total: '117.00', currency_id: 'EUR', quotation_id: 'id' })),
    } as unknown as HttpClient;

    new QuotationApiService(config, http).createQuote(payload).subscribe();

    expect(http.post).toHaveBeenCalledWith('/api/quotation', payload, {
      withCredentials: true,
    });
  });

  it('flattens validation errors into a single message', () => {
    const service = new QuotationApiService(config, {} as HttpClient);
    const response = new HttpErrorResponse({
      status: 422,
      error: {
        errors: {
          currency_id: ['The selected currency is invalid.'],
          end_date: ['The end date must be after or equal to start date.'],
        },
      },
    });

    expect(service.errorMessage(response)).toBe(
      'The selected currency is invalid. The end date must be after or equal to start date.',
    );
  });

  it('uses API messages, network fallback, and generic fallback in that order', () => {
    const service = new QuotationApiService(config, {} as HttpClient);

    expect(
      service.errorMessage(
        new HttpErrorResponse({
          status: 401,
          error: { message: 'Unauthenticated.' },
        }),
      ),
    ).toBe('Unauthenticated.');

    expect(service.errorMessage(new HttpErrorResponse({ status: 0 }))).toBe(
      'Unable to reach the quotation API.',
    );

    expect(service.errorMessage(new HttpErrorResponse({ status: 500 }))).toBe(
      'The quotation could not be calculated.',
    );
  });
});

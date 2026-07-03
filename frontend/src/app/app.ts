import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { finalize } from 'rxjs';
import { AuthApiService, LoginRequest } from './features/auth/auth-api.service';
import { LoginForm } from './features/auth/components/login-form/login-form';
import { QuotationForm } from './features/quotation/components/quotation-form/quotation-form';
import { QuoteResult } from './features/quotation/components/quote-result/quote-result';
import {
  Currency,
  QuotationApiService,
  QuotationRequest,
  QuotationResponse,
} from './features/quotation/quotation-api.service';

@Component({
  selector: 'app-root',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
    MatToolbarModule,
    LoginForm,
    QuotationForm,
    QuoteResult,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly authApi = inject(AuthApiService);
  private readonly quotationApi = inject(QuotationApiService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly currencies = ['EUR', 'GBP', 'USD'] as const;
  protected readonly authenticated = signal(localStorage.getItem('battleface-authenticated') === 'true');
  protected readonly authLoading = signal(false);
  protected readonly loading = signal(false);
  protected readonly quote = signal<QuotationResponse | null>(null);
  protected readonly error = signal<string | null>(null);

  protected login(payload: LoginRequest): void {
    if (this.authLoading()) {
      return;
    }

    this.authLoading.set(true);
    this.error.set(null);

    this.authApi
      .login(payload)
      .pipe(finalize(() => this.authLoading.set(false)))
      .subscribe({
        next: () => {
          localStorage.setItem('battleface-authenticated', 'true');
          this.authenticated.set(true);
        },
        error: (response) => {
          const message = this.quotationApi.errorMessage(response);
          this.error.set(message);
        },
      });
  }

  protected logout(): void {
    if (this.authLoading()) {
      return;
    }

    this.authLoading.set(true);

    this.authApi
      .logout()
      .pipe(finalize(() => this.authLoading.set(false)))
      .subscribe({
        next: () => this.clearSession(),
        error: () => this.clearSession(),
      });
  }

  protected submit(payload: QuotationRequest): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.quote.set(null);

    this.quotationApi
      .createQuote(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (quote) => this.quote.set(quote),
        error: (response) => {
          const message = this.quotationApi.errorMessage(response);
          if (response.status === 401) {
            this.clearSession();
          }
          this.error.set(message);
          this.snackBar.open(message, 'Dismiss', { duration: 5000 });
        },
      });
  }

  private clearSession(): void {
    localStorage.removeItem('battleface-authenticated');
    this.authenticated.set(false);
    this.quote.set(null);
  }
}

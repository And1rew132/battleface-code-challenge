import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorBanner } from '../../../../shared/components/error-banner/error-banner';
import { LoginRequest } from '../../auth-api.service';

@Component({
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ErrorBanner,
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  private readonly fb = inject(FormBuilder);

  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly login = output<LoginRequest>();

  protected readonly form = this.fb.nonNullable.group({
    email: ['demo@battleface.test', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected submit(): void {
    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.login.emit(this.form.getRawValue());
  }
}

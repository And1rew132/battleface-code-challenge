import { Component, ViewChild, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatCalendar,
  DateRange,
  MatCalendarCellClassFunction,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ErrorBanner } from '../../../../shared/components/error-banner/error-banner';
import { Currency, QuotationRequest } from '../../quotation-api.service';
import { dateRangeValidator } from '../../quotation-form.validators';

@Component({
  selector: 'app-quotation-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ErrorBanner,
  ],
  templateUrl: './quotation-form.html',
  styleUrl: './quotation-form.scss',
})
export class QuotationForm {
  private readonly fb = inject(FormBuilder);
  private readonly initialStartDate = this.parseDate('2026-10-01');
  private readonly initialEndDate = this.parseDate('2026-10-30');

  @ViewChild(MatCalendar) private calendar?: MatCalendar<Date>;

  readonly currencies = input<readonly Currency[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly quotation = output<QuotationRequest>();

  protected readonly form = this.fb.nonNullable.group(
    {
      ages: this.fb.array([this.ageControl(28), this.ageControl(35)]),
      currency_id: ['EUR' as Currency, [Validators.required]],
      start_date: ['2026-10-01', [Validators.required]],
      end_date: ['2026-10-30', [Validators.required]],
    },
    { validators: [dateRangeValidator] },
  );

  protected readonly selectedRange = signal(
    new DateRange<Date>(this.initialStartDate, this.initialEndDate),
  );

  protected readonly dateRangeLabel = computed(() => {
    const range = this.selectedRange();

    if (!range.start) {
      return 'Select a start date.';
    }

    if (!range.end) {
      return `${this.formatDisplayDate(range.start)} - select an end date.`;
    }

    return `${this.formatDisplayDate(range.start)} - ${this.formatDisplayDate(range.end)}`;
  });

  protected readonly dateClass: MatCalendarCellClassFunction<Date> = (date, view) => {
    if (view !== 'month') {
      return '';
    }

    const range = this.selectedRange();
    const time = this.dateOnlyTime(date);
    const start = range.start ? this.dateOnlyTime(range.start) : null;
    const end = range.end ? this.dateOnlyTime(range.end) : null;

    if (start === null) {
      return '';
    }

    const classes = [];

    if (time === start) {
      classes.push('range-start');
    }

    if (end !== null && time === end) {
      classes.push('range-end');
    }

    if (end !== null && time > start && time < end) {
      classes.push('in-range');
    }

    return classes.join(' ');
  };

  protected get ages() {
    return this.form.controls.ages;
  }

  protected addAge(): void {
    this.ages.push(this.ageControl(30));
    this.ages.markAsDirty();
  }

  protected removeAge(index: number): void {
    if (this.ages.length === 1) {
      return;
    }

    this.ages.removeAt(index);
    this.ages.markAsDirty();
  }

  protected selectDate(date: Date | null): void {
    if (!date) {
      return;
    }

    const current = this.selectedRange();
    const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const next =
      !current.start || current.end || selected < current.start
        ? new DateRange<Date>(selected, null)
        : new DateRange<Date>(current.start, selected);

    this.selectedRange.set(next);
    this.form.controls.start_date.setValue(next.start ? this.formatApiDate(next.start) : '');
    this.form.controls.end_date.setValue(next.end ? this.formatApiDate(next.end) : '');
    this.form.controls.start_date.markAsTouched();
    this.form.controls.end_date.markAsTouched();
    this.form.updateValueAndValidity();
    this.calendar?.updateTodaysDate();
  }

  protected submit(): void {
    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { ages, ...payload } = this.form.getRawValue();

    this.quotation.emit({
      ...payload,
      age: ages.join(','),
    });
  }

  private ageControl(age: number) {
    return this.fb.nonNullable.control(age, [
      Validators.required,
      Validators.min(18),
      Validators.max(70),
    ]);
  }

  private parseDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  private formatApiDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatDisplayDate(date: Date): string {
    return new Intl.DateTimeFormat('en', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private dateOnlyTime(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }
}

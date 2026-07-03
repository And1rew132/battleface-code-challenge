import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startDate = control.get('start_date')?.value;
  const endDate = control.get('end_date')?.value;

  if (!startDate || !endDate) {
    return null;
  }

  return endDate >= startDate ? null : { dateRange: true };
};

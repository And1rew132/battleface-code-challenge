import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { dateRangeValidator } from './quotation-form.validators';

function form(startDate: string, endDate: string): FormGroup {
  return new FormGroup(
    {
      start_date: new FormControl(startDate),
      end_date: new FormControl(endDate),
    },
    { validators: dateRangeValidator },
  );
}

describe('dateRangeValidator', () => {
  it('accepts an end date on or after the start date', () => {
    expect(form('2026-10-01', '2026-10-01').errors).toBeNull();
    expect(form('2026-10-01', '2026-10-30').errors).toBeNull();
  });

  it('rejects an end date before the start date', () => {
    expect(form('2026-10-30', '2026-10-01').errors).toEqual({ dateRange: true });
  });

  it('allows required validators to handle missing dates', () => {
    expect(form('', '2026-10-01').errors).toBeNull();
    expect(form('2026-10-01', '').errors).toBeNull();
  });
});

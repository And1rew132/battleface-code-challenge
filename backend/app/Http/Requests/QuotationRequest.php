<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuotationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_int($this->age) || is_float($this->age)) {
            $this->merge(['age' => (string) $this->age]);
        }
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'age' => ['required', 'string', 'regex:/^\s*\d+\s*(,\s*\d+\s*)*$/'],
            'currency_id' => ['required', 'string', Rule::in(config('quotation.currencies'))],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:start_date'],
        ];
    }

    /**
     * @return array<int, int>
     */
    public function ages(): array
    {
        return collect(explode(',', $this->validated('age')))
            ->map(fn (string $age): int => (int) trim($age))
            ->all();
    }
}

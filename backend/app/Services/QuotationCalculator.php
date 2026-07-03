<?php

namespace App\Services;

use App\Exceptions\UnsupportedAgeException;
use Carbon\CarbonImmutable;

class QuotationCalculator
{
    /**
     * @param  array<string, float|int|string>  $currencyRates
     */
    public function __construct(
        private readonly float $fixedRate = 3.0,
        private readonly array $currencyRates = [
            'EUR' => 1.0,
            'GBP' => 0.86,
            'USD' => 1.09,
        ],
    ) {}

    private function ageLoad(int $age): float
    {
        return match (true) {
            $age >= 18 && $age <= 30 => 0.6,
            $age >= 31 && $age <= 40 => 0.7,
            $age >= 41 && $age <= 50 => 0.8,
            $age >= 51 && $age <= 60 => 0.9,
            $age >= 61 && $age <= 70 => 1.0,
            default => throw new UnsupportedAgeException($age),
        };
    }

    /**
     * @param  array<int, int>  $ages
     */
    public function total(array $ages, string $startDate, string $endDate, string $currency = 'EUR'): string
    {
        $tripLength = CarbonImmutable::createFromFormat('Y-m-d', $startDate)
            ->diffInDays(CarbonImmutable::createFromFormat('Y-m-d', $endDate)) + 1;

        $total = array_reduce(
            $ages,
            fn (float $carry, int $age): float => $carry + ($this->fixedRate * $this->ageLoad($age) * $tripLength),
            0.0,
        );

        $convertedTotal = $total * (float) ($this->currencyRates[$currency] ?? 1.0);

        return number_format($convertedTotal, 2, '.', '');
    }
}

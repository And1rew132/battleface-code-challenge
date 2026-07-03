<?php

namespace Tests\Unit;

use App\Exceptions\UnsupportedAgeException;
use App\Services\QuotationCalculator;
use PHPUnit\Framework\TestCase;

class QuotationCalculatorTest extends TestCase
{
    public function test_it_calculates_the_worked_example(): void
    {
        $this->assertSame(
            '117.00',
            $this->calculator()->total([28, 35], '2026-10-01', '2026-10-30'),
        );
    }

    public function test_it_uses_inclusive_trip_dates(): void
    {
        $this->assertSame(
            '1.80',
            $this->calculator()->total([18], '2026-10-01', '2026-10-01'),
        );
    }

    public function test_it_converts_the_total_to_the_requested_currency(): void
    {
        $this->assertSame(
            '127.53',
            $this->calculator()->total([28, 35], '2026-10-01', '2026-10-30', 'USD'),
        );
    }

    public function test_it_calculates_each_age_band_boundary(): void
    {
        $this->assertSame(
            '24.00',
            $this->calculator()->total([18, 30, 31, 40, 41, 50, 51, 60, 61, 70], '2026-10-01', '2026-10-01'),
        );
    }

    public function test_it_rejects_unsupported_ages(): void
    {
        $this->expectException(UnsupportedAgeException::class);

        $this->calculator()->total([17], '2026-10-01', '2026-10-01');
    }

    private function calculator(): QuotationCalculator
    {
        return new QuotationCalculator;
    }
}

<?php

namespace App\Providers;

use App\Services\QuotationCalculator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(QuotationCalculator::class, function (): QuotationCalculator {
            return new QuotationCalculator(
                currencyRates: config('quotation.currency_rates', []),
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

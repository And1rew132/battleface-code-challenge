<?php

return [
    'currencies' => ['EUR', 'GBP', 'USD'],
    'currency_rates' => [
        'EUR' => (float) env('QUOTATION_EUR_RATE', 1.0),
        'GBP' => (float) env('QUOTATION_GBP_RATE', 0.86),
        'USD' => (float) env('QUOTATION_USD_RATE', 1.09),
    ],
    'jwt_secret' => env('QUOTATION_JWT_SECRET'),
    'jwt_ttl_minutes' => env('QUOTATION_JWT_TTL_MINUTES', 60),
    'cookie' => [
        'name' => env('QUOTATION_COOKIE_NAME', 'battleface_token'),
        'secure' => (bool) env('QUOTATION_COOKIE_SECURE', true),
    ],
    'demo_user' => [
        'email' => env('QUOTATION_DEMO_EMAIL'),
        'password' => env('QUOTATION_DEMO_PASSWORD'),
    ],
];

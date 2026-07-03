<?php

namespace Tests\Feature;

use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use Tests\TestCase;

class QuotationEndpointTest extends TestCase
{
    private const DEMO_EMAIL = 'demo@battleface.test';
    private const DEMO_PASSWORD = 'phpunit-only-demo-password';

    protected function setUp(): void
    {
        parent::setUp();

        Artisan::call('migrate:fresh', ['--seed' => true]);
    }

    public function test_it_signs_in_and_uses_the_jwt_cookie_for_quotes(): void
    {
        $login = $this->postJson('/auth/login', [
            'email' => self::DEMO_EMAIL,
            'password' => self::DEMO_PASSWORD,
        ]);

        $login
            ->assertOk()
            ->assertCookie(config('quotation.cookie.name'));

        $response = $this
            ->withCredentials()
            ->withUnencryptedCookie(config('quotation.cookie.name'), $login->getCookie(config('quotation.cookie.name'), false)->getValue())
            ->postJson('/quotation', [
                'age' => '28,35',
                'currency_id' => 'EUR',
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-30',
            ]);

        $response
            ->assertOk()
            ->assertJson([
                'total' => '117.00',
                'currency_id' => 'EUR',
            ]);
    }

    public function test_it_rejects_invalid_demo_credentials(): void
    {
        $this->postJson('/auth/login', [
            'email' => self::DEMO_EMAIL,
            'password' => 'wrong',
        ])
            ->assertUnauthorized()
            ->assertJson(['message' => 'Invalid credentials.']);
    }

    public function test_it_clears_the_jwt_cookie_on_logout(): void
    {
        $this->postJson('/auth/logout')
            ->assertOk()
            ->assertCookieExpired(config('quotation.cookie.name'));
    }

    public function test_it_returns_the_worked_example_quote(): void
    {
        $response = $this
            ->withToken($this->jwt())
            ->postJson('/quotation', [
                'age' => '28,35',
                'currency_id' => 'EUR',
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-30',
            ]);

        $response
            ->assertOk()
            ->assertJson([
                'total' => '117.00',
                'currency_id' => 'EUR',
            ]);

        $this->assertTrue(Str::isUuid($response->json('quotation_id')));
    }

    public function test_it_accepts_a_single_numeric_age(): void
    {
        $this
            ->withToken($this->jwt())
            ->postJson('/quotation', [
                'age' => 28,
                'currency_id' => 'EUR',
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-30',
            ])
            ->assertOk()
            ->assertJson([
                'total' => '54.00',
                'currency_id' => 'EUR',
            ]);
    }

    public function test_it_converts_the_quote_total_to_the_requested_currency(): void
    {
        $this
            ->withToken($this->jwt())
            ->postJson('/quotation', [
                'age' => '28,35',
                'currency_id' => 'USD',
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-30',
            ])
            ->assertOk()
            ->assertJson([
                'total' => '127.53',
                'currency_id' => 'USD',
            ]);
    }

    public function test_it_rejects_missing_or_invalid_tokens(): void
    {
        $this->postJson('/quotation', [])
            ->assertUnauthorized()
            ->assertJson(['message' => 'Unauthenticated.']);

        $this->withToken('wrong-token')->postJson('/quotation', [])
            ->assertUnauthorized()
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_it_validates_required_inputs(): void
    {
        $this
            ->withToken($this->jwt())
            ->postJson('/quotation', [
                'age' => '28,35',
                'currency_id' => 'AUD',
                'start_date' => '2026-10-30',
                'end_date' => '2026-10-01',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['currency_id', 'end_date']);
    }

    public function test_it_rejects_ages_outside_supported_load_bands(): void
    {
        $this
            ->withToken($this->jwt())
            ->postJson('/quotation', [
                'age' => '17,71',
                'currency_id' => 'USD',
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-01',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['age']);
    }

    private function jwt(): string
    {
        return JWT::encode([
            'iss' => 'battleface-code-challenge',
            'iat' => now()->timestamp,
            'exp' => now()->addHour()->timestamp,
        ], config('quotation.jwt_secret'), 'HS256');
    }
}

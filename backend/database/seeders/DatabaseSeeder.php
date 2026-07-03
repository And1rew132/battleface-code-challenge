<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('quotation.demo_user.email');
        $password = config('quotation.demo_user.password');

        if (! is_string($email) || $email === '' || ! is_string($password) || $password === '') {
            throw new RuntimeException('QUOTATION_DEMO_EMAIL and QUOTATION_DEMO_PASSWORD must be configured before seeding users.');
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'BattleFace Demo User',
                'password' => Hash::make($password),
            ],
        );
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $jwtSecret = config('quotation.jwt_secret');

        if (! is_string($jwtSecret) || $jwtSecret === '') {
            return response()->json([
                'message' => 'Quotation API JWT secret is not configured.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->where('email', $credentials['email'])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $token = JWT::encode([
            'iss' => 'battleface-code-challenge',
            'sub' => (string) $user->id,
            'email' => $user->email,
            'iat' => now()->timestamp,
            'exp' => now()->addMinutes(config('quotation.jwt_ttl_minutes'))->timestamp,
        ], $jwtSecret, 'HS256');

        return response()
            ->json(['message' => 'Signed in.'])
            ->cookie(
                config('quotation.cookie.name'),
                $token,
                config('quotation.jwt_ttl_minutes'),
                '/',
                null,
                config('quotation.cookie.secure'),
                true,
                false,
                'Lax',
            );
    }

    public function logout(): JsonResponse
    {
        return response()
            ->json(['message' => 'Signed out.'])
            ->withoutCookie(config('quotation.cookie.name'));
    }
}

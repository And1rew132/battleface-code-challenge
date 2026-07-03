<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class EnsureValidJwtToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $jwtSecret = config('quotation.jwt_secret');
        $providedToken = $request->bearerToken() ?: $request->cookie(config('quotation.cookie.name'));

        if (! is_string($jwtSecret) || $jwtSecret === '') {
            return new JsonResponse([
                'message' => 'Quotation API JWT secret is not configured.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        if (! is_string($providedToken) || $providedToken === '') {
            return new JsonResponse([
                'message' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        try {
            JWT::decode($providedToken, new Key($jwtSecret, 'HS256'));
        } catch (Throwable) {
            return new JsonResponse([
                'message' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}

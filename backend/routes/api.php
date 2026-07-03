<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuotationController;
use App\Http\Middleware\EnsureValidJwtToken;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::post('/quotation', QuotationController::class)
    ->middleware(EnsureValidJwtToken::class);

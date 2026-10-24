<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NewsController;

// ─── Auth — Google SSO ────────────────────────────────────────────────────────
Route::get('/auth/google',          [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// ─── Auth — Protected ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me',     [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// ─── News — Public endpoints ──────────────────────────────────────────────────
Route::get('/news',       [NewsController::class, 'index']);
Route::get('/news/{id}',  [NewsController::class, 'show']);

// ─── News — Protected endpoints ───────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/news',          [NewsController::class, 'store']);
    Route::put('/news/{id}',      [NewsController::class, 'update']);
    Route::delete('/news/{id}',   [NewsController::class, 'destroy']);
});

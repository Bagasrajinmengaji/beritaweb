<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NewsController;

// ─── Auth — Public ─────────────────────────────────────────────────────────────
Route::post('/login',               [AuthController::class, 'login']);
Route::get('/auth/google',          [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// ─── Auth — Protected ─────────────────────────────────────────────────────────
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me',      [AuthController::class, 'me']);
});

// ─── News — Public endpoints ──────────────────────────────────────────────────
Route::get('/news',       [NewsController::class, 'index']);
Route::get('/news/{id}',  [NewsController::class, 'show']);

// ─── News — Protected endpoints (auth:sanctum) ────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/news',                             [NewsController::class, 'store']);
    Route::match(['put', 'patch'], '/news/{id}',     [NewsController::class, 'update']);
    Route::post('/news/{id}',                        [NewsController::class, 'update']); // Untuk multipart/form-data update dengan file
    Route::delete('/news/{id}',                      [NewsController::class, 'destroy']);
});

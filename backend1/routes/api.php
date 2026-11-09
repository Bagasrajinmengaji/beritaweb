<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CompetitionController;
use App\Http\Controllers\CustomerServiceController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\StudyProgramController;

// ─── Auth — Public ─────────────────────────────────────────────────────────────
Route::post('/register',             [AuthController::class, 'register']);
Route::post('/login',                [AuthController::class, 'login']);
Route::get('/auth/google',           [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback',  [AuthController::class, 'handleGoogleCallback']);

// ─── Auth — Protected ─────────────────────────────────────────────────────────
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
});

// ─── Kategori & Program Studi — Public ─────────────────────────────────────────
Route::get('/categories',      [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/study-programs',  [StudyProgramController::class, 'index']);
Route::get('/study-programs/{slug}', [StudyProgramController::class, 'show']);

// ─── Kompetisi / Lomba — Public (Hanya yang status 'approved') ────────────────
Route::get('/competitions',        [CompetitionController::class, 'index']);
Route::get('/competitions/{slug}', [CompetitionController::class, 'show']);

// ─── Kompetisi / Lomba — Protected User (auth:sanctum) ────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/competitions',                             [CompetitionController::class, 'store']);
    Route::get('/my/competitions',                           [CompetitionController::class, 'myCompetitions']);
    Route::get('/my/competitions/{id}',                      [CompetitionController::class, 'myShow']);
    Route::match(['put', 'patch'], '/competitions/{id}',     [CompetitionController::class, 'update']);
    Route::post('/competitions/{id}',                        [CompetitionController::class, 'update']); // Untuk multipart update
    Route::delete('/competitions/{id}',                      [CompetitionController::class, 'destroy']);
});

// ─── News — Legacy Public & Protected (Tetap dipertahankan) ───────────────────
Route::get('/news',       [NewsController::class, 'index']);
Route::get('/news/{id}',  [NewsController::class, 'show']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/news',                             [NewsController::class, 'store']);
    Route::match(['put', 'patch'], '/news/{id}',     [NewsController::class, 'update']);
    Route::post('/news/{id}',                        [NewsController::class, 'update']);
    Route::delete('/news/{id}',                      [NewsController::class, 'destroy']);
});

// ─── Customer Service & Chat ──────────────────────────────────────────────────
Route::get('/cs/messages',                 [CustomerServiceController::class, 'index']);
Route::post('/cs/messages',                [CustomerServiceController::class, 'store']);
Route::post('/cs/mark-as-read',            [CustomerServiceController::class, 'markAsRead']);
Route::delete('/cs/messages/{id}',         [CustomerServiceController::class, 'destroy'])->middleware('auth:sanctum');
Route::delete('/cs/sessions/{sessionId}',  [CustomerServiceController::class, 'destroySession'])->middleware('auth:sanctum');
Route::delete('/cs/clear-all',             [CustomerServiceController::class, 'clearAll'])->middleware('auth:sanctum');

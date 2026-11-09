<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminCompetitionController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminStudyProgramController;
use App\Http\Controllers\Admin\AdminNewsController;
use App\Http\Controllers\Admin\AdminCustomerServiceController;

/*
|--------------------------------------------------------------------------
| Web Routes (Laravel Backend)
|--------------------------------------------------------------------------
| Rute web dikhususkan untuk Panel Administrator UMPKU Surakarta.
*/

// Root URL Backend (http://localhost:8000) otomatis mengarahkan ke Admin Panel Backend
Route::get('/', function () {
    return redirect()->route('admin.dashboard');
});

// ─── Admin Authentication (Guest Only) ───────────────────────────────────────
Route::prefix('admin')->group(function () {
    Route::get('/login',   [AdminAuthController::class, 'showLoginForm'])->name('admin.login');
    Route::post('/login',  [AdminAuthController::class, 'login'])->name('admin.login.submit');
    Route::post('/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');
});

// ─── Admin Protected Panel (Membutuhkan role 'admin') ─────────────────────────
Route::prefix('admin')->middleware(['admin'])->group(function () {
    // Dashboard Ringkasan
    Route::get('/',          [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    // Manajemen & Moderasi Lomba
    Route::resource('competitions', AdminCompetitionController::class, ['as' => 'admin']);
    Route::post('competitions/{id}/approve', [AdminCompetitionController::class, 'approve'])->name('admin.competitions.approve');
    Route::post('competitions/{id}/reject',  [AdminCompetitionController::class, 'reject'])->name('admin.competitions.reject');

    // Master Data Kategori Lomba
    Route::resource('categories', AdminCategoryController::class, ['as' => 'admin'])->except(['create', 'show', 'edit']);

    // Master Data Program Studi UMPKU Surakarta
    Route::resource('study-programs', AdminStudyProgramController::class, ['as' => 'admin'])->except(['create', 'show', 'edit']);
    Route::post('study-programs/{id}/toggle', [AdminStudyProgramController::class, 'toggleActive'])->name('admin.study-programs.toggle');

    // Customer Service & Chat
    Route::get('/cs',                        [AdminCustomerServiceController::class, 'index'])->name('admin.cs.index');
    Route::post('/cs/reply',                 [AdminCustomerServiceController::class, 'reply'])->name('admin.cs.reply');
    Route::delete('/cs/session/{sessionId}', [AdminCustomerServiceController::class, 'destroySession'])->name('admin.cs.destroy-session');
    Route::delete('/cs/clear-all',           [AdminCustomerServiceController::class, 'clearAll'])->name('admin.cs.clear-all');

    // Manajemen Berita (Legacy tetap dipertahankan)
    Route::resource('news', AdminNewsController::class, ['as' => 'admin']);
});

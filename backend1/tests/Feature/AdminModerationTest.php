<?php

use App\Models\Category;
use App\Models\Competition;
use App\Models\StudyProgram;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create([
        'role' => 'admin',
        'email' => 'admin@umpku.ac.id',
    ]);

    $this->regularUser = User::factory()->create([
        'role' => 'user',
        'email' => 'mahasiswa@umpku.ac.id',
    ]);

    $this->category = Category::create([
        'name' => 'Teknologi & IT',
        'slug' => 'teknologi-it',
    ]);

    $this->prodi = StudyProgram::create([
        'name' => 'S1 Informatika',
        'slug' => 's1-informatika',
        'is_active' => true,
    ]);
});

test('guest and regular user are denied from admin moderation routes', function () {
    // Guest accessing admin dashboard
    $this->get('/admin')->assertRedirect(route('admin.login'));
    $this->get('/admin/competitions')->assertRedirect(route('admin.login'));

    // Regular user attempting to access admin dashboard
    $this->actingAs($this->regularUser)
        ->get('/admin/competitions')
        ->assertRedirect(route('admin.login'));
});

test('admin can view competitions index and see pending items', function () {
    Competition::create([
        'user_id' => $this->regularUser->id,
        'category_id' => $this->category->id,
        'title' => 'Lomba Menunggu Verifikasi Admin',
        'organizer' => 'Panitia Kampus',
        'competition_level' => 'Nasional',
        'description' => 'Deskripsi lomba inovasi mahasiswa.',
        'registration_deadline' => Carbon::now()->addDays(10)->toDateString(),
        'registration_url' => 'https://example.com/daftar',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->admin)->get('/admin/competitions');

    $response->assertStatus(200)
        ->assertSee('Lomba Menunggu Verifikasi Admin')
        ->assertSee('Pending Review');
});

test('admin can approve competition and it records reviewer and publish time', function () {
    $competition = Competition::create([
        'user_id' => $this->regularUser->id,
        'category_id' => $this->category->id,
        'title' => 'Lomba Siap Diapprove',
        'organizer' => 'Panitia',
        'competition_level' => 'Nasional',
        'description' => 'Deskripsi lomba yang siap dipublikasikan.',
        'registration_deadline' => Carbon::now()->addDays(15)->toDateString(),
        'registration_url' => 'https://example.com/daftar',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->admin)
        ->post("/admin/competitions/{$competition->id}/approve");

    $response->assertSessionHas('success');

    $competition->refresh();
    expect($competition->status)->toBe('approved');
    expect($competition->reviewed_by)->toBe($this->admin->id);
    expect($competition->published_at)->not->toBeNull();
});

test('admin cannot reject competition without providing rejection reason', function () {
    $competition = Competition::create([
        'user_id' => $this->regularUser->id,
        'category_id' => $this->category->id,
        'title' => 'Lomba Ingin Ditolak',
        'organizer' => 'Panitia',
        'competition_level' => 'Nasional',
        'description' => 'Deskripsi lomba bermasalah.',
        'registration_deadline' => Carbon::now()->addDays(15)->toDateString(),
        'registration_url' => 'https://example.com/daftar',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->admin)
        ->post("/admin/competitions/{$competition->id}/reject", [
            'rejection_reason' => '', // Kosong
        ]);

    $response->assertSessionHasErrors(['rejection_reason']);

    $competition->refresh();
    expect($competition->status)->toBe('pending'); // Tetap pending karena validasi gagal
});

test('admin can reject competition with rejection reason', function () {
    $competition = Competition::create([
        'user_id' => $this->regularUser->id,
        'category_id' => $this->category->id,
        'title' => 'Lomba Ditolak Dengan Alasan',
        'organizer' => 'Panitia',
        'competition_level' => 'Nasional',
        'description' => 'Deskripsi lomba bermasalah.',
        'registration_deadline' => Carbon::now()->addDays(15)->toDateString(),
        'registration_url' => 'https://example.com/daftar',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->admin)
        ->post("/admin/competitions/{$competition->id}/reject", [
            'rejection_reason' => 'Tautan pendaftaran tidak dapat diakses, mohon diperbaiki.',
        ]);

    $response->assertSessionHas('success');

    $competition->refresh();
    expect($competition->status)->toBe('rejected');
    expect($competition->rejection_reason)->toBe('Tautan pendaftaran tidak dapat diakses, mohon diperbaiki.');
    expect($competition->reviewed_by)->toBe($this->admin->id);
});

test('admin can manage categories', function () {
    $this->actingAs($this->admin)
        ->post('/admin/categories', [
            'name' => 'Kategori Baru Admin',
        ])
        ->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'Kategori Baru Admin',
        'slug' => 'kategori-baru-admin',
    ]);
});

test('admin can toggle study program active status', function () {
    expect($this->prodi->is_active)->toBeTrue();

    $this->actingAs($this->admin)
        ->post("/admin/study-programs/{$this->prodi->id}/toggle")
        ->assertSessionHas('success');

    $this->prodi->refresh();
    expect($this->prodi->is_active)->toBeFalse();
});


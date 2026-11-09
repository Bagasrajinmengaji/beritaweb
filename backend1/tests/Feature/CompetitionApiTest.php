<?php

use App\Models\Category;
use App\Models\Competition;
use App\Models\StudyProgram;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Siapkan kategori dan prodi awal
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

test('public can view approved competitions list and categories', function () {
    $user = User::factory()->create();

    // Buat lomba approved
    $approved = Competition::create([
        'user_id' => $user->id,
        'category_id' => $this->category->id,
        'title' => 'Lomba UI/UX Nasional 2026',
        'organizer' => 'HIMATIF UMPKU',
        'competition_level' => 'Nasional',
        'description' => 'Deskripsi lomba UI/UX untuk mahasiswa.',
        'registration_deadline' => Carbon::now('Asia/Jakarta')->addDays(14)->toDateString(),
        'registration_url' => 'https://example.com/daftar',
        'status' => 'approved',
        'published_at' => now(),
    ]);
    $approved->studyPrograms()->attach($this->prodi->id);

    $response = $this->getJson('/api/competitions');

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonFragment(['title' => 'Lomba UI/UX Nasional 2026']);

    // Cek endpoint kategori
    $catResponse = $this->getJson('/api/categories');
    $catResponse->assertStatus(200)
        ->assertJsonFragment(['name' => 'Teknologi & IT']);
});

test('public list never leaks pending or rejected competitions', function () {
    $user = User::factory()->create();

    Competition::create([
        'user_id' => $user->id,
        'category_id' => $this->category->id,
        'title' => 'Lomba Rahasia Pending',
        'organizer' => 'Penyelenggara',
        'description' => 'Deskripsi lomba yang belum diapprove admin.',
        'registration_deadline' => Carbon::now()->addDays(10)->toDateString(),
        'registration_url' => 'https://example.com/daftar',
        'status' => 'pending',
    ]);

    Competition::create([
        'user_id' => $user->id,
        'category_id' => $this->category->id,
        'title' => 'Lomba Ditolak Admin',
        'organizer' => 'Penyelenggara',
        'description' => 'Deskripsi lomba yang ditolak admin karena tidak valid.',
        'registration_deadline' => Carbon::now()->addDays(10)->toDateString(),
        'registration_url' => 'https://example.com/daftar',
        'status' => 'rejected',
        'rejection_reason' => 'Syarat tidak lengkap.',
    ]);

    $response = $this->getJson('/api/competitions');

    $response->assertStatus(200);
    $titles = collect($response->json('data'))->pluck('title');

    expect($titles)->not->toContain('Lomba Rahasia Pending');
    expect($titles)->not->toContain('Lomba Ditolak Admin');
});

test('public cannot view pending competition detail unless owner or admin', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();

    $pending = Competition::create([
        'user_id' => $owner->id,
        'category_id' => $this->category->id,
        'title' => 'Lomba Belum Terbit',
        'organizer' => 'Penyelenggara',
        'description' => 'Deskripsi lomba pending.',
        'registration_deadline' => Carbon::now()->addDays(10)->toDateString(),
        'registration_url' => 'https://example.com/daftar',
        'status' => 'pending',
    ]);

    // Akses tanpa login -> ditolak 403
    $this->getJson("/api/competitions/{$pending->slug}")
        ->assertStatus(403);

    // Akses user lain yang bukan pemilik -> ditolak 403
    Sanctum::actingAs($stranger);
    $this->getJson("/api/competitions/{$pending->slug}")
        ->assertStatus(403);

    // Akses pemilik sendiri -> diperbolehkan 200
    Sanctum::actingAs($owner);
    $this->getJson("/api/competitions/{$pending->slug}")
        ->assertStatus(200)
        ->assertJsonPath('data.title', 'Lomba Belum Terbit');
});

test('unauthenticated guest cannot submit competition', function () {
    $this->postJson('/api/competitions', [
        'title' => 'Lomba Tanpa Login',
    ])->assertStatus(401);
});

test('authenticated user can submit competition and it becomes pending', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $poster = UploadedFile::fake()->image('poster.jpg', 600, 800);

    $payload = [
        'title' => 'Lomba Pemrograman Mahasiswa 2026',
        'category_id' => $this->category->id,
        'organizer' => 'Fakultas Sains dan Teknologi',
        'competition_level' => 'Nasional',
        'description' => 'Kompetisi coding terbuka untuk seluruh mahasiswa D3 dan S1 se-Indonesia.',
        'requirements' => 'Mahasiswa aktif, melampirkan KTM.',
        'registration_deadline' => Carbon::now('Asia/Jakarta')->addDays(20)->toDateString(),
        'registration_url' => 'https://lomba.umpku.ac.id/register',
        'registration_fee' => 'Gratis',
        'study_program_ids' => [$this->prodi->id],
        'poster' => $poster,
    ];

    $response = $this->postJson('/api/competitions', $payload);

    $response->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.title', 'Lomba Pemrograman Mahasiswa 2026')
        ->assertJsonPath('data.status', 'pending');

    $this->assertDatabaseHas('competitions', [
        'title' => 'Lomba Pemrograman Mahasiswa 2026',
        'user_id' => $user->id,
        'status' => 'pending',
    ]);
});

test('submission rejects past deadline dates', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $payload = [
        'title' => 'Lomba Tanggal Basi',
        'category_id' => $this->category->id,
        'organizer' => 'Panitia',
        'competition_level' => 'Nasional',
        'description' => 'Deskripsi lomba dengan tanggal lampau.',
        'registration_deadline' => Carbon::now()->subDay()->toDateString(), // Kemarin
        'registration_url' => 'https://example.com/daftar',
        'study_program_ids' => [$this->prodi->id],
    ];

    $response = $this->postJson('/api/competitions', $payload);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['registration_deadline']);
});

test('user can view their own submissions on dashboard and see rejection reasons', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    Competition::create([
        'user_id' => $user->id,
        'category_id' => $this->category->id,
        'title' => 'Lomba KTI Mahasiswa Saya',
        'organizer' => 'Panitia',
        'description' => 'Deskripsi lomba KTI.',
        'registration_deadline' => Carbon::now()->addDays(5)->toDateString(),
        'registration_url' => 'https://example.com',
        'status' => 'rejected',
        'rejection_reason' => 'Tautan pendaftaran rusak, mohon diperbaiki.',
    ]);

    $response = $this->getJson('/api/my/competitions');

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonFragment(['title' => 'Lomba KTI Mahasiswa Saya']);
});

test('user cannot edit competition belonging to another user', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();

    $competition = Competition::create([
        'user_id' => $owner->id,
        'category_id' => $this->category->id,
        'title' => 'Lomba Milik Orang Lain',
        'organizer' => 'Panitia Asli',
        'description' => 'Deskripsi asli lomba.',
        'registration_deadline' => Carbon::now()->addDays(10)->toDateString(),
        'registration_url' => 'https://example.com',
        'status' => 'pending',
    ]);

    Sanctum::actingAs($stranger);

    $this->putJson("/api/competitions/{$competition->id}", [
        'title' => 'Mencoba Membajak Lomba',
    ])->assertStatus(403);
});

test('owner can update their competition and editing rejected resets status to pending', function () {
    $owner = User::factory()->create();
    Sanctum::actingAs($owner);

    $competition = Competition::create([
        'user_id' => $owner->id,
        'category_id' => $this->category->id,
        'title' => 'Lomba Ditolak Perlu Revisi',
        'organizer' => 'Panitia',
        'description' => 'Deskripsi lomba lama.',
        'registration_deadline' => Carbon::now()->addDays(10)->toDateString(),
        'registration_url' => 'https://example.com',
        'status' => 'rejected',
        'rejection_reason' => 'Perbaiki link pendaftaran.',
    ]);

    $response = $this->putJson("/api/competitions/{$competition->id}", [
        'title' => 'Lomba Sudah Direvisi Linknya',
        'registration_url' => 'https://link-resmi-baru.com/daftar',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.title', 'Lomba Sudah Direvisi Linknya')
        ->assertJsonPath('data.status', 'pending'); // Otomatis kembali ke pending

    $this->assertDatabaseHas('competitions', [
        'id' => $competition->id,
        'title' => 'Lomba Sudah Direvisi Linknya',
        'status' => 'pending',
    ]);
});


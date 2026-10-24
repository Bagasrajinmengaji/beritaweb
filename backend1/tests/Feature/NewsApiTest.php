<?php

use App\Models\News;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

test('can get all news (public)', function () {
    $response = $this->getJson('/api/news');
    $response->assertStatus(200);
});

test('unauthenticated user cannot store news', function () {
    $response = $this->postJson('/api/news', [
        'title'   => 'Judul Tanpa Auth',
        'content' => 'Konten tanpa login',
    ]);
    $response->assertStatus(401);
});

test('authenticated user can store news with native GD webp conversion and author', function () {
    Storage::fake('public');

    $user = User::factory()->create([
        'name'  => 'Jurnalis Senior',
        'email' => 'jurnalis@portalberita.com',
    ]);

    Sanctum::actingAs($user);

    $file = UploadedFile::fake()->image('test_banner.jpg', 640, 480);

    $response = $this->postJson('/api/news', [
        'title'   => 'Judul Berita Uji Coba',
        'content' => 'Ini adalah konten berita untuk pengujian sistem REST API dengan Google SSO.',
        'image'   => $file,
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure([
        'message',
        'data' => [
            'id',
            'title',
            'author',
            'content',
            'image',
            'created_at',
            'updated_at',
        ],
    ]);

    $data = $response->json('data');
    expect($data['image'])->toEndWith('.webp');
    expect($data['author'])->toBe('Jurnalis Senior');

    $cleanPath = ltrim(parse_url($data['image'], PHP_URL_PATH) ?? $data['image'], '/');
    if (str_starts_with($cleanPath, 'storage/')) {
        $cleanPath = substr($cleanPath, strlen('storage/'));
    }

    Storage::disk('public')->assertExists($cleanPath);
    $this->assertDatabaseHas('news', [
        'id'     => $data['id'],
        'title'  => 'Judul Berita Uji Coba',
        'author' => 'Jurnalis Senior',
    ]);
});

test('can show single news (public)', function () {
    $news = News::create([
        'title'   => 'Berita Detail',
        'author'  => 'Admin',
        'content' => 'Konten detail',
        'image'   => '/storage/news/dummy.webp',
    ]);

    $response = $this->getJson("/api/news/{$news->id}");
    $response->assertStatus(200)
             ->assertJsonFragment(['title' => 'Berita Detail', 'author' => 'Admin']);
});

test('authenticated user can delete news and remove physical file', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $relativePath = 'news/delete_test.webp';
    Storage::disk('public')->put($relativePath, 'fake-webp-content');

    $news = News::create([
        'title'   => 'Berita Hapus',
        'content' => 'Konten berita yang akan dihapus',
        'image'   => Storage::url($relativePath),
    ]);

    Storage::disk('public')->assertExists($relativePath);

    $response = $this->deleteJson("/api/news/{$news->id}");
    $response->assertStatus(200);

    Storage::disk('public')->assertMissing($relativePath);
    $this->assertDatabaseMissing('news', ['id' => $news->id]);
});

test('can access /api/me when authenticated', function () {
    $user = User::factory()->create([
        'name'  => 'Budi Pratama',
        'email' => 'budi@example.com',
    ]);

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/me');
    $response->assertStatus(200)
             ->assertJsonFragment(['email' => 'budi@example.com']);
});

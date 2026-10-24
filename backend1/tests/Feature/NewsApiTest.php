<?php

use App\Models\News;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('can get all news', function () {
    $response = $this->getJson('/api/news');
    $response->assertStatus(200);
});

test('can store news with native GD webp conversion', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('test_banner.jpg', 640, 480);

    $response = $this->postJson('/api/news', [
        'title'   => 'Judul Berita Uji Coba',
        'content' => 'Ini adalah konten berita untuk pengujian sistem REST API.',
        'image'   => $file,
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure([
        'message',
        'data' => [
            'id',
            'title',
            'content',
            'image',
            'created_at',
            'updated_at',
        ],
    ]);

    $data = $response->json('data');
    expect($data['image'])->toEndWith('.webp');

    $cleanPath = ltrim(parse_url($data['image'], PHP_URL_PATH) ?? $data['image'], '/');
    if (str_starts_with($cleanPath, 'storage/')) {
        $cleanPath = substr($cleanPath, strlen('storage/'));
    }

    Storage::disk('public')->assertExists($cleanPath);
    $this->assertDatabaseHas('news', [
        'id'    => $data['id'],
        'title' => 'Judul Berita Uji Coba',
    ]);
});

test('can show single news', function () {
    $news = News::create([
        'title'   => 'Berita Detail',
        'content' => 'Konten detail',
        'image'   => '/storage/news/dummy.webp',
    ]);

    $response = $this->getJson("/api/news/{$news->id}");
    $response->assertStatus(200)
             ->assertJsonFragment(['title' => 'Berita Detail']);
});

test('can delete news and remove physical file', function () {
    Storage::fake('public');

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

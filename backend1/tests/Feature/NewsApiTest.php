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

test('can get paginated news for admin table', function () {
    News::factory()->count(5)->create();

    $response = $this->getJson('/api/news?per_page=2');
    $response->assertStatus(200)
             ->assertJsonStructure([
                 'current_page',
                 'data',
                 'total',
                 'per_page',
             ]);

    expect($response->json('data'))->toHaveCount(2);
    expect($response->json('total'))->toBe(5);
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

test('unauthenticated user cannot update news', function () {
    $news = News::create([
        'title'   => 'Berita Awal',
        'author'  => 'Admin',
        'content' => 'Konten awal',
        'image'   => '/storage/news/dummy.webp',
    ]);

    $response = $this->putJson("/api/news/{$news->id}", [
        'title' => 'Judul Diubah Tanpa Auth',
    ]);
    $response->assertStatus(401);
});

test('admin user can update news title and content', function () {
    $admin = User::factory()->admin()->create();
    Sanctum::actingAs($admin);

    $news = News::create([
        'title'   => 'Berita Lama',
        'author'  => 'Admin',
        'content' => 'Konten lama',
        'image'   => '/storage/news/dummy.webp',
    ]);

    $response = $this->putJson("/api/news/{$news->id}", [
        'title'   => 'Berita Telah Diperbarui',
        'content' => 'Konten berita yang baru dan lebih lengkap.',
        'author'  => 'Bagas Pratama',
    ]);

    $response->assertStatus(200)
             ->assertJsonFragment([
                 'message' => 'Berita berhasil diperbarui.',
                 'title'   => 'Berita Telah Diperbarui',
                 'author'  => 'Bagas Pratama',
             ]);

    $this->assertDatabaseHas('news', [
        'id'    => $news->id,
        'title' => 'Berita Telah Diperbarui',
    ]);
});

test('author can update their own news even if role is user', function () {
    $author = User::factory()->create(['role' => 'user']);
    Sanctum::actingAs($author);

    $news = News::create([
        'user_id' => $author->id,
        'title'   => 'Berita Milik Saya',
        'content' => 'Konten awal',
        'image'   => '/storage/news/dummy.webp',
    ]);

    $response = $this->putJson("/api/news/{$news->id}", [
        'title'   => 'Berita Milik Saya (Updated)',
        'content' => 'Konten berhasil diperbarui oleh pemilik artikel.',
    ]);

    $response->assertStatus(200)
             ->assertJsonFragment([
                 'message' => 'Berita berhasil diperbarui.',
                 'title'   => 'Berita Milik Saya (Updated)',
             ]);
});

test('regular user cannot update another user news and receives 403 forbidden', function () {
    $otherUser = User::factory()->create(['role' => 'user']);
    $currentUser = User::factory()->create(['role' => 'user']);

    Sanctum::actingAs($currentUser);

    $news = News::create([
        'user_id' => $otherUser->id,
        'title'   => 'Berita Milik Orang Lain',
        'content' => 'Konten asli',
        'image'   => '/storage/news/dummy.webp',
    ]);

    $response = $this->putJson("/api/news/{$news->id}", [
        'title' => 'Coba Bajak Berita Orang Lain',
    ]);

    $response->assertStatus(403)
             ->assertJson([
                 'message' => 'Anda hanya dapat mengedit berita buatan sendiri.'
             ]);
});

test('admin user can update news with new image and delete old image', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();
    Sanctum::actingAs($admin);

    $oldPath = 'news/old_image.webp';
    Storage::disk('public')->put($oldPath, 'old-image-binary');

    $news = News::create([
        'title'   => 'Berita Bergambar',
        'author'  => 'Admin',
        'content' => 'Konten berita',
        'image'   => Storage::url($oldPath),
    ]);

    Storage::disk('public')->assertExists($oldPath);

    $newFile = UploadedFile::fake()->image('new_banner.png', 800, 600);

    // Menggunakan POST /api/news/{id} untuk form upload multipart
    $response = $this->postJson("/api/news/{$news->id}", [
        'title' => 'Berita Gambar Baru',
        'image' => $newFile,
    ]);

    $response->assertStatus(200);

    // Gambar lama wajib terhapus
    Storage::disk('public')->assertMissing($oldPath);

    // Gambar baru bertipe webp wajib ada di storage
    $data = $response->json('data');
    expect($data['image'])->toEndWith('.webp');

    $newCleanPath = ltrim(parse_url($data['image'], PHP_URL_PATH) ?? $data['image'], '/');
    if (str_starts_with($newCleanPath, 'storage/')) {
        $newCleanPath = substr($newCleanPath, strlen('storage/'));
    }
    Storage::disk('public')->assertExists($newCleanPath);
});

test('unauthenticated user cannot delete news', function () {
    $news = News::create([
        'title'   => 'Berita Mau Dihapus',
        'content' => 'Konten',
        'image'   => '/storage/news/dummy.webp',
    ]);

    $response = $this->deleteJson("/api/news/{$news->id}");
    $response->assertStatus(401);
});

test('regular user cannot delete news and receives 403 forbidden', function () {
    $regularUser = User::factory()->create(['role' => 'user']);
    Sanctum::actingAs($regularUser);

    $news = News::create([
        'title'   => 'Berita Tak Boleh Dihapus User Biasa',
        'content' => 'Konten',
        'image'   => '/storage/news/dummy.webp',
    ]);

    $response = $this->deleteJson("/api/news/{$news->id}");
    $response->assertStatus(403)
             ->assertJson([
                 'message' => 'Akses ditolak. Hanya Admin yang dapat menghapus/mengedit berita secara langsung.'
             ]);
});

test('admin user can delete news and remove physical file', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();
    Sanctum::actingAs($admin);

    $relativePath = 'news/delete_test.webp';
    Storage::disk('public')->put($relativePath, 'fake-webp-content');

    $news = News::create([
        'title'   => 'Berita Hapus',
        'content' => 'Konten berita yang akan dihapus',
        'image'   => Storage::url($relativePath),
    ]);

    Storage::disk('public')->assertExists($relativePath);

    $response = $this->deleteJson("/api/news/{$news->id}");
    $response->assertStatus(200)
             ->assertJsonFragment(['message' => 'Berita berhasil dihapus.']);

    Storage::disk('public')->assertMissing($relativePath);
    $this->assertDatabaseMissing('news', ['id' => $news->id]);
});

test('can access /api/me when authenticated and includes role', function () {
    $user = User::factory()->admin()->create([
        'name'  => 'Budi Pratama',
        'email' => 'budi@example.com',
    ]);

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/me');
    $response->assertStatus(200)
             ->assertJsonFragment([
                 'email' => 'budi@example.com',
                 'role'  => 'admin',
             ]);
});

test('unauthenticated user cannot logout', function () {
    $response = $this->postJson('/api/logout');
    $response->assertStatus(401);
});

test('authenticated user can logout and revokes current token', function () {
    $user = User::factory()->create([
        'name'  => 'Pengguna Logout',
        'email' => 'logout@example.com',
    ]);

    $token = $user->createToken('test-token');

    $response = $this->withHeader('Authorization', 'Bearer ' . $token->plainTextToken)
                     ->postJson('/api/logout');

    $response->assertStatus(200)
             ->assertJson(['message' => 'Berhasil logout']);

    // Pastikan token sudah terhapus di database
    expect($user->tokens()->count())->toBe(0);
});


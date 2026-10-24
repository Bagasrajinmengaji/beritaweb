<?php

use App\Models\CustomerServiceMessage;
use App\Models\News;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

test('user can send customer service message with bot acknowledgment', function () {
    $news = News::factory()->create(['title' => 'Berita Penting']);

    $response = $this->postJson('/api/cs/messages', [
        'user_name'  => 'Budi Penulis',
        'message'    => 'Halo Admin, mohon hapus berita ini karena ada kesalahan',
        'news_id'    => $news->id,
        'session_id' => 'sess_test_123',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['message', 'data', 'bot_reply']);

    expect(CustomerServiceMessage::count())->toBe(2); // 1 pesan user + 1 pesan bot
    $userMsg = CustomerServiceMessage::where('sender', 'user')->first();
    expect($userMsg->is_read_by_admin)->toBeFalse();
    expect($userMsg->news_id)->toBe($news->id);
});

test('admin can see unread customer service messages and reply', function () {
    $admin = User::create([
        'name'     => 'Bagas Admin',
        'username' => 'bagasganteng',
        'email'    => 'admin@portalberita.com',
        'password' => bcrypt('987654321'),
        'role'     => 'admin',
    ]);

    CustomerServiceMessage::create([
        'user_name'        => 'User Penulis',
        'message'          => 'Tolong hapus artikel saya',
        'sender'           => 'user',
        'session_id'       => 'sess_user_1',
        'is_read_by_admin' => false,
    ]);

    Sanctum::actingAs($admin);

    $response = $this->getJson('/api/cs/messages');
    $response->assertStatus(200)
        ->assertJson([
            'unread_count' => 1,
        ]);

    // Admin membalas pesan user
    $replyResponse = $this->postJson('/api/cs/messages', [
        'session_id' => 'sess_user_1',
        'message'    => 'Halo, artikel sudah kami evaluasi dan akan kami hapus.',
        'as_admin'   => true,
    ]);

    $replyResponse->assertStatus(201);
    expect(CustomerServiceMessage::where('sender', 'admin')->count())->toBe(1);
});

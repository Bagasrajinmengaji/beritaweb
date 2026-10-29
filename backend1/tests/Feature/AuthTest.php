<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('user can login with valid username and password', function () {
    $user = User::create([
        'name'     => 'Bagas Pramono',
        'username' => 'bagasganteng',
        'email'    => '1202407009@students.itspku.ac.id',
        'password' => Hash::make('987654321'),
        'role'     => 'admin',
    ]);

    $response = $this->postJson('/api/login', [
        'username' => 'bagasganteng',
        'password' => '987654321',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Login berhasil.',
            'user'    => [
                'id'       => $user->id,
                'username' => 'bagasganteng',
                'email'    => '1202407009@students.itspku.ac.id',
                'role'     => 'admin',
            ],
        ])
        ->assertJsonStructure(['token', 'user']);
});

test('user can also login with email as identifier', function () {
    $user = User::create([
        'name'     => 'Bagas Pramono',
        'username' => 'bagasganteng',
        'email'    => '1202407009@students.itspku.ac.id',
        'password' => Hash::make('987654321'),
        'role'     => 'admin',
    ]);

    $response = $this->postJson('/api/login', [
        'username' => '1202407009@students.itspku.ac.id',
        'password' => '987654321',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Login berhasil.',
            'user'    => [
                'username' => 'bagasganteng',
                'role'     => 'admin',
            ],
        ]);
});

test('login fails with invalid password', function () {
    User::create([
        'name'     => 'Bagas Pramono',
        'username' => 'bagasganteng',
        'email'    => '1202407009@students.itspku.ac.id',
        'password' => Hash::make('987654321'),
        'role'     => 'admin',
    ]);

    $response = $this->postJson('/api/login', [
        'username' => 'bagasganteng',
        'password' => 'salah123',
    ]);

    $response->assertStatus(401)
        ->assertJson(['message' => 'Username atau password salah.']);
});

test('login fails with non-existent user', function () {
    $response = $this->postJson('/api/login', [
        'username' => 'tidakada',
        'password' => '987654321',
    ]);

    $response->assertStatus(401)
        ->assertJson(['message' => 'Username atau password salah.']);
});

test('user can register new account successfully', function () {
    $response = $this->postJson('/api/register', [
        'name'     => 'Ahmad Junaidi',
        'username' => 'ahmadjunaidi',
        'email'    => 'ahmad@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['message', 'token', 'user'])
        ->assertJson([
            'message' => 'Registrasi berhasil.',
            'user'    => [
                'name'     => 'Ahmad Junaidi',
                'username' => 'ahmadjunaidi',
                'email'    => 'ahmad@example.com',
                'role'     => 'user',
            ],
        ]);

    expect(User::where('email', 'ahmad@example.com')->exists())->toBeTrue();
});

test('registration validates duplicate username or email', function () {
    User::create([
        'name'     => 'Bagas Pramono',
        'username' => 'bagasganteng',
        'email'    => 'bagas@example.com',
        'password' => Hash::make('987654321'),
        'role'     => 'admin',
    ]);

    $response = $this->postJson('/api/register', [
        'name'     => 'Orang Lain',
        'username' => 'bagasganteng',
        'email'    => 'lain@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['username']);
});

test('login notifies user if account was created with google and has no password', function () {
    User::create([
        'name'      => 'Google User',
        'username'  => 'googleuser',
        'email'     => 'google@example.com',
        'google_id' => '1234567890',
        'password'  => null,
        'role'      => 'user',
    ]);

    $response = $this->postJson('/api/login', [
        'username' => 'google@example.com',
        'password' => 'secret123',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'message' => 'Akun ini terdaftar menggunakan Google. Silakan masuk menggunakan tombol Google SSO.',
        ]);
});

test('login works with mixed-case email or username', function () {
    User::create([
        'name'     => 'Test User',
        'username' => 'testuser',
        'email'    => 'test@example.com',
        'password' => Hash::make('password123'),
        'role'     => 'user',
    ]);

    $response = $this->postJson('/api/login', [
        'username' => 'TeSt@ExAmPlE.cOm ',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Login berhasil.',
            'user'    => [
                'username' => 'testuser',
                'email'    => 'test@example.com',
            ],
        ]);
});

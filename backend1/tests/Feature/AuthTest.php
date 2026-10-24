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

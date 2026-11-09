<?php

use App\Models\Category;
use App\Models\Competition;
use App\Models\StudyProgram;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('category auto generates slug and has competitions relation', function () {
    $category = Category::create([
        'name' => 'Kategori Uji Coba Feature',
    ]);

    expect($category->slug)->toBe('kategori-uji-coba-feature');
    expect($category->competitions)->toBeIterable();
});

test('study program has default is_active true and many-to-many relation', function () {
    $program = StudyProgram::create([
        'name' => 'S1 Rekayasa Perangkat Lunak Uji',
    ]);

    expect($program->slug)->toBe('s1-rekayasa-perangkat-lunak-uji');
    expect($program->is_active)->toBeTrue();
    expect($program->competitions)->toBeIterable();
});

test('competition auto generates unique slug and resolves relations', function () {
    $user = User::factory()->create();
    $category = Category::first() ?? Category::create(['name' => 'Kategori Default']);
    $program = StudyProgram::first() ?? StudyProgram::create(['name' => 'Prodi Default']);

    $competition = Competition::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'title' => 'Kompetisi Inovasi Kampus 2026',
        'organizer' => 'BEM UMPKU',
        'competition_level' => 'Nasional',
        'description' => 'Deskripsi lomba inovasi mahasiswa.',
        'registration_deadline' => Carbon::now('Asia/Jakarta')->addDays(14)->toDateString(),
        'registration_url' => 'https://umpku.ac.id/lomba',
        'status' => 'pending',
    ]);

    $competition->studyPrograms()->attach($program->id);

    expect($competition->slug)->toBe('kompetisi-inovasi-kampus-2026');
    expect($competition->category->id)->toBe($category->id);
    expect($competition->user->id)->toBe($user->id);
    expect($competition->studyPrograms->contains($program))->toBeTrue();
});

test('competition calculates registration status correctly based on Asia/Jakarta timezone', function () {
    $opened = new Competition([
        'registration_deadline' => Carbon::now('Asia/Jakarta')->addDays(15)->toDateString(),
    ]);
    expect($opened->registration_status)->toBe('Pendaftaran Dibuka');
    expect($opened->days_remaining)->toBe(15);

    $closingSoon = new Competition([
        'registration_deadline' => Carbon::now('Asia/Jakarta')->addDays(3)->toDateString(),
    ]);
    expect($closingSoon->registration_status)->toBe('Segera Ditutup');
    expect($closingSoon->days_remaining)->toBe(3);

    $closed = new Competition([
        'registration_deadline' => Carbon::now('Asia/Jakarta')->subDays(2)->toDateString(),
    ]);
    expect($closed->registration_status)->toBe('Pendaftaran Ditutup');
    expect($closed->days_remaining)->toBe(0);
});

test('competition scopes filter status correctly', function () {
    $user = User::factory()->create();
    $category = Category::first() ?? Category::create(['name' => 'Kategori Default']);

    $approved = Competition::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'title' => 'Lomba Disetujui',
        'organizer' => 'Panitia',
        'description' => 'Deskripsi',
        'registration_deadline' => Carbon::now()->addDays(10)->toDateString(),
        'registration_url' => 'https://example.com',
        'status' => 'approved',
    ]);

    $pending = Competition::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'title' => 'Lomba Menunggu',
        'organizer' => 'Panitia',
        'description' => 'Deskripsi',
        'registration_deadline' => Carbon::now()->addDays(10)->toDateString(),
        'registration_url' => 'https://example.com',
        'status' => 'pending',
    ]);

    expect(Competition::approved()->pluck('id'))->toContain($approved->id);
    expect(Competition::approved()->pluck('id'))->not->toContain($pending->id);
    expect(Competition::pending()->pluck('id'))->toContain($pending->id);
});

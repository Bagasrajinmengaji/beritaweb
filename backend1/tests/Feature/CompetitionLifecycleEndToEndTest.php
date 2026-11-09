<?php

use App\Models\Category;
use App\Models\Competition;
use App\Models\StudyProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('complete competition lifecycle end-to-end: submit -> pending -> admin approve -> public visible -> admin reject -> user resubmit', function () {
    // 1. Setup seed data
    $category = Category::create([
        'name' => 'Teknologi Informasi & AI',
        'slug' => 'teknologi-informasi-ai',
        'description' => 'Lomba IT',
        'is_active' => true,
    ]);

    $prodi = StudyProgram::create([
        'name' => 'S1 Informatika',
        'slug' => 's1-informatika',
        'degree' => 'S1',
        'is_active' => true,
    ]);

    $student = User::factory()->create([
        'name' => 'Mahasiswa UMPKU',
        'email' => 'mahasiswa@umpku.ac.id',
        'role' => 'user',
    ]);

    $admin = User::factory()->create([
        'name' => 'Admin Kemahasiswaan',
        'email' => 'admin@umpku.ac.id',
        'role' => 'admin',
    ]);

    // 2. Mahasiswa submits new competition via API
    $payload = [
        'title' => 'Hackathon Nasional UMPKU 2026',
        'category_id' => $category->id,
        'organizer' => 'HIMATIKA UMPKU',
        'competition_level' => 'Nasional',
        'registration_deadline' => now()->addDays(30)->toDateString(),
        'registration_fee' => 'Rp 50.000',
        'registration_url' => 'https://umpku.ac.id/hackathon',
        'source_url' => 'https://instagram.com/p/hackathon2026',
        'description' => 'Kompetisi pengembangan aplikasi berbasis web untuk mahasiswa seluruh Indonesia.',
        'requirements' => "1. Mahasiswa aktif\n2. Tim 3 orang",
        'study_program_ids' => [$prodi->id],
    ];

    $submitResponse = $this->actingAs($student, 'sanctum')
        ->postJson('/api/competitions', $payload);

    $submitResponse->assertStatus(201)
        ->assertJsonPath('data.status', 'pending');

    $competitionId = $submitResponse->json('data.id');

    // 3. Verify public catalog does NOT show the pending competition
    $publicResponse = $this->getJson('/api/competitions');
    $publicResponse->assertStatus(200);
    expect(collect($publicResponse->json('data'))->pluck('id'))->not->toContain($competitionId);

    // 4. Verify student dashboard shows the competition as pending
    $myCompetitionsResponse = $this->actingAs($student, 'sanctum')
        ->getJson('/api/my/competitions?status=pending');
    $myCompetitionsResponse->assertStatus(200)
        ->assertJsonPath('meta.total', 1);

    // 5. Admin approves the competition via Blade admin route
    $approveResponse = $this->actingAs($admin)
        ->post("/admin/competitions/{$competitionId}/approve");
    $approveResponse->assertRedirect();

    // 6. Verify public catalog NOW shows the approved competition
    $publicApprovedResponse = $this->getJson('/api/competitions');
    $publicApprovedResponse->assertStatus(200);
    expect(collect($publicApprovedResponse->json('data'))->pluck('id'))->toContain($competitionId);

    // 7. Admin rejects the competition with reason
    $rejectResponse = $this->actingAs($admin)
        ->post("/admin/competitions/{$competitionId}/reject", [
            'rejection_reason' => 'Tautan pendaftaran belum dapat diakses, mohon perbaiki URL.',
        ]);
    $rejectResponse->assertRedirect();

    // 8. Verify public catalog does NOT show rejected competition
    $publicRejectedCheck = $this->getJson('/api/competitions');
    expect(collect($publicRejectedCheck->json('data'))->pluck('id'))->not->toContain($competitionId);

    // 9. Verify student dashboard sees rejection reason
    $myRejectedCheck = $this->actingAs($student, 'sanctum')
        ->getJson('/api/my/competitions?status=rejected');
    $myRejectedCheck->assertStatus(200)
        ->assertJsonPath('data.0.status', 'rejected')
        ->assertJsonPath('data.0.rejection_reason', 'Tautan pendaftaran belum dapat diakses, mohon perbaiki URL.');

    // 10. Student updates competition with corrected link (resubmission)
    $resubmitResponse = $this->actingAs($student, 'sanctum')
        ->putJson("/api/competitions/{$competitionId}", array_merge($payload, [
            'registration_url' => 'https://umpku.ac.id/hackathon-fixed',
        ]));

    $resubmitResponse->assertStatus(200)
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.rejection_reason', null);

    // Verify DB state
    $competition = Competition::find($competitionId);
    expect($competition->status)->toBe('pending')
        ->and($competition->rejection_reason)->toBeNull()
        ->and($competition->registration_url)->toBe('https://umpku.ac.id/hackathon-fixed');
});

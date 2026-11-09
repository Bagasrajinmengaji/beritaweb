<?php

namespace Database\Seeders;

use App\Models\StudyProgram;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StudyProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programs = [
            'S1 Informatika',
            'S1 Keperawatan',
            'S1 Kebidanan',
            'S1 Gizi',
            'D4 Teknologi Rekayasa Elektromedis',
            'D3 Keperawatan',
            'D3 Kebidanan',
            'Profesi Ners',
            'Profesi Bidan',
        ];

        foreach ($programs as $name) {
            StudyProgram::firstOrCreate(
                ['name' => $name],
                [
                    'slug' => Str::slug($name),
                    'is_active' => true,
                ]
            );
        }
    }
}


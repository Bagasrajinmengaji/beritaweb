<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Teknologi & Rekayasa Perangkat Lunak',
            'Riset & Karya Tulis Ilmiah (KTI)',
            'Desain, UI/UX & Multimedia',
            'Kesehatan & Keperawatan',
            'Bisnis, Manajemen & Kewirausahaan',
            'Debat, Bahasa & Komunikasi',
            'Olahraga & Seni Budaya',
            'Inovasi Sains & Medis',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name)]
            );
        }
    }
}


<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Set user penguji utama sebagai admin
        User::updateOrCreate(
            ['email' => 'bagas@portalberita.com'],
            [
                'name' => 'Bagas Pratama',
                'role' => 'admin',
            ]
        );
    }
}

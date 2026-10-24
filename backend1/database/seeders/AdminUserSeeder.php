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
            ['email' => '1202407009@students.itspku.ac.id'],
            [
                'name' => 'Bagas Pramono',
                'role' => 'admin',
            ]
        );
    }
}

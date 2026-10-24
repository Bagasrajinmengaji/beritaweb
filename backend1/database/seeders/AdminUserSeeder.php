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
        // Set user penguji utama sebagai admin dengan username dan password
        $admin = User::where('email', '1202407009@students.itspku.ac.id')
            ->orWhere('username', 'bagasganteng')
            ->first();

        if ($admin) {
            $admin->update([
                'name'     => 'Bagas Pramono',
                'username' => 'bagasganteng',
                'email'    => '1202407009@students.itspku.ac.id',
                'password' => '987654321',
                'role'     => 'admin',
            ]);
        } else {
            User::create([
                'name'     => 'Bagas Pramono',
                'username' => 'bagasganteng',
                'email'    => '1202407009@students.itspku.ac.id',
                'password' => '987654321',
                'role'     => 'admin',
            ]);
        }
    }
}

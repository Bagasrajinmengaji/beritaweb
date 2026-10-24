<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SetAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:set-admin {email=bagas@portalberita.com : Email akun pengguna yang akan dijadikan admin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mengubah role pengguna menjadi admin';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => 'Bagas Pratama (Admin)',
                'role' => 'admin',
            ]
        );

        $user->role = 'admin';
        $user->save();

        $this->info("User [{$user->name}] ({$user->email}) sekarang memiliki role: [{$user->role}].");

        return Command::SUCCESS;
    }
}

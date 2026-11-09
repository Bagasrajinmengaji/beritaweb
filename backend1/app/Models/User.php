<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'username',
        'email',
        'role',
        'password',
        'google_id',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    /**
     * Cek apakah user memiliki peran admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Relasi berita yang ditulis user
     */
    public function news()
    {
        return $this->hasMany(News::class);
    }

    /**
     * Relasi kompetisi yang diajukan oleh user
     */
    public function competitions()
    {
        return $this->hasMany(Competition::class, 'user_id');
    }

    /**
     * Relasi kompetisi yang direview/dimoderasi oleh user (admin)
     */
    public function reviewedCompetitions()
    {
        return $this->hasMany(Competition::class, 'reviewed_by');
    }
}

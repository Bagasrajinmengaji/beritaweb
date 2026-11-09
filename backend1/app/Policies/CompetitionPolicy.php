<?php

namespace App\Policies;

use App\Models\Competition;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CompetitionPolicy
{
    use HandlesAuthorization;

    /**
     * Tentukan apakah user (atau publik) dapat melihat lomba tertentu.
     * Jika status approved, siapapun (termasuk guest) boleh melihat.
     * Jika pending/rejected/draft, hanya pemilik atau admin yang boleh.
     */
    public function view(?User $user, Competition $competition): bool
    {
        if ($competition->status === 'approved') {
            return true;
        }

        if (!$user) {
            return false;
        }

        return $user->id === $competition->user_id || $user->role === 'admin';
    }

    /**
     * Tentukan apakah user dapat mengajukan informasi lomba baru.
     * Semua user yang terautentikasi (login) diperbolehkan.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Tentukan apakah user dapat mengedit/memperbarui lomba.
     * Hanya pemilik lomba atau admin yang berhak.
     */
    public function update(User $user, Competition $competition): bool
    {
        return $user->id === $competition->user_id || $user->role === 'admin';
    }

    /**
     * Tentukan apakah user dapat menghapus lomba.
     * Hanya pemilik atau admin.
     */
    public function delete(User $user, Competition $competition): bool
    {
        return $user->id === $competition->user_id || $user->role === 'admin';
    }

    /**
     * Tentukan apakah user dapat memoderasi (approve/reject) lomba.
     * Hanya admin.
     */
    public function moderate(User $user): bool
    {
        return $user->role === 'admin';
    }
}


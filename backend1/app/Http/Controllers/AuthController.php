<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Redirect user ke halaman login Google.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Tangani callback dari Google setelah user login.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/login?error=google_auth_failed');
        }

        $googleEmail  = strtolower(trim($googleUser->getEmail()));
        $googleId     = (string) $googleUser->getId();
        $googleName   = $googleUser->getName() ?: 'Pengguna Google';
        $googleAvatar = $googleUser->getAvatar();

        // Cari user berdasarkan email
        $user = User::where('email', $googleEmail)->first();

        if ($user) {
            // Update identitas Google tanpa menghapus password atau role yang sudah ada!
            $updateData = [
                'google_id' => $googleId,
            ];

            if ($googleAvatar && empty($user->avatar)) {
                $updateData['avatar'] = $googleAvatar;
            }

            // Jika username masih kosong, buatkan username unik otomatis
            if (empty($user->username)) {
                $baseUsername = strtolower(preg_replace('/[^a-z0-9_]/', '', explode('@', $googleEmail)[0]));
                if (strlen($baseUsername) < 3) {
                    $baseUsername = 'user_' . substr(md5($googleEmail), 0, 6);
                }
                $username = $baseUsername;
                $counter = 1;
                while (User::where('username', $username)->where('id', '!=', $user->id)->exists()) {
                    $username = $baseUsername . $counter++;
                }
                $updateData['username'] = $username;
            }

            $user->update($updateData);
        } else {
            // Buat user baru dari Google dengan username unik
            $baseUsername = strtolower(preg_replace('/[^a-z0-9_]/', '', explode('@', $googleEmail)[0]));
            if (strlen($baseUsername) < 3) {
                $baseUsername = 'user_' . substr(md5($googleEmail), 0, 6);
            }
            $username = $baseUsername;
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername . $counter++;
            }

            $user = User::create([
                'name'      => $googleName,
                'username'  => $username,
                'email'     => $googleEmail,
                'google_id' => $googleId,
                'avatar'    => $googleAvatar,
                'role'      => 'user',
                'password'  => null,
            ]);
        }

        // Hapus token google-auth lama agar tidak menumpuk
        $user->tokens()->where('name', 'google-auth')->delete();

        // Buat Sanctum Personal Access Token
        $token = $user->createToken('google-auth')->plainTextToken;

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $userData    = urlencode(json_encode([
            'id'       => $user->id,
            'name'     => $user->name,
            'username' => $user->username,
            'email'    => $user->email,
            'role'     => $user->role,
            'avatar'   => $user->avatar,
        ]));

        return redirect($frontendUrl . '/auth/callback?token=' . $token . '&user=' . $userData);
    }

    /**
     * Login menggunakan username atau email dan password.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ], [
            'username.required' => 'Username atau email wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $identifier = trim($validated['username']);
        $password   = $validated['password'];

        // Cari user berdasarkan username (case-insensitive) ATAU email (case-insensitive)
        $user = User::whereRaw('LOWER(username) = ?', [strtolower($identifier)])
            ->orWhereRaw('LOWER(email) = ?', [strtolower($identifier)])
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Username atau password salah.',
            ], 401);
        }

        // Jika user terdaftar via Google SSO dan belum memiliki password
        if (empty($user->password)) {
            return response()->json([
                'message' => 'Akun ini terdaftar menggunakan Google. Silakan masuk menggunakan tombol Google SSO.',
            ], 422);
        }

        if (!Hash::check($password, $user->password)) {
            return response()->json([
                'message' => 'Username atau password salah.',
            ], 401);
        }

        // Hapus token auth-token lama jika ada
        $user->tokens()->where('name', 'auth-token')->delete();

        // Buat Sanctum token baru
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->name,
                'username' => $user->username,
                'email'    => $user->email,
                'role'     => $user->role,
                'avatar'   => $user->avatar,
            ],
        ]);
    }

    /**
     * Kembalikan data user yang sedang login (protected by auth:sanctum).
     */
    public function me(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json([
            'id'         => $user->id,
            'name'       => $user->name,
            'username'   => $user->username,
            'email'      => $user->email,
            'role'       => $user->role,
            'avatar'     => $user->avatar,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]);
    }

    /**
     * Registrasi user baru menggunakan nama, username, email, dan password.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:100',
            'username' => 'required|string|min:3|max:50|alpha_dash|unique:users,username',
            'email'    => 'required|string|email|max:150|unique:users,email',
            'password' => 'required|string|min:6',
        ], [
            'name.required'       => 'Nama lengkap wajib diisi.',
            'username.required'   => 'Username wajib diisi.',
            'username.min'        => 'Username minimal 3 karakter.',
            'username.alpha_dash' => 'Username hanya boleh huruf, angka, tanda hubung (-), dan garis bawah (_).',
            'username.unique'     => 'Username sudah digunakan, silakan pilih yang lain.',
            'email.required'      => 'Alamat email wajib diisi.',
            'email.email'         => 'Format email tidak valid.',
            'email.unique'        => 'Email sudah terdaftar, silakan gunakan email lain atau login.',
            'password.required'   => 'Password wajib diisi.',
            'password.min'        => 'Password minimal harus 6 karakter.',
        ]);

        $cleanUsername = strtolower(trim($validated['username']));
        $cleanEmail    = strtolower(trim($validated['email']));
        $cleanName     = trim($validated['name']);

        $user = User::create([
            'name'     => $cleanName,
            'username' => $cleanUsername,
            'email'    => $cleanEmail,
            'password' => Hash::make($validated['password']),
            'role'     => 'user',
        ]);

        // Buat token Sanctum awal agar langsung login
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil.',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->name,
                'username' => $user->username,
                'email'    => $user->email,
                'role'     => $user->role,
                'avatar'   => $user->avatar,
            ],
        ], 201);
    }

    /**
     * Revoke token aktif (logout dari sisi backend).
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Berhasil logout']);
    }
}

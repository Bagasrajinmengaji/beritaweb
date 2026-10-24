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
            return redirect($frontendUrl . '/?error=google_auth_failed');
        }

        // Cari/buat user berdasarkan email, update data Google
        $user = User::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name'      => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'avatar'    => $googleUser->getAvatar(),
                'password'  => null,
            ]
        );

        // Hapus token lama agar tidak menumpuk (opsional)
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
     * Login menggunakan username dan password.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Cari user berdasarkan username ATAU email
        $user = User::where('username', $validated['username'])
            ->orWhere('email', $validated['username'])
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
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
     * Revoke token aktif (logout dari sisi backend).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Berhasil logout']);
    }
}

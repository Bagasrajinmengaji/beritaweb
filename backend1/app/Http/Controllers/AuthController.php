<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
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
            'name'   => $user->name,
            'email'  => $user->email,
            'avatar' => $user->avatar,
        ]));

        return redirect($frontendUrl . '/auth/callback?token=' . $token . '&user=' . $userData);
    }

    /**
     * Kembalikan data user yang sedang login (protected by auth:sanctum).
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Revoke token aktif (logout dari sisi backend).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }
}

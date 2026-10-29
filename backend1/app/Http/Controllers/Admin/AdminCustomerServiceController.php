<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerServiceMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminCustomerServiceController extends Controller
{
    /**
     * Tampilkan panel percakapan Customer Service.
     */
    public function index(Request $request)
    {
        // Ambil seluruh sesi percakapan unik, diurutkan dari aktivitas terbaru
        $sessions = CustomerServiceMessage::select('session_id', 'user_name', 'user_email', 'news_id', 'news_title')
            ->selectRaw('MAX(created_at) as last_activity')
            ->selectRaw('SUM(CASE WHEN sender = "user" AND is_read_by_admin = 0 THEN 1 ELSE 0 END) as unread_count')
            ->groupBy('session_id', 'user_name', 'user_email', 'news_id', 'news_title')
            ->orderByDesc('last_activity')
            ->get();

        $activeSessionId = $request->query('session_id');

        // Jika tidak ada session_id yang dipilih, pilih sesi pertama jika ada
        if (!$activeSessionId && $sessions->isNotEmpty()) {
            $activeSessionId = $sessions->first()->session_id;
        }

        $activeMessages = collect();
        $activeSessionInfo = null;

        if ($activeSessionId) {
            $activeMessages = CustomerServiceMessage::where('session_id', $activeSessionId)
                ->orderBy('created_at', 'asc')
                ->get();

            $activeSessionInfo = $sessions->firstWhere('session_id', $activeSessionId);

            // Tandai seluruh pesan user pada sesi ini sebagai sudah dibaca oleh admin
            CustomerServiceMessage::where('session_id', $activeSessionId)
                ->where('sender', 'user')
                ->where('is_read_by_admin', false)
                ->update(['is_read_by_admin' => true]);
        }

        return view('admin.cs.index', compact('sessions', 'activeSessionId', 'activeMessages', 'activeSessionInfo'));
    }

    /**
     * Kirim balasan Admin ke sesi user.
     */
    public function reply(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'message'    => 'required|string|max:2000',
        ], [
            'message.required' => 'Pesan balasan tidak boleh kosong.',
        ]);

        $latestUserMsg = CustomerServiceMessage::where('session_id', $request->session_id)
            ->where('sender', 'user')
            ->latest()
            ->first();

        CustomerServiceMessage::create([
            'user_id'          => Auth::id(),
            'session_id'       => $request->session_id,
            'user_name'        => Auth::user()->name ?? 'Administrator',
            'user_email'       => Auth::user()->email ?? 'admin@portalberita.com',
            'news_id'          => $latestUserMsg?->news_id,
            'news_title'       => $latestUserMsg?->news_title,
            'message'          => trim($request->message),
            'sender'           => 'admin',
            'is_read_by_admin' => true,
            'is_read_by_user'  => false,
            'status'           => 'answered',
        ]);

        return redirect()->route('admin.cs.index', ['session_id' => $request->session_id])
            ->with('success', 'Balasan berhasil dikirim ke user.');
    }

    /**
     * Hapus seluruh percakapan dalam suatu sesi.
     */
    public function destroySession($sessionId)
    {
        CustomerServiceMessage::where('session_id', $sessionId)->delete();

        return redirect()->route('admin.cs.index')->with('success', 'Sesi percakapan berhasil dihapus.');
    }

    /**
     * Hapus seluruh data pesan Customer Service.
     */
    public function clearAll()
    {
        CustomerServiceMessage::truncate();

        return redirect()->route('admin.cs.index')->with('success', 'Seluruh riwayat chat Customer Service berhasil dibersihkan.');
    }
}


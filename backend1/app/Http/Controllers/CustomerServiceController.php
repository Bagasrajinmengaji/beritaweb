<?php

namespace App\Http\Controllers;

use App\Models\CustomerServiceMessage;
use App\Models\News;
use Illuminate\Http\Request;

class CustomerServiceController extends Controller
{
    /**
     * Ambil daftar pesan Customer Service.
     */
    public function index(Request $request)
    {
        $user = auth('sanctum')->user();
        $isAdmin = $user && $user->role === 'admin';

        $query = CustomerServiceMessage::with(['user:id,name,email,avatar', 'news:id,title']);

        // Jika Admin, dapat melihat seluruh pesan atau filter berdasarkan session_id / news_id
        if ($isAdmin) {
            if ($request->filled('session_id')) {
                $query->where('session_id', $request->query('session_id'));
            }

            if ($request->filled('news_id')) {
                $query->where('news_id', $request->query('news_id'));
            }

            $messages = $query->orderBy('created_at', 'asc')->get();
            $unreadCount = CustomerServiceMessage::where('sender', 'user')
                ->where('is_read_by_admin', false)
                ->count();

            // Ringkasan seluruh permohonan & kebutuhan aktif user untuk notifikasi Admin
            $pendingRequests = CustomerServiceMessage::where('sender', 'user')
                ->where('is_read_by_admin', false)
                ->orderBy('created_at', 'desc')
                ->take(20)
                ->get();

            // Daftar percakapan/sesi unik pengguna untuk navigasi Admin
            $allMessages = CustomerServiceMessage::orderBy('created_at', 'desc')->get();
            $conversations = $allMessages->groupBy('session_id')->map(function ($group) {
                $latest = $group->first();
                $unread = $group->where('sender', 'user')->where('is_read_by_admin', false)->count();
                return [
                    'session_id'   => $latest->session_id,
                    'user_id'      => $latest->user_id,
                    'user_name'    => $latest->user_name,
                    'user_email'   => $latest->user_email,
                    'news_id'      => $latest->news_id,
                    'news_title'   => $latest->news_title,
                    'last_message' => $latest->message,
                    'unread_count' => $unread,
                    'updated_at'   => $latest->created_at,
                ];
            })->values();

            return response()->json([
                'messages'         => $messages,
                'unread_count'     => $unreadCount,
                'pending_requests' => $pendingRequests,
                'conversations'    => $conversations,
            ]);
        }

        // Jika Pengguna Biasa / Publik
        $sessionId = $request->query('session_id');
        if ($user) {
            $query->where(function ($q) use ($user, $sessionId) {
                $q->where('user_id', $user->id);
                if ($sessionId) {
                    $q->orWhere('session_id', $sessionId);
                }
            });
        } elseif ($sessionId) {
            $query->where('session_id', $sessionId);
        } else {
            return response()->json(['messages' => [], 'unread_count' => 0]);
        }

        $messages = $query->orderBy('created_at', 'asc')->get();
        $unreadCount = $query->where('sender', '!=', 'user')
            ->where('is_read_by_user', false)
            ->count();

        return response()->json([
            'messages'     => $messages,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Simpan pesan baru ke Customer Service.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'message'    => 'required|string|max:5000',
            'news_id'    => 'nullable|integer|exists:news,id',
            'news_title' => 'nullable|string|max:255',
            'session_id' => 'nullable|string|max:100',
            'user_name'  => 'nullable|string|max:150',
            'user_email' => 'nullable|email|max:150',
        ]);

        $user = auth('sanctum')->user();
        $isAdmin = $user && $user->role === 'admin';

        $userName = $validated['user_name']
            ?? ($user ? $user->name : 'Pengguna Portal');
        $userEmail = $validated['user_email']
            ?? ($user ? $user->email : null);

        // Jika berita terlampir tapi news_title kosong, cari judulnya
        $newsTitle = $validated['news_title'] ?? null;
        if (!empty($validated['news_id']) && empty($newsTitle)) {
            $news = News::find($validated['news_id']);
            if ($news) $newsTitle = $news->title;
        }

        // Tentukan sender: jika admin mengirim pesan balasan
        $sender = ($isAdmin && $request->input('as_admin', false)) ? 'admin' : 'user';

        $msg = CustomerServiceMessage::create([
            'user_id'          => $user ? $user->id : null,
            'session_id'       => $validated['session_id'] ?? ($user ? 'usr_'.$user->id : 'guest_'.session()->getId()),
            'user_name'        => $sender === 'admin' ? 'Admin Redaksi' : $userName,
            'user_email'       => $userEmail,
            'news_id'          => $validated['news_id'] ?? null,
            'news_title'       => $newsTitle,
            'message'          => $validated['message'],
            'sender'           => $sender,
            'is_read_by_admin' => $sender === 'admin',
            'is_read_by_user'  => $sender === 'user',
            'status'           => 'open',
        ]);

        // Jika admin membalas, tandai seluruh pesan user pada sesi ini sebagai sudah dibaca admin
        if ($sender === 'admin') {
            CustomerServiceMessage::where('session_id', $msg->session_id)
                ->where('is_read_by_admin', false)
                ->update(['is_read_by_admin' => true]);
        }

        $botReply = null;
        // Jika pesan dari user dan berkaitan dengan penghapusan atau revisi, buat bot auto-reply
        if ($sender === 'user') {
            $lower = strtolower($validated['message']);
            if (!empty($validated['news_id']) || str_contains($lower, 'hapus') || str_contains($lower, 'revisi')) {
                $targetLabel = $newsTitle ? "\"{$newsTitle}\"" : "artikel Anda";
                $botText = "Halo kak {$userName}! Permohonan Anda mengenai {$targetLabel} telah berhasil dicatat. Notifikasi prioritas telah dikirimkan ke Dashboard Admin untuk ditinjau dan ditindaklanjuti.";

                $botReply = CustomerServiceMessage::create([
                    'user_id'          => $user ? $user->id : null,
                    'session_id'       => $msg->session_id,
                    'user_name'        => 'Bot Redaksi',
                    'user_email'       => 'bot@portalberita.com',
                    'news_id'          => $msg->news_id,
                    'news_title'       => $newsTitle,
                    'message'          => $botText,
                    'sender'           => 'bot',
                    'is_read_by_admin' => true,
                    'is_read_by_user'  => true,
                    'status'           => 'open',
                ]);
            }
        }

        return response()->json([
            'message'   => 'Pesan berhasil dikirim.',
            'data'      => $msg,
            'bot_reply' => $botReply,
        ], 201);
    }

    /**
     * Tandai pesan sebagai telah dibaca oleh Admin atau User.
     */
    public function markAsRead(Request $request)
    {
        $user = auth('sanctum')->user();
        $isAdmin = $user && $user->role === 'admin';
        $sessionId = $request->input('session_id', $request->query('session_id'));

        if ($isAdmin) {
            $query = CustomerServiceMessage::where('is_read_by_admin', false);
            if (!empty($sessionId)) {
                $query->where('session_id', $sessionId);
            }
            $query->update(['is_read_by_admin' => true]);
            return response()->json(['message' => 'Pesan ditandai telah dibaca oleh admin.']);
        }

        $sessionId = $request->input('session_id');
        if ($user) {
            CustomerServiceMessage::where('user_id', $user->id)
                ->where('is_read_by_user', false)
                ->update(['is_read_by_user' => true]);
        } elseif ($sessionId) {
            CustomerServiceMessage::where('session_id', $sessionId)
                ->where('is_read_by_user', false)
                ->update(['is_read_by_user' => true]);
        }

        return response()->json(['message' => 'Pesan ditandai telah dibaca.']);
    }

    /**
     * Hapus satu pesan spesifik (Admin atau pemilik pesan).
     */
    public function destroy($id)
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $message = CustomerServiceMessage::find($id);
        if (!$message) {
            return response()->json(['message' => 'Pesan tidak ditemukan.'], 404);
        }

        $isAdmin = $user->role === 'admin';
        if (!$isAdmin && $message->user_id !== $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki izin menghapus pesan ini.'], 403);
        }

        $message->delete();

        return response()->json([
            'message' => 'Pesan chat berhasil dihapus.',
            'id' => (int) $id,
        ]);
    }

    /**
     * Hapus seluruh sesi percakapan chat pengguna tertentu.
     */
    public function destroySession($sessionId)
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $isAdmin = $user->role === 'admin';
        if (!$isAdmin) {
            $ownedSession = 'usr_' . $user->id;
            if ($sessionId !== $ownedSession) {
                return response()->json(['message' => 'Anda tidak memiliki izin menghapus sesi ini.'], 403);
            }
        }

        $deletedCount = CustomerServiceMessage::where('session_id', $sessionId)->delete();

        return response()->json([
            'message' => "Percakapan berhasil dihapus ({$deletedCount} pesan).",
            'session_id' => $sessionId,
            'deleted_count' => $deletedCount,
        ]);
    }

    /**
     * Hapus semua chat/notifikasi dari user (Khusus Admin) agar notifikasi tidak menumpuk.
     */
    public function clearAll(Request $request)
    {
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang dapat menghapus seluruh chat.'], 403);
        }

        $scope = $request->input('scope', 'all'); // 'all', 'user_only', 'unread_only'

        if ($scope === 'unread_only') {
            $deletedCount = CustomerServiceMessage::where('sender', 'user')
                ->where('is_read_by_admin', false)
                ->delete();
        } elseif ($scope === 'user_only') {
            $deletedCount = CustomerServiceMessage::where('sender', 'user')->delete();
        } else {
            $deletedCount = CustomerServiceMessage::query()->delete();
        }

        return response()->json([
            'message' => "Seluruh chat berhasil dibersihkan ({$deletedCount} pesan dihapus).",
            'deleted_count' => $deletedCount,
        ]);
    }
}

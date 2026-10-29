<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Models\User;
use App\Models\CustomerServiceMessage;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Tampilkan halaman utama ringkasan/dashboard Administrator.
     */
    public function index()
    {
        $totalNews = News::count();
        $totalUsers = User::count();
        $totalAdmins = User::where('role', 'admin')->count();
        $unreadCS = CustomerServiceMessage::where('sender', 'user')
            ->where('is_read_by_admin', false)
            ->count();

        $latestNews = News::latest()->take(6)->get();
        $recentMessages = CustomerServiceMessage::where('sender', 'user')
            ->latest()
            ->take(6)
            ->get();

        return view('admin.dashboard', compact(
            'totalNews',
            'totalUsers',
            'totalAdmins',
            'unreadCS',
            'latestNews',
            'recentMessages'
        ));
    }
}


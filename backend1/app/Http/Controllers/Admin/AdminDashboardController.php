<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\Category;
use App\Models\StudyProgram;
use App\Models\User;
use App\Models\CustomerServiceMessage;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Tampilkan halaman utama ringkasan/dashboard Administrator Portal Lomba.
     */
    public function index()
    {
        $totalCompetitions = Competition::count();
        $pendingCompetitions = Competition::where('status', 'pending')->count();
        $approvedCompetitions = Competition::where('status', 'approved')->count();
        $rejectedCompetitions = Competition::where('status', 'rejected')->count();

        $totalCategories = Category::count();
        $totalPrograms = StudyProgram::count();
        $totalUsers = User::count();
        $totalAdmins = User::where('role', 'admin')->count();

        $unreadCS = CustomerServiceMessage::where('sender', 'user')
            ->where('is_read_by_admin', false)
            ->count();

        // Antrean Lomba yang Butuh Verifikasi Cepat
        $pendingList = Competition::where('status', 'pending')
            ->with(['category', 'user'])
            ->latest('id')
            ->take(6)
            ->get();

        // Lomba Terkini
        $latestCompetitions = Competition::with(['category', 'user'])
            ->latest('id')
            ->take(6)
            ->get();

        $recentMessages = CustomerServiceMessage::where('sender', 'user')
            ->latest('id')
            ->take(6)
            ->get();

        return view('admin.dashboard', compact(
            'totalCompetitions',
            'pendingCompetitions',
            'approvedCompetitions',
            'rejectedCompetitions',
            'totalCategories',
            'totalPrograms',
            'totalUsers',
            'totalAdmins',
            'unreadCS',
            'pendingList',
            'latestCompetitions',
            'recentMessages'
        ));
    }
}

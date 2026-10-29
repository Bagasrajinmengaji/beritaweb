<!DOCTYPE html>
<html lang="id" class="h-full bg-slate-900 text-slate-100">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin Panel') — Portal Berita</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        brand: {
                            50: '#fff7ed',
                            100: '#ffedd5',
                            500: '#f97316',
                            600: '#ea580c',
                            700: '#c2410c',
                        }
                    }
                }
            }
        }
    </script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
    @stack('styles')
</head>
<body class="h-full flex overflow-hidden bg-slate-950 text-slate-100 antialiased">

    <!-- SIDEBAR -->
    <aside class="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div>
            <!-- Brand Logo -->
            <div class="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
                <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white font-black text-base shadow-lg shadow-orange-600/30">
                    PB
                </span>
                <div>
                    <h1 class="font-bold text-sm tracking-tight text-white leading-tight">Portal Berita</h1>
                    <span class="text-[11px] font-semibold text-orange-400 uppercase tracking-wider">Admin Panel</span>
                </div>
            </div>

            <!-- Nav Links -->
            <nav class="p-4 space-y-1.5 text-sm font-medium">
                <a href="{{ route('admin.dashboard') }}" 
                   class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors {{ request()->routeIs('admin.dashboard') ? 'bg-orange-600 text-white font-semibold shadow-md shadow-orange-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' }}">
                    <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                    <span>Dashboard</span>
                </a>

                <a href="{{ route('admin.news.index') }}" 
                   class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors {{ request()->routeIs('admin.news.*') ? 'bg-orange-600 text-white font-semibold shadow-md shadow-orange-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' }}">
                    <i data-lucide="newspaper" class="w-4 h-4"></i>
                    <span>Kelola Berita</span>
                </a>

                <a href="{{ route('admin.cs.index') }}" 
                   class="flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors {{ request()->routeIs('admin.cs.*') ? 'bg-orange-600 text-white font-semibold shadow-md shadow-orange-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' }}">
                    <div class="flex items-center gap-3">
                        <i data-lucide="message-square" class="w-4 h-4"></i>
                        <span>Customer Service</span>
                    </div>
                    @php
                        $unreadBadge = \App\Models\CustomerServiceMessage::where('sender', 'user')->where('is_read_by_admin', false)->count();
                    @endphp
                    @if($unreadBadge > 0)
                        <span class="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full animate-pulse">
                            {{ $unreadBadge }}
                        </span>
                    @endif
                </a>
            </nav>
        </div>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-slate-800 space-y-3">
            <!-- External link to user frontend -->
            <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer"
               class="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/70 hover:bg-slate-800 hover:text-orange-400 transition-colors border border-slate-700/60">
                <span class="flex items-center gap-2">
                    <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                    Buka Web Pengguna (FE)
                </span>
                <span class="text-[10px] text-slate-400">Port 3000</span>
            </a>

            <!-- User profile & Logout -->
            <div class="flex items-center justify-between pt-2">
                <div class="flex items-center gap-2.5 truncate">
                    <div class="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs uppercase border border-orange-500/30">
                        {{ substr(auth()->user()->name ?? 'A', 0, 1) }}
                    </div>
                    <div class="truncate text-xs">
                        <p class="font-semibold text-slate-200 truncate">{{ auth()->user()->name ?? 'Administrator' }}</p>
                        <p class="text-slate-500 truncate text-[11px]">{{ auth()->user()->email ?? '' }}</p>
                    </div>
                </div>

                <form action="{{ route('admin.logout') }}" method="POST">
                    @csrf
                    <button type="submit" title="Logout Administrator"
                            class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <i data-lucide="log-out" class="w-4 h-4"></i>
                    </button>
                </form>
            </div>
        </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Header Bar -->
        <header class="h-16 shrink-0 bg-slate-900/60 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6">
            <div class="flex items-center gap-4">
                <h2 class="text-base font-semibold text-white">@yield('page_title', 'Dashboard')</h2>
            </div>

            <div class="flex items-center gap-4 text-xs text-slate-400">
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Backend Aktif (Port 8000)
                </div>
            </div>
        </header>

        <!-- Flash Messages -->
        <div class="px-6 pt-4">
            @if(session('success'))
                <div class="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
                    <i data-lucide="check-circle" class="w-5 h-5 shrink-0 text-emerald-400"></i>
                    <p class="flex-1">{{ session('success') }}</p>
                </div>
            @endif

            @if(session('error'))
                <div class="flex items-center gap-3 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
                    <i data-lucide="alert-circle" class="w-5 h-5 shrink-0 text-rose-400"></i>
                    <p class="flex-1">{{ session('error') }}</p>
                </div>
            @endif
        </div>

        <!-- Scrollable Main View -->
        <main class="flex-1 overflow-y-auto p-6">
            @yield('content')
        </main>
    </div>

    <script>
        lucide.createIcons();
    </script>
    @stack('scripts')
</body>
</html>


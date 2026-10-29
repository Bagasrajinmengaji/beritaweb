import { redirect } from 'next/navigation';

/**
 * Halaman Admin sekarang sepenuhnya dikelola di Laravel Backend (Port 8000).
 * Mengalihkan secara otomatis ke Panel Administrator Backend.
 */
export default function AdminRedirectPage() {
  redirect('http://localhost:8000/admin/login');
}

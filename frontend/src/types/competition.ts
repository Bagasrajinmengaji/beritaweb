export type CompetitionLevel = 
  | 'Internasional' 
  | 'Nasional' 
  | 'Provinsi' 
  | 'Regional' 
  | 'Internal Kampus';

export type ModerationStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type RegistrationStatus = 'Pendaftaran Dibuka' | 'Segera Ditutup' | 'Pendaftaran Ditutup';

export interface Category {
  id: number;
  name: string;
  slug: string;
  competitions_count?: number;
}

export interface StudyProgram {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  competitions_count?: number;
}

export interface Author {
  id: number;
  name: string;
  username?: string | null;
  avatar?: string | null;
}

export interface CompetitionListItem {
  id: number;
  title: string;
  slug: string;
  organizer: string;
  competition_level: CompetitionLevel;
  registration_deadline: string;
  registration_status: RegistrationStatus;
  days_remaining: number;
  registration_fee?: string | null;
  poster_url?: string | null;
  status: ModerationStatus;
  category?: Category | null;
  study_programs?: StudyProgram[];
  created_at?: string;
}

export interface CompetitionDetail extends CompetitionListItem {
  description: string;
  requirements?: string | null;
  registration_url: string;
  contact?: string | null;
  source_url?: string | null;
  rejection_reason?: string | null;
  author?: Author | null;
  published_at?: string | null;
  updated_at?: string | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CompetitionListResponse {
  success: boolean;
  data: CompetitionListItem[];
  meta: PaginationMeta;
}

export interface CompetitionDetailResponse {
  success: boolean;
  data: CompetitionDetail;
}


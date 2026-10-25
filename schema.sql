-- KisanSeva Database Schema
-- Compatible with Supabase / PostgreSQL with Row-Level Security (RLS)

-- 1. Profiles Table (Farmer, Expert, Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'expert', 'admin')),
  state TEXT,
  district TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'hi' CHECK (preferred_language IN ('hi', 'en')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Diagnoses & Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('crop', 'livestock')),
  sub_type TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'AI Diagnosed' CHECK (status IN ('AI Diagnosed', 'Sent to Expert', 'Expert Verified')),
  disease_name_en TEXT NOT NULL,
  disease_name_hi TEXT NOT NULL,
  confidence INT NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'urgent')),
  summary_en TEXT,
  summary_hi TEXT,
  symptoms_seen_en TEXT[] DEFAULT '{}',
  symptoms_seen_hi TEXT[] DEFAULT '{}',
  causes_en TEXT[] DEFAULT '{}',
  causes_hi TEXT[] DEFAULT '{}',
  treatment_steps_en TEXT[] DEFAULT '{}',
  treatment_steps_hi TEXT[] DEFAULT '{}',
  medicine_or_spray_en TEXT[] DEFAULT '{}',
  medicine_or_spray_hi TEXT[] DEFAULT '{}',
  home_remedies_en TEXT[] DEFAULT '{}',
  home_remedies_hi TEXT[] DEFAULT '{}',
  prevention_en TEXT[] DEFAULT '{}',
  prevention_hi TEXT[] DEFAULT '{}',
  when_to_call_expert_en TEXT,
  when_to_call_expert_hi TEXT,
  other_possible_diseases JSONB DEFAULT '[]'::jsonb,
  needs_expert_review BOOLEAN DEFAULT FALSE,
  reason_for_review_en TEXT,
  reason_for_review_hi TEXT,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  expert_review JSONB,
  feedback JSONB
);

-- 3. Veterinarians & Agronomists Directory
CREATE TABLE IF NOT EXISTS public.vets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  qualification TEXT NOT NULL,
  specialisation TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  phone TEXT NOT NULL,
  languages TEXT[] DEFAULT '{"Hindi", "English"}',
  available_hours TEXT DEFAULT '9:00 AM - 6:00 PM',
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  message_en TEXT NOT NULL,
  message_hi TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('urgent', 'expert_reply', 'tip', 'info')),
  report_id TEXT REFERENCES public.reports(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Farmers can view their own reports; Experts and Admins can view all reports
CREATE POLICY "Farmers can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = farmer_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('expert', 'admin')
  ));

CREATE POLICY "Farmers can insert reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Experts and admins can update reports" ON public.reports
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('expert', 'admin')
  ));

-- Directory is public read-only for verified users, admin editable
CREATE POLICY "Public directory read" ON public.vets
  FOR SELECT USING (true);

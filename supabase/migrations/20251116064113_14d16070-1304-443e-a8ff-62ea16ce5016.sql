-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  save_history BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create batch_jobs table
CREATE TABLE IF NOT EXISTS public.batch_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on batch_jobs
ALTER TABLE public.batch_jobs ENABLE ROW LEVEL SECURITY;

-- Batch jobs policies
CREATE POLICY "Users can view their own batch jobs"
  ON public.batch_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own batch jobs"
  ON public.batch_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batch jobs"
  ON public.batch_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all batch jobs"
  ON public.batch_jobs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create batch_items table
CREATE TABLE IF NOT EXISTS public.batch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_job_id UUID REFERENCES public.batch_jobs(id) ON DELETE CASCADE,
  input_text TEXT,
  input_url TEXT,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on batch_items
ALTER TABLE public.batch_items ENABLE ROW LEVEL SECURITY;

-- Batch items policies
CREATE POLICY "Users can view their own batch items"
  ON public.batch_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.batch_jobs
    WHERE batch_jobs.id = batch_items.batch_job_id
    AND batch_jobs.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own batch items"
  ON public.batch_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.batch_jobs
    WHERE batch_jobs.id = batch_items.batch_job_id
    AND batch_jobs.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own batch items"
  ON public.batch_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.batch_jobs
    WHERE batch_jobs.id = batch_items.batch_job_id
    AND batch_jobs.user_id = auth.uid()
  ));

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on contact_submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Contact submissions policies
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all contact submissions"
  ON public.contact_submissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on batch_jobs
CREATE TRIGGER update_batch_jobs_updated_at
  BEFORE UPDATE ON public.batch_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on batch_items
CREATE TRIGGER update_batch_items_updated_at
  BEFORE UPDATE ON public.batch_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
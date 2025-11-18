-- Enable realtime for batch_jobs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_jobs;

-- Ensure analyses table is also available for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.analyses;
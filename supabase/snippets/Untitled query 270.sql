-- 1. Ensure RLS is enabled for the interests table
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy to allow authenticated users to read the interests
-- This is likely what you need since onboarding usually happens after signup
CREATE POLICY "Allow authenticated users to read interests" 
ON public.interests 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. If your onboarding page is accessible BEFORE logging in, 
-- you also need to grant access to anonymous users:
CREATE POLICY "Allow anonymous users to read interests" 
ON public.interests 
FOR SELECT 
TO anon 
USING (true);
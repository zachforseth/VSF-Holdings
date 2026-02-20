-- Run this in your Supabase SQL Editor to fix the API error
ALTER TABLE courier_jobs 
ADD COLUMN package_tier text DEFAULT 'Standard';

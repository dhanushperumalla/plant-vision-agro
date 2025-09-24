// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase configuration - directly configured for this project
const SUPABASE_URL = 'https://gqmctugawbicstrabfha.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxbWN0dWdhd2JpY3N0cmFiZmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNDMwNjksImV4cCI6MjA3MzkxOTA2OX0.JuPIFL4M8B_zGmICLcddN0UYdmHKX3pXVkCzMLh7H-c';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

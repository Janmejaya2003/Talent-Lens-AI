import { createClient } from '@supabase/supabase-js';

// Supabase Credentials from prompt as fallback for immediate functionality
const DEFAULT_URL = "https://whvuijppslqmhmjcsata.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndodnVpanBwc2xxbWhtamNzYXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDkzNjAsImV4cCI6MjA5MjUyNTM2MH0.q2MhMOFeJrY2DS9SlTlAvWhcgDEFR5HoxJPJb1qF7I0";

const getValidConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Check if envUrl exists and looks like a valid URL
  const isValidUrl = (url: string | undefined): url is string => 
    !!url && url.startsWith('http');

  const url = isValidUrl(envUrl) ? envUrl : DEFAULT_URL;
  const key = (envKey && envKey.length > 20) ? envKey : DEFAULT_KEY;

  if (!key.startsWith('ey')) {
    console.warn('Frontend Warning: The Supabase Anon Key provided does not look like a standard JWT (should start with "eyJ"). Check your API settings in Supabase dashboard.');
  }

  return { url, key };
};

const { url, key } = getValidConfig();

export const supabase = createClient(url, key);

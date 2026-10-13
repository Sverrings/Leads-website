import { supabaseBrowser } from './supabase/client';

/** The signed-in client for data calls. Called inside functions, never at import time. */
export const db = () => supabaseBrowser();

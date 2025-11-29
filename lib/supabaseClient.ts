import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'biztrack_sb_url';
const STORAGE_KEY_KEY = 'biztrack_sb_key';

export const getSupabaseConfig = () => {
  const url = localStorage.getItem(STORAGE_KEY_URL);
  const key = localStorage.getItem(STORAGE_KEY_KEY);
  return { url, key };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem(STORAGE_KEY_URL, url);
  localStorage.setItem(STORAGE_KEY_KEY, key);
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
};

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (url && key) {
    return createClient(url, key);
  }
  return null;
};

export const testSupabaseConnection = async (url: string, key: string) => {
  const client = createClient(url, key);
  try {
    // Try to select 1 record. Even if table is empty, it returns success (empty array).
    // If auth fails or table doesn't exist, it throws error.
    const { error } = await client.from('clients').select('id').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    throw error;
  }
};

// Legacy Supabase client file - Disabled to use cPanel MySQL API
export const getSupabaseConfig = () => {
  return { url: null, key: null };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  // No-op
};

export const clearSupabaseConfig = () => {
  // No-op
};

export const getSupabaseClient = () => {
  return null;
};

export const testSupabaseConnection = async (url: string, key: string) => {
  return false;
};

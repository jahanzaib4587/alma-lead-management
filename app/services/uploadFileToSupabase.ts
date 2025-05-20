import { supabase } from './supabaseClient';

export const uploadFileToSupabase = async (file: File, leadId: string): Promise<string> => {
  // Check if Supabase client is available
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${leadId}/${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from('file-storage')
    .upload(fileName, file);

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('file-storage')
    .getPublicUrl(fileName);

  return publicUrl;
}; 
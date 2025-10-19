import { supabase } from './supabaseClient';

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, created_at')
      .order('name', { ascending: true });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, message: error.message, data: [] };
  }
};

/**
 * SUPABASE.JS
 * Khởi tạo Supabase Client an toàn từ Config
 */

let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const url = CONFIG.SUPABASE_URL;
  const key = CONFIG.SUPABASE_ANON_KEY;

  // Kiểm tra xem Supabase CDN đã được nạp và config có hợp lệ không
  if (typeof window.supabase !== 'undefined' && url && key && !url.includes('YOUR_SUPABASE_URL')) {
    try {
      supabaseClient = window.supabase.createClient(url, key);
      console.log('✅ Supabase Client initialized successfully.');
    } catch (err) {
      console.warn('⚠️ Could not initialize Supabase Client:', err.message);
    }
  } else {
    console.warn('⚠️ Supabase credentials not configured or CDN script missing. System will fallback to local sample data.');
  }

  return supabaseClient;
}

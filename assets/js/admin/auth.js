/**
 * ADMIN AUTH.JS
 * Xử lý Supabase Authentication & Bảo vệ Route Admin
 */

const AdminAuth = {
  // Kiểm tra phiên đăng nhập hiện tại
  async getSession() {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data: { session }, error } = await client.auth.getSession();
      if (error) throw error;
      return session;
    } catch (err) {
      console.error('Session check error:', err);
      return null;
    }
  },

  // Bắt buộc đăng nhập - Nếu chưa login thì chuyển tới login.html
  async requireAuth() {
    const session = await this.getSession();
    if (!session) {
      console.warn('🔒 Unauthorized access. Redirecting to login.html...');
      // Tính toán path relative tương thích GitHub Pages
      const isSubDir = window.location.pathname.includes('/admin/');
      const loginUrl = isSubDir ? 'login.html' : './admin/login.html';
      window.location.href = loginUrl;
      return null;
    }
    return session;
  },

  // Thực hiện Đăng nhập
  async login(email, password) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: { message: 'Chưa cấu hình Supabase API Key trong assets/js/config.js' } };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err };
    }
  },

  // Thực hiện Đăng xuất
  async logout() {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    const isSubDir = window.location.pathname.includes('/admin/');
    const loginUrl = isSubDir ? 'login.html' : './admin/login.html';
    window.location.href = loginUrl;
  }
};

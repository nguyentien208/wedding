/**
 * WEDDING-SERVICE.JS
 * Service Layer kết nối Supabase API cho Khách xem Thiệp
 */

const WeddingService = {
  // 1. Lấy thông tin đám cưới theo Slug
  async getWeddingBySlug(slug) {
    let baseData = CONFIG.SAMPLE_DATA.wedding;
    const client = getSupabaseClient();
    
    if (client) {
      try {
        const { data, error } = await client
          .from('weddings')
          .select('*')
          .eq('slug', slug)
          .single();

        if (data) baseData = data;
      } catch (err) {
        console.warn('Fetch wedding exception, using baseData:', err);
      }
    }

    // Gộp dữ liệu tùy chỉnh đã chỉnh sửa từ Admin (nếu có)
    try {
      const stored = localStorage.getItem('wedding_custom_data');
      if (stored) {
        baseData = { ...baseData, ...JSON.parse(stored) };
      }
    } catch (e) {}

    return { data: baseData, error: null };
  },

  // 2. Lấy danh sách Love Story
  async getLoveStories(weddingId) {
    const client = getSupabaseClient();
    if (!client) return { data: CONFIG.SAMPLE_DATA.love_stories, error: null };

    try {
      const { data, error } = await client
        .from('love_stories')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      console.warn('Fetch love_stories error:', err.message);
      return { data: CONFIG.SAMPLE_DATA.love_stories, error: err };
    }
  },

  // 3. Lấy danh sách Sự kiện Lễ Cưới
  async getEvents(weddingId) {
    const client = getSupabaseClient();
    if (!client) return { data: CONFIG.SAMPLE_DATA.events, error: null };

    try {
      const { data, error } = await client
        .from('events')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      console.warn('Fetch events error:', err.message);
      return { data: CONFIG.SAMPLE_DATA.events, error: err };
    }
  },

  // 4. Lấy danh sách Album Ảnh Cưới
  async getGallery(weddingId) {
    const client = getSupabaseClient();
    if (!client) return { data: CONFIG.SAMPLE_DATA.gallery, error: null };

    try {
      const { data, error } = await client
        .from('gallery')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      console.warn('Fetch gallery error:', err.message);
      return { data: CONFIG.SAMPLE_DATA.gallery, error: err };
    }
  },

  // 5. Lấy thông tin Nhạc nền đang bật
  async getMusic(weddingId) {
    const client = getSupabaseClient();
    if (!client) return { data: CONFIG.SAMPLE_DATA.music, error: null };

    try {
      const { data, error } = await client
        .from('music')
        .select('*')
        .eq('wedding_id', weddingId)
        .eq('enabled', true)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data || null, error: null };
    } catch (err) {
      console.warn('Fetch music error:', err.message);
      return { data: CONFIG.SAMPLE_DATA.music, error: err };
    }
  },

  // 6. Lấy thông tin Ngân hàng mừng cưới (Bank accounts)
  async getBankAccounts(weddingId) {
    const client = getSupabaseClient();
    if (!client) {
      // Return structured object from sample data
      return {
        groomBank: CONFIG.SAMPLE_DATA.wedding.groom_bank,
        brideBank: CONFIG.SAMPLE_DATA.wedding.bride_bank,
        groomQr: CONFIG.SAMPLE_DATA.wedding.groom_qr,
        brideQr: CONFIG.SAMPLE_DATA.wedding.bride_qr,
        error: null
      };
    }

    try {
      const { data, error } = await client
        .from('bank_accounts')
        .select('*')
        .eq('wedding_id', weddingId)
        .eq('enabled', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const groomAccount = (data || []).find(a => a.type === 'groom');
      const brideAccount = (data || []).find(a => a.type === 'bride');

      return {
        groomBank: groomAccount ? {
          bank_name: groomAccount.bank_name,
          account_name: groomAccount.account_name,
          account_number: groomAccount.account_number
        } : null,
        brideBank: brideAccount ? {
          bank_name: brideAccount.bank_name,
          account_name: brideAccount.account_name,
          account_number: brideAccount.account_number
        } : null,
        groomQr: groomAccount ? groomAccount.qr_image_url : null,
        brideQr: brideAccount ? brideAccount.qr_image_url : null,
        error: null
      };
    } catch (err) {
      console.warn('Fetch bank_accounts error:', err.message);
      return {
        groomBank: CONFIG.SAMPLE_DATA.wedding.groom_bank,
        brideBank: CONFIG.SAMPLE_DATA.wedding.bride_bank,
        groomQr: CONFIG.SAMPLE_DATA.wedding.groom_qr,
        brideQr: CONFIG.SAMPLE_DATA.wedding.bride_qr,
        error: err
      };
    }
  },

  // 7. Lấy danh sách Lời Chúc đã được duyệt (status = 'approved')
  async getApprovedWishes(weddingId) {
    const client = getSupabaseClient();
    if (!client) return { data: CONFIG.SAMPLE_DATA.wishes, error: null };

    try {
      const { data, error } = await client
        .from('wishes')
        .select('*')
        .eq('wedding_id', weddingId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      console.warn('Fetch approved wishes error:', err.message);
      return { data: CONFIG.SAMPLE_DATA.wishes, error: err };
    }
  },

  // 8. Khách gửi RSVP (Insert)
  async submitRSVP(rsvpData) {
    const client = getSupabaseClient();
    if (!client) {
      console.log('Mock RSVP submit:', rsvpData);
      return { success: true, error: null };
    }

    try {
      const { data, error } = await client
        .from('rsvps')
        .insert([{
          wedding_id: rsvpData.wedding_id,
          guest_name: rsvpData.guest_name,
          phone: rsvpData.phone || null,
          attendance: rsvpData.attendance,
          guest_count: parseInt(rsvpData.guest_count) || 1,
          message: rsvpData.message || null
        }]);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err) {
      console.error('Submit RSVP error:', err);
      return { success: false, error: err };
    }
  },

  // 9. Khách gửi Lời Chúc (Insert với status = 'pending')
  async submitWish(wishData) {
    const client = getSupabaseClient();
    if (!client) {
      console.log('Mock Wish submit:', wishData);
      return { success: true, error: null };
    }

    try {
      const { data, error } = await client
        .from('wishes')
        .insert([{
          wedding_id: wishData.wedding_id,
          guest_name: wishData.guest_name,
          message: wishData.message,
          status: 'pending' // Chờ admin phê duyệt
        }]);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err) {
      console.error('Submit Wish error:', err);
      return { success: false, error: err };
    }
  }
};

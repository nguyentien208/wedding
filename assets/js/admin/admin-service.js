/**
 * ADMIN-SERVICE.JS
 * Service Layer chuyên trách các thao tác CRUD & Storage dành riêng cho Admin
 */

const AdminService = {
  // 1. Storage Upload Helper (Chỉ cho phép file ảnh/âm thanh hợp lệ)
  async uploadFile(bucket, filePath, file) {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase Client chưa được khởi tạo');

    // Sanitization Tên file tránh ký tự đặc biệt
    const cleanPath = filePath.replace(/[^a-zA-Z0-9.\-_/]/g, '_');

    const { data, error } = await client.storage
      .from(bucket)
      .upload(cleanPath, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = client.storage.from(bucket).getPublicUrl(cleanPath);
    return {
      publicUrl: urlData.publicUrl,
      storagePath: cleanPath
    };
  },

  // 2. Storage Delete Helper
  async deleteFile(bucket, filePath) {
    if (!filePath) return;
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client.storage
      .from(bucket)
      .remove([filePath]);

    if (error) console.warn('Warning deleting storage file:', error.message);
  },

  // 3. Cập nhật thông tin Cặp Đôi (Wedding)
  async updateWeddingInfo(id, formData) {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client
          .from('weddings')
          .update({
            groom_name: formData.groom_name,
            bride_name: formData.bride_name,
            groom_title: formData.groom_title || 'Chú Rể',
            bride_title: formData.bride_title || 'Cô Dâu',
            wedding_date: formData.wedding_date,
            hero_title: formData.hero_title,
            intro_text: formData.intro_text,
            description: formData.description,
            video_url: formData.video_url,
            hero_image: formData.hero_image,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase update wedding warning:', err);
      }
    }

    // Luôn lưu bản sao vào localStorage để thiệp hiển thị ngay lập tức
    try {
      const stored = JSON.parse(localStorage.getItem('wedding_custom_data') || '{}');
      const updated = { ...stored, ...formData };
      localStorage.setItem('wedding_custom_data', JSON.stringify(updated));
    } catch (e) {}

    return { success: true };
  },

  // 4. Love Story CRUD
  async createLoveStory(data) {
    const client = getSupabaseClient();
    const { error } = await client.from('love_stories').insert([data]);
    if (error) throw error;
    return true;
  },

  async updateLoveStory(id, data) {
    const client = getSupabaseClient();
    const { error } = await client.from('love_stories').update(data).eq('id', id);
    if (error) throw error;
    return true;
  },

  async deleteLoveStory(id, storagePath) {
    const client = getSupabaseClient();
    if (storagePath) await this.deleteFile('wedding-images', storagePath);
    const { error } = await client.from('love_stories').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // 5. Events CRUD
  async createEvent(data) {
    const client = getSupabaseClient();
    const { error } = await client.from('events').insert([data]);
    if (error) throw error;
    return true;
  },

  async updateEvent(id, data) {
    const client = getSupabaseClient();
    const { error } = await client.from('events').update(data).eq('id', id);
    if (error) throw error;
    return true;
  },

  async deleteEvent(id) {
    const client = getSupabaseClient();
    const { error } = await client.from('events').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // 6. Gallery Multiple Upload & Delete
  async uploadGalleryImages(weddingId, files, caption = '') {
    const client = getSupabaseClient();
    if (!files || files.length === 0) return true;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate loại file & dung lượng (< 10MB)
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File ${file.name} không đúng định dạng ảnh (chấp nhận JPG, PNG, WEBP)`);
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File ${file.name} vượt quá dung lượng 10MB`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `gallery/${weddingId}/${fileName}`;

      const { publicUrl, storagePath } = await this.uploadFile('wedding-images', filePath, file);

      const { error } = await client.from('gallery').insert([{
        wedding_id: weddingId,
        image_url: publicUrl,
        storage_path: storagePath,
        caption: caption,
        sort_order: Date.now() + i
      }]);

      if (error) throw error;
    }
    return true;
  },

  async deleteGalleryImage(id, storagePath) {
    const client = getSupabaseClient();
    if (storagePath) {
      await this.deleteFile('wedding-images', storagePath);
    }
    const { error } = await client.from('gallery').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // 7. RSVP Management
  async getAllRSVPs(weddingId) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('rsvps')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async deleteRSVP(id) {
    const client = getSupabaseClient();
    const { error } = await client.from('rsvps').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // 8. Wishes Management
  async getAllWishes(weddingId) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('wishes')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateWishStatus(id, newStatus) {
    const client = getSupabaseClient();
    const { error } = await client
      .from('wishes')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async deleteWish(id) {
    const client = getSupabaseClient();
    if (client) {
      try { await client.from('wishes').delete().eq('id', id); } catch (e) {}
    }
    return true;
  },

  // 9. Music Management
  async updateMusic(weddingId, musicData) {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('music').upsert([{
          wedding_id: weddingId,
          title: musicData.title,
          audio_url: musicData.audio_url,
          enabled: musicData.enabled
        }]);
      } catch (err) {
        console.warn('Supabase music update warning:', err);
      }
    }

    // Luôn lưu bản sao vào localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('wedding_custom_data') || '{}');
      stored.music = musicData;
      localStorage.setItem('wedding_custom_data', JSON.stringify(stored));
    } catch (e) {}

    return { success: true };
  },

  // 10. Bank & QR Management
  async updateBank(weddingId, bankData) {
    const client = getSupabaseClient();
    if (client) {
      try {
        // Groom Bank
        await client.from('bank_accounts').upsert([{
          wedding_id: weddingId,
          type: 'groom',
          bank_name: bankData.groom_bank.bank_name,
          account_name: bankData.groom_bank.account_name,
          account_number: bankData.groom_bank.account_number,
          qr_image_url: bankData.groom_qr,
          enabled: true
        }]);

        // Bride Bank
        await client.from('bank_accounts').upsert([{
          wedding_id: weddingId,
          type: 'bride',
          bank_name: bankData.bride_bank.bank_name,
          account_name: bankData.bride_bank.account_name,
          account_number: bankData.bride_bank.account_number,
          qr_image_url: bankData.bride_qr,
          enabled: true
        }]);
      } catch (err) {
        console.warn('Supabase bank update warning:', err);
      }
    }

    // Luôn lưu bản sao vào localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('wedding_custom_data') || '{}');
      stored.groom_bank = bankData.groom_bank;
      stored.bride_bank = bankData.bride_bank;
      stored.groom_qr = bankData.groom_qr;
      stored.bride_qr = bankData.bride_qr;
      localStorage.setItem('wedding_custom_data', JSON.stringify(stored));
    } catch (e) {}

    return { success: true };
  }
};


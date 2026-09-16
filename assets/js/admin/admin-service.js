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
    if (!client) return { success: false, error: 'Chưa cấu hình Supabase Client' };

    try {
      const { data, error } = await client
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

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Update wedding error:', err);
      return { success: false, error: err.message };
    }
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
    const { error } = await client.from('wishes').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

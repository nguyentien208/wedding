-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- 1. BẬT RLS CHO TẤT CẢ CÁC BẢNG
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE music ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLICIES DÀNH CHO KHÁCH (ANONYMOUS / PUBLIC)
-- ==========================================

-- BẢNG WEDDINGS: Khách chỉ được xem (SELECT)
CREATE POLICY "Public read access for weddings" 
ON weddings FOR SELECT 
TO public 
USING (true);

-- BẢNG LOVE_STORIES: Khách chỉ được xem (SELECT)
CREATE POLICY "Public read access for love_stories" 
ON love_stories FOR SELECT 
TO public 
USING (true);

-- BẢNG EVENTS: Khách chỉ được xem (SELECT)
CREATE POLICY "Public read access for events" 
ON events FOR SELECT 
TO public 
USING (true);

-- BẢNG GALLERY: Khách chỉ được xem (SELECT)
CREATE POLICY "Public read access for gallery" 
ON gallery FOR SELECT 
TO public 
USING (true);

-- BẢNG MUSIC: Khách chỉ được xem (SELECT)
CREATE POLICY "Public read access for music" 
ON music FOR SELECT 
TO public 
USING (enabled = true);

-- BẢNG BANK_ACCOUNTS: Khách chỉ được xem (SELECT)
CREATE POLICY "Public read access for bank_accounts" 
ON bank_accounts FOR SELECT 
TO public 
USING (enabled = true);

-- BẢNG SETTINGS: Khách chỉ được xem (SELECT)
CREATE POLICY "Public read access for settings" 
ON settings FOR SELECT 
TO public 
USING (true);

-- BẢNG WISHES: Khách chỉ xem lời chúc đã được duyêt (status = 'approved')
CREATE POLICY "Public read approved wishes" 
ON wishes FOR SELECT 
TO public 
USING (status = 'approved');

-- BẢNG WISHES: Khách được phép gửi lời chúc mới (INSERT)
CREATE POLICY "Public insert wishes" 
ON wishes FOR INSERT 
TO public 
WITH CHECK (true);

-- BẢNG RSVPS: Khách được phép gửi xác nhận tham dự (INSERT)
CREATE POLICY "Public insert rsvps" 
ON rsvps FOR INSERT 
TO public 
WITH CHECK (true);

-- (KHÁCH KHÔNG ĐƯỢC XEM/SỬA/XÓA RSVP CỦA NGƯỜI KHÁC; KHÔNG ĐƯỢC SỬA/XÓA LỜI CHÚC)

-- ==========================================
-- POLICIES DÀNH CHO ADMIN (AUTHENTICATED)
-- ==========================================

-- Admin có quyền FULL CRUD trên mọi bảng khi đã đăng nhập (auth.role() = 'authenticated')
CREATE POLICY "Admin full access on weddings" ON weddings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on love_stories" ON love_stories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on events" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on gallery" ON gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on music" ON music FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on bank_accounts" ON bank_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on settings" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on rsvps" ON rsvps FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on wishes" ON wishes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- SUPABASE STORAGE BUCKETS & POLICIES
-- ==========================================

-- Tạo Buckets (Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wedding-images', 'wedding-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('wedding-music', 'wedding-music', true)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage: Cho phép Public xem ảnh và nhạc (SELECT)
CREATE POLICY "Public Read Access Storage Images" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'wedding-images');

CREATE POLICY "Public Read Access Storage Music" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'wedding-music');

-- Policy Storage: Chỉ Authenticated Admin được Upload/Xóa file
CREATE POLICY "Admin Full Access Storage Images" 
ON storage.objects FOR ALL 
TO authenticated 
USING (bucket_id = 'wedding-images') 
WITH CHECK (bucket_id = 'wedding-images');

CREATE POLICY "Admin Full Access Storage Music" 
ON storage.objects FOR ALL 
TO authenticated 
USING (bucket_id = 'wedding-music') 
WITH CHECK (bucket_id = 'wedding-music');

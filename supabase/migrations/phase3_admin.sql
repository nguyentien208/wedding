-- ==========================================
-- PHASE 3 MIGRATION: WEDDING ADMINS & RLS POLICIES
-- ==========================================

-- 1. BẢNG WEDDING_ADMINS (Liên kết User Auth với Wedding được quản lý)
CREATE TABLE IF NOT EXISTS wedding_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'owner' CHECK (role IN ('owner', 'editor')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, wedding_id)
);

-- Bật RLS cho bảng wedding_admins
ALTER TABLE wedding_admins ENABLE ROW LEVEL SECURITY;

-- 2. HÀM KIỂM TRA QUYỀN ADMIN CHO WEDDING (SECURITY DEFINER)
-- Hàm giúp kiểm tra xem user hiện tại có phải admin của wedding_id không
CREATE OR REPLACE FUNCTION is_admin_of_wedding(target_wedding_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM wedding_admins 
    WHERE user_id = auth.uid() 
      AND wedding_id = target_wedding_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. CẬP NHẬT RLS POLICIES CHO ADMIN (AUTHENTICATED & PHÂN QUYỀN THEO WEDDING_ID)

-- Xóa các policy admin cũ nếu có
DROP POLICY IF EXISTS "Admin full access on weddings" ON weddings;
DROP POLICY IF EXISTS "Admin full access on love_stories" ON love_stories;
DROP POLICY IF EXISTS "Admin full access on events" ON events;
DROP POLICY IF EXISTS "Admin full access on gallery" ON gallery;
DROP POLICY IF EXISTS "Admin full access on music" ON music;
DROP POLICY IF EXISTS "Admin full access on bank_accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Admin full access on settings" ON settings;
DROP POLICY IF EXISTS "Admin full access on rsvps" ON rsvps;
DROP POLICY IF EXISTS "Admin full access on wishes" ON wishes;

-- POLICY ADMIN WEDDINGS
CREATE POLICY "Admin CRUD own weddings" 
ON weddings FOR ALL 
TO authenticated 
USING (is_admin_of_wedding(id)) 
WITH CHECK (is_admin_of_wedding(id));

-- POLICY ADMIN LOVE_STORIES
CREATE POLICY "Admin CRUD own love_stories" 
ON love_stories FOR ALL 
TO authenticated 
USING (is_admin_of_wedding(wedding_id)) 
WITH CHECK (is_admin_of_wedding(wedding_id));

-- POLICY ADMIN EVENTS
CREATE POLICY "Admin CRUD own events" 
ON events FOR ALL 
TO authenticated 
USING (is_admin_of_wedding(wedding_id)) 
WITH CHECK (is_admin_of_wedding(wedding_id));

-- POLICY ADMIN GALLERY
CREATE POLICY "Admin CRUD own gallery" 
ON gallery FOR ALL 
TO authenticated 
USING (is_admin_of_wedding(wedding_id)) 
WITH CHECK (is_admin_of_wedding(wedding_id));

-- POLICY ADMIN MUSIC
CREATE POLICY "Admin CRUD own music" 
ON music FOR ALL 
TO authenticated 
USING (is_admin_of_wedding(wedding_id)) 
WITH CHECK (is_admin_of_wedding(wedding_id));

-- POLICY ADMIN BANK_ACCOUNTS
CREATE POLICY "Admin CRUD own bank_accounts" 
ON bank_accounts FOR ALL 
TO authenticated 
USING (is_admin_of_wedding(wedding_id)) 
WITH CHECK (is_admin_of_wedding(wedding_id));

-- POLICY ADMIN SETTINGS
CREATE POLICY "Admin CRUD own settings" 
ON settings FOR ALL 
TO authenticated 
USING (is_admin_of_wedding(wedding_id)) 
WITH CHECK (is_admin_of_wedding(wedding_id));

-- POLICY ADMIN RSVPS
CREATE POLICY "Admin CRUD own rsvps" 
ON rsvps FOR ALL 
TO authenticated 
USING (is_admin_of_wedding(wedding_id)) 
WITH CHECK (is_admin_of_wedding(wedding_id));

-- POLICY ADMIN WISHES
CREATE POLICY "Admin CRUD own wishes" 
ON wishes FOR ALL 
TO authenticated 
USING (is_admin_of_wedding(wedding_id)) 
WITH CHECK (is_admin_of_wedding(wedding_id));

-- POLICY CHO BẢNG WEDDING_ADMINS (User chỉ đọc thông tin phân quyền của chính mình)
CREATE POLICY "User read own admin assignment" 
ON wedding_admins FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

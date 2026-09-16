-- ==========================================
-- SUPABASE DATABASE SCHEMA - WEDDING INVITATION
-- ==========================================

-- Kích hoạt extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BẢNG WEDDINGS (Thông tin chính đám cưới)
CREATE TABLE IF NOT EXISTS weddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    groom_name VARCHAR(100) NOT NULL,
    bride_name VARCHAR(100) NOT NULL,
    groom_title VARCHAR(50) DEFAULT 'Chú Rể',
    bride_title VARCHAR(50) DEFAULT 'Cô Dâu',
    wedding_date TIMESTAMPTZ NOT NULL,
    hero_title VARCHAR(255) DEFAULT 'WE ARE GETTING MARRIED',
    hero_image TEXT,
    intro_title VARCHAR(255) DEFAULT 'THƯƠNG MỜI',
    intro_text TEXT,
    description TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG LOVE_STORIES (Hành trình tình yêu)
CREATE TABLE IF NOT EXISTS love_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    year VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG EVENTS (Thông tin các sự kiện lễ cưới)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    event_date VARCHAR(50) NOT NULL,
    event_time VARCHAR(50) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    map_url TEXT,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'fas fa-heart',
    sort_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG GALLERY (Album ảnh cưới)
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    caption TEXT,
    sort_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG MUSIC (Nhạc nền)
CREATE TABLE IF NOT EXISTS music (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    audio_url TEXT NOT NULL,
    storage_path TEXT,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG BANK_ACCOUNTS (Thông tin mừng cưới & QR Code)
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('groom', 'bride')),
    bank_name VARCHAR(100) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    qr_image_url TEXT,
    qr_storage_path TEXT,
    enabled BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BẢNG SETTINGS (Cài đặt mở rộng cho thiệp)
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(wedding_id, key)
);

-- 8. BẢNG RSVPS (Xác nhận tham dự từ khách)
CREATE TABLE IF NOT EXISTS rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    guest_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    attendance VARCHAR(20) NOT NULL CHECK (attendance IN ('attending', 'not_attending', 'yes', 'no')),
    guest_count INT DEFAULT 1,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BẢNG WISHES (Lời chúc từ khách)
CREATE TABLE IF NOT EXISTS wishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    guest_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- DANH SÁCH INDEX TỐI ƯU QUERY PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_weddings_slug ON weddings(slug);
CREATE INDEX IF NOT EXISTS idx_love_stories_wedding ON love_stories(wedding_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_events_wedding ON events(wedding_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_wedding ON gallery(wedding_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_music_wedding ON music(wedding_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_wedding ON bank_accounts(wedding_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding ON rsvps(wedding_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishes_wedding_status ON wishes(wedding_id, status, created_at DESC);

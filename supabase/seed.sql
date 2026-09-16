-- ==========================================
-- SEED DATA - DỮ LIỆU MẪU ĐÁM CƯỚI
-- ==========================================

-- Reset dữ liệu cũ nếu chạy lại (Tùy chọn)
-- TRUNCATE TABLE weddings CASCADE;

-- 1. CHÈN DỮ LIỆU ĐÁM CƯỚI MẪU
INSERT INTO weddings (
    id, slug, groom_name, bride_name, groom_title, bride_title, 
    wedding_date, hero_title, hero_image, intro_title, intro_text, video_url
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'nguyen-a-nguyen-b',
    'Nguyễn Văn Anh',
    'Trần Thị Ngọc Bích',
    'Chú Rể',
    'Cô Dâu',
    '2026-12-20 11:00:00+07',
    'WE ARE GETTING MARRIED',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    'THƯƠNG MỜI',
    'Trong hành trình dài rộng của cuộc đời, thật may mắn khi chúng mình đã tìm thấy nhau, cùng chia sẻ những vui buồn và đồng điệu trong từng nhịp đập. Ngày hôm nay, với tất cả sự yêu thương và trân trọng, chúng mình xin gửi lời mời trân trọng nhất đến người thân và bạn bè hãy đến chung vui, chứng kiến khoảnh khắc trọng đại khi hai đứa chính thức về chung một nhà.',
    'https://www.youtube.com/embed/dQw4w9WgXcQ'
) ON CONFLICT (slug) DO UPDATE SET 
    groom_name = EXCLUDED.groom_name,
    bride_name = EXCLUDED.bride_name,
    wedding_date = EXCLUDED.wedding_date;

-- 2. CHÈN HÀNH TRÌNH TÌNH YÊU (LOVE STORIES)
INSERT INTO love_stories (wedding_id, year, title, description, image_url, sort_order) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2019', 'Lần Đầu Gặp Nhỡ', 'Một buổi chiều thu Hà Nội tại quán cà phê nhỏ, ánh mắt vô tình chạm nhau mang theo những ngại ngùng ban đầu.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2021', 'Chính Thức Bên Nhau', 'Sau 2 năm là bạn thân, dưới cơn mưa rào mùa hạ, câu tỏ tình chân thành đã bắt đầu một hành trình tình yêu đẹp đẽ.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', 2),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024', 'Lời Cầu Hôn Ngọt Ngào', 'Bên bờ biển chiều hoàng hôn rực rỡ, chiếc nhẫn cầu hôn và câu trả lời "Em đồng ý" rạng rỡ niềm hạnh phúc.', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80', 3),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026', 'Về Chung Một Nhà', 'Hành trình mới mở ra với bao ước mơ, khát vọng xây dựng một mái ấm đong đầy tiếng cười và tình yêu.', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80', 4);

-- 3. CHÈN THÔNG TIN LỄ CƯỚI (EVENTS)
INSERT INTO events (wedding_id, title, event_date, event_time, venue, address, map_url, description, icon, sort_order) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'LỄ VU QUY', '20/12/2026', '08:30', 'Tư Gia Nhà Gái', 'Số 123 Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội', 'https://maps.google.com', 'Đón tiếp quan khách hai họ & thực hiện lễ gia tiên truyền thống.', 'fas fa-home', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'TIỆC CƯỚI CHÍNH THỨC', '20/12/2026', '17:30', 'Trung Tâm Tiệc Cưới Grand Palace', 'Sảnh Diamond - 456 Đường Lê Duẩn, Quận Hoàn Kiếm, Hà Nội', 'https://maps.google.com', 'Khai tiệc mừng chung vui cùng cô dâu chú rể.', 'fas fa-glass-cheers', 2);

-- 4. CHÈN ALBUM ẢNH (GALLERY)
INSERT INTO gallery (wedding_id, image_url, caption, sort_order) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', 'Khoảnh khắc trao nhau ánh mắt ngọt ngào', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80', 'Nụ cười hạnh phúc rạng rỡ', 2),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80', 'Ghi dấu kỷ niệm bên bờ biển', 3),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', 'Bên nhau đến trọn đời', 4),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80', 'Tình yêu dịu dàng như nắng mai', 5);

-- 5. CHÈN NHẠC NỀN (MUSIC)
INSERT INTO music (wedding_id, title, audio_url, enabled) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Love Song', './assets/music/love.mp3', true);

-- 6. CHÈN THÔNG TIN NGÂN HÀNG (BANK ACCOUNTS & QR)
INSERT INTO bank_accounts (wedding_id, type, bank_name, account_name, account_number, qr_image_url, enabled, sort_order) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'groom', 'MB Bank (Ngân hàng Quân Đội)', 'NGUYEN VAN ANH', '1234 5678 9999', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MUNG-CUOI-CHU-RE-NGUYEN-VAN-A-123456789-MBBANK', true, 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'bride', 'Vietcombank', 'TRAN THI NGOC BICH', '9876 5432 1000', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MUNG-CUOI-CO-DAU-TRAN-THI-B-987654321-VIETCOMBANK', true, 2);

-- 7. CHÈN LỜI CHÚC MẪU (WISHES - STATUS APPROVED)
INSERT INTO wishes (wedding_id, guest_name, message, status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Anh Tuấn & Phương Thảo', 'Chúc hai bạn trăm năm hạnh phúc, cùng nhau đi qua mọi bão giông và mãi luôn đong đầy tình yêu!', 'approved'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Hội Bạn Thân Đại Học', 'Chúc mừng cô dâu chú rể xinh đẹp nhất năm! Chúc hai bạn sớm đón thêm thiên thần nhỏ nhé!', 'approved');

-- 8. CHÈN DỮ LIỆU RSVP MẪU (RSVPS)
INSERT INTO rsvps (wedding_id, guest_name, phone, attendance, guest_count, message) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Hoàng Văn Nam', '0901234567', 'attending', 2, 'Rất vinh hạnh được đến tham dự tiệc mừng của hai bạn!'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lê Thị Thu', '0912345678', 'attending', 1, 'Chúc mừng hai bạn nhé!'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Phạm Minh Đức', '0988888888', 'not_attending', 0, 'Mình bị vướng lịch công tác xa, xin gửi lời chúc từ xa tới hai bạn!');

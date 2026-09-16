/**
 * CONFIG.JS - EXACTLY MATCHING GIAODIEN.PNG & SUPABASE CREDENTIALS
 */

const CONFIG = {
  // URL Supabase lấy trực tiếp từ dự án "nguyentien208's Project" của bạn
  SUPABASE_URL: "https://uwfdgqcsfwwqxemponwf.supabase.co",

  // Điền Publishable Key / Anon Key của bạn vào bên dưới:
  SUPABASE_ANON_KEY: "sb_publishable_OcxFGTTerFY1-LlvICDD_A_8ixF15XP",

  DEFAULT_SLUG: "van-tien-thu-ha",

  SAMPLE_DATA: {
    wedding: {
      id: "wedding-sample-giaodien",
      slug: "van-tien-thu-ha",
      groom_name: "Văn Tiến",
      bride_name: "Thu Hà",
      groom_title: "GROOM",
      bride_title: "BRIDE",
      groom_father: "PHẠM VĂN LONG",
      groom_mother: "LÊ THỊ HỒNG",
      bride_father: "VŨ ĐÌNH NAM",
      bride_mother: "TRẦN THÚY HẰNG",
      wedding_date: "2027-04-10T09:30:00",
      ceremony_time: "18:00",
      lunar_date: "Tức ngày 25 tháng 02 năm Đinh Mùi",
      venue_name: "KHÁCH SẠN MIWEDI",
      venue_address: "Khách sạn MiWedi",
      hero_title: "WEDDING",
      hero_image: "./assets/img/banner.webp",
      groom_image: "./assets/img/men.webp",
      bride_image: "./assets/img/girl.webp",
      intro_title: "THƯ MỜI TIỆC CƯỚI",
      intro_text:
        "Chung tay dựng một mái nhà, / Sơn khuya có bạn, đường xa có cùng.",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      groom_qr:
        "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MUNG-CUOI-CHU-RE-VAN-TIEN-MBBANK",
      bride_qr:
        "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MUNG-CUOI-CO-DAU-THU-HA-VIETCOMBANK",
      groom_bank: {
        bank_name: "MB Bank",
        account_name: "VAN TIEN",
        account_number: "1234 5678 9999",
      },
      bride_bank: {
        bank_name: "Vietcombank",
        account_name: "THU HA",
        account_number: "9876 5432 1000",
      },
    },
    love_stories: [
      {
        id: "story-1",
        year: "2020",
        title: "Lần Đầu Gặp Nhỡ",
        description: "Ánh mắt chạm nhau mang theo những rung động ban đầu.",
        image_url:
          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        sort_order: 1,
      },
      {
        id: "story-2",
        year: "2023",
        title: "Lời Cầu Hôn Ngọt Ngào",
        description: 'Bên bờ biển hoàng hôn rực rỡ, câu trả lời "Em đồng ý".',
        image_url:
          "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
        sort_order: 2,
      },
      {
        id: "story-3",
        year: "2027",
        title: "Về Chung Một Nhà",
        description: "Hành trình mới mở ra đong đầy tiếng cười và hạnh phúc.",
        image_url:
          "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
        sort_order: 3,
      },
    ],
    events: [
      {
        id: "event-1",
        title: "THƯ MỜI TIỆC CƯỚI",
        event_date: "10.04.2027",
        event_time: "09:30",
        venue: "Khách sạn MiWedi",
        address: "Khách sạn MiWedi",
        map_url: "https://maps.google.com",
        description: "Đón tiếp quan khách hai họ.",
        icon: "fas fa-glass-cheers",
        sort_order: 1,
      },
      {
        id: "event-2",
        title: "LỄ THÀNH HÔN",
        event_date: "10.04.2027",
        event_time: "18:00",
        venue: "Khách sạn MiWedi",
        address: "Khách sạn MiWedi",
        map_url: "https://maps.google.com",
        description: "Lễ thành hôn chính thức.",
        icon: "fas fa-heart",
        sort_order: 2,
      },
    ],
    gallery: [
      {
        id: "img-1",
        image_url:
          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        caption: "Khoảnh khắc trao nhau ánh mắt ngọt ngào",
        sort_order: 1,
      },
      {
        id: "img-2",
        image_url:
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
        caption: "Nụ cười hạnh phúc rạng rỡ",
        sort_order: 2,
      },
      {
        id: "img-3",
        image_url:
          "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
        caption: "Bên nhau đến trọn đời",
        sort_order: 3,
      },
    ],
    music: {
      title: "Love Song",
      audio_url: "./assets/music/love.mp3",
    },
    wishes: [
      {
        id: "w-1",
        guest_name: "Anh Tuấn & Phương Thảo",
        message: "Chúc Minh Anh & Khánh Huyền trăm năm hạnh phúc!",
        created_at: "2027-04-01 10:00",
      },
    ],
  },
};

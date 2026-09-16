/**
 * MAIN.JS - MATCHING GIAODIEN.PNG EXACTLY
 */

let currentWeddingId = null;
let activeWeddingData = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Show Loading Skeleton
  showPageLoading(true);

  // 2. Get active slug
  const slug = getCurrentWeddingSlug();

  // 3. Fetch Wedding Data
  const weddingRes = await WeddingService.getWeddingBySlug(slug);
  activeWeddingData = weddingRes.data;

  if (activeWeddingData) {
    currentWeddingId = activeWeddingData.id;
    renderWeddingInfo(activeWeddingData);

    // Init real-time countdown
    if (activeWeddingData.wedding_date) {
      initCountdown(activeWeddingData.wedding_date);
    }

    // Render Calendar Overlay (April 2027)
    renderCalendar();

    // Fetch related data in parallel
    const [storiesRes, eventsRes, galleryRes, musicRes, bankRes, wishesRes] = await Promise.all([
      WeddingService.getLoveStories(currentWeddingId),
      WeddingService.getEvents(currentWeddingId),
      WeddingService.getGallery(currentWeddingId),
      WeddingService.getMusic(currentWeddingId),
      WeddingService.getBankAccounts(currentWeddingId),
      WeddingService.getApprovedWishes(currentWeddingId)
    ]);

    renderLoveStory(storiesRes.data);
    renderEvents(eventsRes.data);
    renderGallery(galleryRes.data);
    
    if (musicRes.data && musicRes.data.audio_url) {
      initMusic(musicRes.data.audio_url);
    } else {
      hideMusicControl();
    }

    renderVideo(activeWeddingData.video_url);
    renderBankInfo(bankRes);
    renderWishes(wishesRes.data);
  } else {
    showToast('⚠️ Không tìm thấy thông tin thiệp cưới.');
  }

  // 4. Init AOS animation
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });
  }

  // 5. Setup Form Handlers
  setupFormHandlers();

  // 6. Setup Envelope Handler
  const openEnvelopeBtn = document.getElementById('btn-open-envelope');
  const envelopeOverlay = document.getElementById('envelope-overlay');

  if (openEnvelopeBtn && envelopeOverlay) {
    openEnvelopeBtn.addEventListener('click', () => {
      envelopeOverlay.classList.add('hidden-envelope');
      playWeddingMusic();
    });
  }

  showPageLoading(false);
});

// Page Loader (Hai cánh cửa mở ra & Xoay giữa)
function showPageLoading(isLoading) {
  let loader = document.getElementById('page-loading-skeleton');
  if (isLoading) {
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'page-loading-skeleton';
      loader.innerHTML = `
        <div class="loader-door loader-door-left"></div>
        <div class="loader-door loader-door-right"></div>
        <div class="loader-center-content">
          <div class="loader-disc-wrapper">
            <div class="loader-disc-icon">🎀</div>
          </div>
          <div class="loader-title">ĐANG TẢI THIỆP CƯỚI...</div>
          <div class="loader-subtitle">Minh Anh ❤️ Khánh Huyền</div>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.classList.remove('doors-open');
    loader.style.display = 'flex';
  } else if (loader) {
    loader.classList.add('doors-open');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 850);
  }
}

// Render Main Wedding Info
function renderWeddingInfo(w) {
  if (!w) return;

  // Script Names
  const scriptGroom = document.getElementById('script-groom-name');
  const scriptBride = document.getElementById('script-bride-name');
  if (scriptGroom) scriptGroom.textContent = w.groom_name;
  if (scriptBride) scriptBride.textContent = w.bride_name;

  // Parents Names
  const groomFather = document.getElementById('groom-father');
  const groomMother = document.getElementById('groom-mother');
  const brideFather = document.getElementById('bride-father');
  const brideMother = document.getElementById('bride-mother');
  if (groomFather) groomFather.textContent = w.groom_father || 'PHẠM VĂN LONG';
  if (groomMother) groomMother.textContent = w.groom_mother || 'LÊ THỊ HỒNG';
  if (brideFather) brideFather.textContent = w.bride_father || 'VŨ ĐÌNH NAM';
  if (brideMother) brideMother.textContent = w.bride_mother || 'TRẦN THÚY HẰNG';

  // Venue Names
  const venueGroom = document.getElementById('venue-groom');
  const venueBride = document.getElementById('venue-bride');
  const addressVenue = document.getElementById('address-venue');
  if (venueGroom) venueGroom.textContent = w.venue_name || 'Khách sạn MiWedi';
  if (venueBride) venueBride.textContent = w.venue_name || 'Khách sạn MiWedi';
  if (addressVenue) addressVenue.textContent = w.venue_name || 'KHÁCH SẠN MIWEDI';

  // Main Banner Image
  const heroImg = document.querySelector('.hero-photo-img');
  if (heroImg && w.hero_image) heroImg.src = w.hero_image;

  // Portrait Cards
  const groomPortName = document.getElementById('groom-portrait-name');
  const bridePortName = document.getElementById('bride-portrait-name');
  if (groomPortName) groomPortName.textContent = w.groom_name;
  if (bridePortName) bridePortName.textContent = w.bride_name;

  const groomPortImg = document.getElementById('groom-portrait-img');
  const bridePortImg = document.getElementById('bride-portrait-img');
  if (groomPortImg && w.groom_image) groomPortImg.src = w.groom_image;
  if (bridePortImg && w.bride_image) bridePortImg.src = w.bride_image;

  // Lunar Date & Quote
  const lunarEl = document.getElementById('lunar-date-text');
  if (lunarEl) lunarEl.textContent = w.lunar_date || 'Tức ngày 25 tháng 02 năm Đinh Mùi';
}

// Render Calendar Table for April 2027 (Day 10 Highlighted)
function renderCalendar() {
  const container = document.getElementById('calendar-grid-body');
  if (!container) return;

  // April 2027 starts on Thursday (1st)
  // Calendar Matrix for April 2027
  const matrix = [
    ['', '', '', 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, '', '']
  ];

  container.innerHTML = matrix.map(row => `
    <tr>
      ${row.map(val => {
        if (val === 10) {
          return `<td class="active-wedding-day">${val}</td>`;
        }
        return `<td>${val}</td>`;
      }).join('')}
    </tr>
  `).join('');
}

// Love Story Render
function renderLoveStory(stories) {
  const container = document.getElementById('love-story-container');
  if (!container || !stories || stories.length === 0) return;

  container.innerHTML = stories.map(s => `
    <div class="timeline-item" data-aos="fade-up">
      <div class="timeline-card">
        <span class="timeline-year">${s.year}</span>
        <h4 class="timeline-title">${s.title}</h4>
        ${s.image_url ? `<img src="${s.image_url}" alt="${s.title}" class="timeline-img" loading="lazy">` : ''}
        <p style="font-size: 0.85rem; color: var(--color-text-muted);">${s.description || ''}</p>
      </div>
    </div>
  `).join('');
}

// Events Render
function renderEvents(events) {
  const container = document.getElementById('events-container');
  if (!container || !events || events.length === 0) return;

  container.innerHTML = events.map(e => `
    <div class="event-card" data-aos="zoom-in">
      <div class="event-icon">
        <i class="${e.icon || 'fas fa-heart'}"></i>
      </div>
      <h3 class="event-title">${e.title}</h3>
      <div class="event-detail-row">
        <i class="far fa-calendar-alt text-gold me-2"></i> <strong>${e.event_date}</strong> - <strong>${e.event_time}</strong>
      </div>
      <div class="event-detail-row">
        <i class="fas fa-building text-gold me-2"></i> <strong>${e.venue}</strong>
      </div>
      <div class="event-detail-row" style="color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 16px;">
        <i class="fas fa-map-marker-alt text-gold me-2"></i> ${e.address}
      </div>
      ${e.map_url ? `
        <a href="${e.map_url}" target="_blank" rel="noopener noreferrer" class="btn-primary">
          <i class="fas fa-map-marked-alt"></i> XEM BẢN ĐỒ
        </a>
      ` : ''}
    </div>
  `).join('');
}

// Gallery Swiper Render
function renderGallery(gallery) {
  const wrapper = document.getElementById('swiper-wrapper');
  if (!wrapper || !gallery || gallery.length === 0) return;

  wrapper.innerHTML = gallery.map(img => `
    <div class="swiper-slide">
      <a href="${img.image_url}" data-fancybox="wedding-gallery" data-caption="${img.caption || ''}">
        <img src="${img.image_url}" alt="${img.caption || 'Ảnh cưới'}" class="gallery-slide-img" loading="lazy">
      </a>
    </div>
  `).join('');

  if (typeof Swiper !== 'undefined') {
    new Swiper('.gallery-swiper', {
      slidesPerView: 1,
      spaceBetween: 16,
      loop: gallery.length > 1,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }
}

// Video YouTube Render
function renderVideo(videoUrl) {
  const section = document.getElementById('video-section');
  const iframe = document.getElementById('youtube-iframe');
  if (!section || !iframe) return;

  if (videoUrl && videoUrl.trim()) {
    iframe.src = videoUrl.trim();
    section.style.display = 'block';
  } else {
    section.style.display = 'none';
  }
}

function hideMusicControl() {
  const btn = document.getElementById('music-toggle-btn');
  if (btn) btn.style.display = 'none';
}

// Bank Info & QR Render
function renderBankInfo(bankRes) {
  const groomQr = document.getElementById('qr-groom-img');
  const brideQr = document.getElementById('qr-bride-img');
  const groomBankText = document.getElementById('groom-bank-text');
  const brideBankText = document.getElementById('bride-bank-text');

  if (groomBankText && bankRes.groomBank) {
    if (groomQr && bankRes.groomQr) groomQr.src = bankRes.groomQr;
    groomBankText.innerHTML = `
      <strong>${bankRes.groomBank.bank_name}</strong><br>
      STK: <strong>${bankRes.groomBank.account_number}</strong><br>
      CTK: ${bankRes.groomBank.account_name}
    `;
  }

  if (brideBankText && bankRes.brideBank) {
    if (brideQr && bankRes.brideQr) brideQr.src = bankRes.brideQr;
    brideBankText.innerHTML = `
      <strong>${bankRes.brideBank.bank_name}</strong><br>
      STK: <strong>${bankRes.brideBank.account_number}</strong><br>
      CTK: ${bankRes.brideBank.account_name}
    `;
  }
}

function toggleGiftModal() {
  const content = document.getElementById('gift-content-modal');
  if (content) {
    if (content.style.display === 'none' || !content.style.display) {
      content.style.display = 'block';
      content.scrollIntoView({ behavior: 'smooth' });
    } else {
      content.style.display = 'none';
    }
  }
}

// Render Wishes
function renderWishes(wishes) {
  const container = document.getElementById('wishes-list');
  if (!container) return;

  if (!wishes || wishes.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--color-text-muted); font-size: 0.85rem; padding: 20px;">Những lời chúc yêu thương sẽ được hiển thị tại đây ❤️</div>`;
    return;
  }

  container.innerHTML = wishes.map(w => `
    <div class="wish-item">
      <div class="wish-author"><i class="fas fa-heart text-wine me-1"></i> ${escapeHtml(w.guest_name)}</div>
      <div class="wish-text">${escapeHtml(w.message)}</div>
      <div class="wish-date">${w.created_at ? new Date(w.created_at).toLocaleDateString('vi-VN') : ''}</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}

// Quick Wish Input & Form Handlers
function setupFormHandlers() {
  // Quick Wish Input from Bottom Floating Bar
  const quickInput = document.getElementById('quick-wish-input');
  if (quickInput) {
    quickInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && quickInput.value.trim()) {
        const wishSection = document.getElementById('wishes');
        const wishMsgInput = document.getElementById('wish-message');
        if (wishMsgInput) wishMsgInput.value = quickInput.value.trim();
        if (wishSection) wishSection.scrollIntoView({ behavior: 'smooth' });
        quickInput.value = '';
      }
    });
  }

  // RSVP Form
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!currentWeddingId) {
        showToast('⚠️ Không thể xác định thông tin đám cưới.');
        return;
      }

      const submitBtn = rsvpForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang gửi...`;

      const rsvpData = {
        wedding_id: currentWeddingId,
        guest_name: document.getElementById('rsvp-name').value.trim(),
        phone: document.getElementById('rsvp-phone').value.trim(),
        attendance: document.getElementById('rsvp-attend').value,
        guest_count: document.getElementById('rsvp-count').value,
        message: document.getElementById('rsvp-message').value.trim()
      };

      const result = await WeddingService.submitRSVP(rsvpData);

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      if (result.success) {
        showToast(`Cảm ơn ${rsvpData.guest_name} đã xác nhận tham dự! ❤️`);
        rsvpForm.reset();
      } else {
        showToast('❌ Không thể gửi xác nhận. Vui lòng thử lại.');
      }
    });
  }

  // Wish Form
  const wishForm = document.getElementById('wish-form');
  if (wishForm) {
    wishForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!currentWeddingId) {
        showToast('⚠️ Không thể xác định thông tin đám cưới.');
        return;
      }

      const submitBtn = wishForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang gửi...`;

      const wishData = {
        wedding_id: currentWeddingId,
        guest_name: document.getElementById('wish-name').value.trim(),
        message: document.getElementById('wish-message').value.trim()
      };

      const result = await WeddingService.submitWish(wishData);

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      if (result.success) {
        showToast(`Cảm ơn bạn vì lời chúc yêu thương! (Lời chúc sẽ xuất hiện sau khi được phê duyệt) ❤️`);
        wishForm.reset();
      } else {
        showToast('❌ Gửi lời chúc thất bại. Vui lòng thử lại.');
      }
    });
  }
}

// Share Function
function shareWeddingLink() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      text: 'Trân trọng kính mời bạn đến chung vui cùng gia đình chúng mình!',
      url: window.location.href,
    }).catch(err => console.log('Share canceled:', err));
  } else {
    navigator.clipboard.writeText(window.location.href);
    showToast('Đã sao chép liên kết thiệp cưới! 📋');
  }
}

// Toast Notification
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 50);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Toggle Floating Quick Menu Popup
function toggleQuickMenu() {
  const popup = document.getElementById('quick-menu-popup');
  const btn = document.getElementById('bottom-menu-btn');
  if (!popup) return;

  const isActive = popup.classList.toggle('active');

  if (btn) {
    btn.classList.toggle('active', isActive);
    btn.innerHTML = isActive ? `<i class="fas fa-times"></i>` : `<i class="fas fa-bars"></i>`;
  }
}

// Scroll to section smoothly and close menu
function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
  const popup = document.getElementById('quick-menu-popup');
  const btn = document.getElementById('bottom-menu-btn');
  if (popup) popup.classList.remove('active');
  if (btn) {
    btn.classList.remove('active');
    btn.innerHTML = `<i class="fas fa-bars"></i>`;
  }
}

// Toggle RSVP Modal
function toggleRSVPModal(show = true) {
  const overlay = document.getElementById('rsvp-modal-overlay');
  if (!overlay) return;

  if (show) {
    overlay.classList.add('active');
    const popup = document.getElementById('quick-menu-popup');
    const btn = document.getElementById('bottom-menu-btn');
    if (popup) popup.classList.remove('active');
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = `<i class="fas fa-bars"></i>`;
    }
  } else {
    overlay.classList.remove('active');
  }
}

// Close RSVP Modal when clicking outside modal card
document.addEventListener('click', (e) => {
  const overlay = document.getElementById('rsvp-modal-overlay');
  if (overlay && overlay.classList.contains('active') && e.target === overlay) {
    toggleRSVPModal(false);
  }
});

// Setup RSVP Modal Form Submit
document.addEventListener('DOMContentLoaded', () => {
  const modalForm = document.getElementById('rsvp-modal-form');
  if (modalForm) {
    modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('modal-rsvp-name').value.trim();
      const phone = document.getElementById('modal-rsvp-phone').value.trim();
      const attendRadios = document.getElementsByName('modal_rsvp_attend');
      let attendance = 'attending';
      for (const r of attendRadios) {
        if (r.checked) {
          attendance = r.value;
          break;
        }
      }

      const submitBtn = modalForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerText;
      submitBtn.disabled = true;
      submitBtn.innerText = 'Đang gửi...';

      const rsvpData = {
        wedding_id: currentWeddingId || 'wedding-sample-giaodien',
        guest_name: name,
        phone: phone,
        attendance: attendance,
        guest_count: 1,
        message: null
      };

      const result = await WeddingService.submitRSVP(rsvpData);
      submitBtn.disabled = false;
      submitBtn.innerText = originalText;

      toggleRSVPModal(false);
      modalForm.reset();

      if (result.success) {
        showToast(`Cảm ơn ${name} đã gửi xác nhận tham dự! ❤️`);
      } else {
        showToast('❌ Không thể gửi xác nhận. Vui lòng thử lại.');
      }
    });
  }
});

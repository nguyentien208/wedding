/**
 * ADMIN.JS
 * Điều khiển giao diện Admin Dashboard & Tương tác CRUD các Tab Quản Lý
 */

let activeSession = null;
let currentWedding = null;
let currentRSVPFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Kiểm tra session đăng nhập (bắt buộc)
  activeSession = await AdminAuth.requireAuth();
  if (!activeSession) return;

  // Hiển thị Email Admin
  const emailEl = document.getElementById('admin-user-email');
  if (emailEl) emailEl.textContent = activeSession.user.email;

  // 2. Lấy thông tin Đám cưới mặc định
  const slug = getCurrentWeddingSlug();
  const weddingRes = await WeddingService.getWeddingBySlug(slug);
  currentWedding = weddingRes.data;

  if (currentWedding) {
    // Cập nhật link Xem thiệp
    const previewBtn = document.getElementById('btn-preview-wedding');
    if (previewBtn) {
      previewBtn.href = `../index.html?wedding=${currentWedding.slug}`;
    }

    // Load dữ liệu ban đầu cho Dashboard Overview
    await loadDashboardOverview();
  }

  // 3. Gắn sự kiện chuyển Tab
  setupTabNavigation();

  // 4. Sidebar Mobile Toggle
  const toggleBtn = document.getElementById('admin-toggle-btn');
  const sidebar = document.getElementById('admin-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }

  // 5. Submit Handlers
  const formWedding = document.getElementById('form-wedding-info');
  if (formWedding) formWedding.addEventListener('submit', handleUpdateWedding);

  const formStory = document.getElementById('form-story-modal');
  if (formStory) formStory.addEventListener('submit', handleCreateStory);

  const formEvent = document.getElementById('form-event-modal');
  if (formEvent) formEvent.addEventListener('submit', handleCreateEvent);

  const formMusic = document.getElementById('form-music-info');
  if (formMusic) formMusic.addEventListener('submit', handleUpdateMusic);

  const formBank = document.getElementById('form-bank-info');
  if (formBank) formBank.addEventListener('submit', handleUpdateBank);
});

// Chuyển đổi Tab trong Admin SPA
function setupTabNavigation() {
  const links = document.querySelectorAll('.admin-nav-link[data-tab]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = link.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
}

async function switchTab(tabName) {
  // Cập nhật UI Menu Active
  document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`.admin-nav-link[data-tab="${tabName}"]`);
  if (activeLink) activeLink.classList.add('active');

  // Ẩn tất cả Tab Pane
  document.querySelectorAll('.tab-pane').forEach(pane => pane.style.display = 'none');
  const targetPane = document.getElementById(`tab-${tabName}`);
  if (targetPane) targetPane.style.display = 'block';

  // Dynamic Data Load theo từng Tab
  if (!currentWedding) return;

  switch (tabName) {
    case 'dashboard':
      await loadDashboardOverview();
      break;
    case 'wedding':
      populateWeddingForm();
      break;
    case 'story':
      await loadLoveStoryTable();
      break;
    case 'events':
      await loadEventsTable();
      break;
    case 'gallery':
      await loadGalleryGrid();
      break;
    case 'rsvp':
      await loadRSVPTable();
      break;
    case 'wishes':
      await loadWishesTable();
      break;
    case 'music':
      populateMusicForm();
      break;
    case 'bank':
      populateBankForm();
      break;
  }
}

// 1. DASHBOARD OVERVIEW METRICS
async function loadDashboardOverview() {
  if (!currentWedding) return;

  // Render thông tin cơ bản
  document.getElementById('dash-groom-name').textContent = currentWedding.groom_name;
  document.getElementById('dash-bride-name').textContent = currentWedding.bride_name;
  document.getElementById('dash-wedding-date').textContent = new Date(currentWedding.wedding_date).toLocaleString('vi-VN');
  document.getElementById('dash-wedding-slug').textContent = currentWedding.slug;

  // Lấy dữ liệu thống kê RSVP & Wishes
  const [rsvps, wishes] = await Promise.all([
    AdminService.getAllRSVPs(currentWedding.id),
    AdminService.getAllWishes(currentWedding.id)
  ]);

  const totalRSVP = rsvps.length;
  const attendingGuests = rsvps
    .filter(r => r.attendance === 'attending' || r.attendance === 'yes')
    .reduce((sum, r) => sum + (r.guest_count || 1), 0);
  const notAttendingCount = rsvps
    .filter(r => r.attendance === 'not_attending' || r.attendance === 'no').length;

  document.getElementById('metric-rsvp-count').textContent = totalRSVP;
  document.getElementById('metric-guest-count').textContent = attendingGuests;
  document.getElementById('metric-not-attend-count').textContent = notAttendingCount;
  document.getElementById('metric-wishes-count').textContent = wishes.length;
}

// 2. CẶP ĐÔI (WEDDING FORM)
function populateWeddingForm() {
  if (!currentWedding) currentWedding = CONFIG.SAMPLE_DATA.wedding;
  
  const gName = document.getElementById('edit-groom-name');
  const bName = document.getElementById('edit-bride-name');
  const dateEl = document.getElementById('edit-wedding-date');
  const videoEl = document.getElementById('edit-video-url');
  const introEl = document.getElementById('edit-intro-text');

  if (gName) gName.value = currentWedding.groom_name || 'Văn Tiến';
  if (bName) bName.value = currentWedding.bride_name || 'Thu Hà';

  if (dateEl && currentWedding.wedding_date) {
    try {
      const d = new Date(currentWedding.wedding_date);
      if (!isNaN(d.getTime())) {
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        dateEl.value = d.toISOString().slice(0, 16);
      }
    } catch (e) {
      console.warn('Date format warning:', e);
    }
  }

  if (videoEl) videoEl.value = currentWedding.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  if (introEl) introEl.value = currentWedding.intro_text || currentWedding.description || 'Chung tay dựng một mái nhà, / Sơn khuya có bạn, đường xa có cùng.';
}

async function handleUpdateWedding(e) {
  e.preventDefault();
  if (!currentWedding) currentWedding = CONFIG.SAMPLE_DATA.wedding;

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang lưu...`;
  }

  try {
    const rawDate = document.getElementById('edit-wedding-date').value;
    let weddingDateIso = currentWedding.wedding_date || new Date().toISOString();
    
    if (rawDate) {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        weddingDateIso = parsedDate.toISOString();
      }
    }

    const updatedData = {
      groom_name: document.getElementById('edit-groom-name').value.trim() || 'Văn Tiến',
      bride_name: document.getElementById('edit-bride-name').value.trim() || 'Thu Hà',
      wedding_date: weddingDateIso,
      video_url: document.getElementById('edit-video-url').value.trim(),
      intro_text: document.getElementById('edit-intro-text').value.trim(),
      description: document.getElementById('edit-intro-text').value.trim(),
      hero_title: 'WE ARE GETTING MARRIED',
      hero_image: currentWedding.hero_image || './assets/img/banner.webp'
    };

    const res = await AdminService.updateWeddingInfo(currentWedding.id, updatedData);

    if (res.success) {
      showToast('Đã lưu thay đổi thông tin Cặp đôi thành công! ❤️');
      currentWedding = { ...currentWedding, ...updatedData };
      loadDashboardOverview();
    } else {
      showToast(`❌ Có lỗi xảy ra: ${res.error || 'Vui lòng thử lại'}`);
    }
  } catch (err) {
    console.error('handleUpdateWedding exception:', err);
    showToast(`❌ Lỗi lưu dữ liệu: ${err.message}`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fas fa-save"></i> LƯU THAY ĐỔI ❤️`;
    }
  }
}

// 3. LOVE STORY TABLE
async function loadLoveStoryTable() {
  const container = document.getElementById('admin-story-table-body');
  if (!container || !currentWedding) return;

  const res = await WeddingService.getLoveStories(currentWedding.id);
  const stories = res.data || [];

  if (stories.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-text-muted);">Chưa có mốc thời gian nào</td></tr>`;
    return;
  }

  container.innerHTML = stories.map(s => `
    <tr>
      <td><strong>${s.year}</strong></td>
      <td>${escapeHtml(s.title)}</td>
      <td style="max-width: 280px;">${escapeHtml(s.description)}</td>
      <td>${s.image_url ? `<img src="${s.image_url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">` : 'Không có'}</td>
      <td>
        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteStoryItem('${s.id}', '${s.storage_path || ''}')">
          <i class="fas fa-trash"></i> Xóa
        </button>
      </td>
    </tr>
  `).join('');
}

function deleteStoryItem(id, storagePath) {
  openConfirmModal('Bạn có chắc chắn muốn xóa mốc kỷ niệm này?', async () => {
    await AdminService.deleteLoveStory(id, storagePath);
    showToast('Đã xóa mốc kỷ niệm thành công!');
    await loadLoveStoryTable();
  });
}

// 4. EVENTS TABLE
async function loadEventsTable() {
  const container = document.getElementById('admin-events-table-body');
  if (!container || !currentWedding) return;

  const res = await WeddingService.getEvents(currentWedding.id);
  const events = res.data || [];

  if (events.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-text-muted);">Chưa có sự kiện nào</td></tr>`;
    return;
  }

  container.innerHTML = events.map(e => `
    <tr>
      <td><strong>${escapeHtml(e.title)}</strong></td>
      <td>${e.event_date} - ${e.event_time}</td>
      <td>${escapeHtml(e.venue)}</td>
      <td>${escapeHtml(e.address)}</td>
      <td>
        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteEventItem('${e.id}')">
          <i class="fas fa-trash"></i> Xóa
        </button>
      </td>
    </tr>
  `).join('');
}

function deleteEventItem(id) {
  openConfirmModal('Bạn có chắc muốn xóa sự kiện này?', async () => {
    await AdminService.deleteEvent(id);
    showToast('Đã xóa sự kiện thành công!');
    await loadEventsTable();
  });
}

// 5. GALLERY GRID & UPLOAD
async function loadGalleryGrid() {
  const container = document.getElementById('gallery-grid');
  if (!container || !currentWedding) return;

  const res = await WeddingService.getGallery(currentWedding.id);
  const gallery = res.data || [];

  if (gallery.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--admin-text-muted); padding: 40px;">Chưa có ảnh cưới nào trong album</div>`;
    return;
  }

  container.innerHTML = gallery.map(img => `
    <div style="position: relative; border-radius: 8px; overflow: hidden; border: 1px solid var(--admin-border); background: #fff;">
      <img src="${img.image_url}" style="width: 100%; height: 140px; object-fit: cover;">
      <div style="padding: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.75rem; color: var(--admin-text-muted);">${img.caption || 'Ảnh cưới'}</span>
        <button class="btn-admin btn-admin-danger btn-sm" style="padding: 4px 8px;" onclick="deleteGalleryItem('${img.id}', '${img.storage_path || ''}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

async function handleGalleryUpload(input) {
  if (!input.files || input.files.length === 0 || !currentWedding) return;

  try {
    showToast('Đang upload ảnh lên Supabase Storage... ⏳');
    await AdminService.uploadGalleryImages(currentWedding.id, input.files);
    showToast('Upload album ảnh thành công! ❤️');
    input.value = '';
    await loadGalleryGrid();
  } catch (err) {
    showToast(`❌ Lỗi upload: ${err.message}`);
  }
}

function deleteGalleryItem(id, storagePath) {
  openConfirmModal('Bạn có chắc muốn xóa ảnh này khỏi Album?', async () => {
    await AdminService.deleteGalleryImage(id, storagePath);
    showToast('Đã xóa ảnh khỏi album!');
    await loadGalleryGrid();
  });
}

// 6. RSVP TABLE
async function loadRSVPTable() {
  const container = document.getElementById('admin-rsvp-table-body');
  if (!container || !currentWedding) return;

  const rsvps = await AdminService.getAllRSVPs(currentWedding.id);
  
  let filtered = rsvps;
  if (currentRSVPFilter === 'attending') {
    filtered = rsvps.filter(r => r.attendance === 'attending' || r.attendance === 'yes');
  } else if (currentRSVPFilter === 'not_attending') {
    filtered = rsvps.filter(r => r.attendance === 'not_attending' || r.attendance === 'no');
  }

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--admin-text-muted);">Không có dữ liệu RSVP</td></tr>`;
    return;
  }

  container.innerHTML = filtered.map(r => `
    <tr>
      <td><strong>${escapeHtml(r.guest_name)}</strong></td>
      <td>${r.phone || '--'}</td>
      <td>
        ${(r.attendance === 'attending' || r.attendance === 'yes') 
          ? '<span class="badge badge-success">Có Tham Dự</span>' 
          : '<span class="badge badge-danger">Không Tham Dự</span>'}
      </td>
      <td>${r.guest_count || 1} người</td>
      <td style="max-width: 240px;">${escapeHtml(r.message || '--')}</td>
      <td>${new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
      <td>
        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteRSVPItem('${r.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function filterRSVP(type) {
  currentRSVPFilter = type;
  loadRSVPTable();
}

function deleteRSVPItem(id) {
  openConfirmModal('Xóa xác nhận RSVP này?', async () => {
    await AdminService.deleteRSVP(id);
    showToast('Đã xóa RSVP!');
    await loadRSVPTable();
  });
}

// 7. WISHES TABLE (APPROVE / HIDE / DELETE)
async function loadWishesTable() {
  const container = document.getElementById('admin-wishes-table-body');
  if (!container || !currentWedding) return;

  const wishes = await AdminService.getAllWishes(currentWedding.id);

  if (wishes.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-text-muted);">Chưa có lời chúc nào</td></tr>`;
    return;
  }

  container.innerHTML = wishes.map(w => `
    <tr>
      <td><strong>${escapeHtml(w.guest_name)}</strong></td>
      <td style="max-width: 300px;">${escapeHtml(w.message)}</td>
      <td>
        ${w.status === 'approved' ? '<span class="badge badge-success">Đã duyệt</span>' : ''}
        ${w.status === 'pending' ? '<span class="badge badge-warning">Chờ duyệt</span>' : ''}
        ${w.status === 'hidden' ? '<span class="badge badge-danger">Đã ẩn</span>' : ''}
      </td>
      <td>${new Date(w.created_at).toLocaleDateString('vi-VN')}</td>
      <td>
        ${w.status !== 'approved' ? `
          <button class="btn-admin btn-admin-primary btn-sm" onclick="changeWishStatus('${w.id}', 'approved')">
            <i class="fas fa-check"></i> Duyệt
          </button>
        ` : ''}
        ${w.status === 'approved' ? `
          <button class="btn-admin btn-admin-secondary btn-sm" onclick="changeWishStatus('${w.id}', 'hidden')">
            <i class="fas fa-eye-slash"></i> Ẩn
          </button>
        ` : ''}
        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteWishItem('${w.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function changeWishStatus(id, newStatus) {
  await AdminService.updateWishStatus(id, newStatus);
  showToast('Cập nhật trạng thái lời chúc thành công!');
  await loadWishesTable();
}

function deleteWishItem(id) {
  openConfirmModal('Bạn có chắc muốn xóa lời chúc này?', async () => {
    await AdminService.deleteWish(id);
    showToast('Đã xóa lời chúc!');
    await loadWishesTable();
  });
}

// UTILITY MODAL & TOAST
let confirmCallback = null;

function openConfirmModal(msg, onOk) {
  const modal = document.getElementById('confirm-modal');
  const msgEl = document.getElementById('confirm-modal-msg');
  const okBtn = document.getElementById('confirm-modal-ok-btn');

  if (!modal) return;
  msgEl.textContent = msg;
  confirmCallback = onOk;

  okBtn.onclick = async () => {
    if (confirmCallback) await confirmCallback();
    closeConfirmModal();
  };

  modal.classList.add('active');
}

function closeConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  if (modal) modal.classList.remove('active');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: var(--admin-primary);
    color: #fff; padding: 12px 20px; border-radius: 8px; font-size: 0.85rem;
    font-weight: 600; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); z-index: 99999;
  `;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// 8. LOVE STORY MODAL HANDLERS
function openStoryModal() {
  const modal = document.getElementById('modal-story');
  if (modal) modal.classList.add('active');
}

function closeStoryModal() {
  const modal = document.getElementById('modal-story');
  if (modal) modal.classList.remove('active');
}

async function handleCreateStory(e) {
  e.preventDefault();
  if (!currentWedding) return;

  const data = {
    wedding_id: currentWedding.id,
    year: document.getElementById('modal-story-year').value.trim(),
    title: document.getElementById('modal-story-title').value.trim(),
    description: document.getElementById('modal-story-desc').value.trim(),
    image_url: document.getElementById('modal-story-img').value.trim() || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    sort_order: Date.now()
  };

  try {
    await AdminService.createLoveStory(data);
    showToast('Đã thêm mốc thời gian thành công! ❤️');
    closeStoryModal();
    e.target.reset();
    await loadLoveStoryTable();
  } catch (err) {
    showToast(`❌ Lỗi thêm mốc thời gian: ${err.message}`);
  }
}

// 9. EVENT MODAL HANDLERS
function openEventModal() {
  const modal = document.getElementById('modal-event');
  if (modal) modal.classList.add('active');
}

function closeEventModal() {
  const modal = document.getElementById('modal-event');
  if (modal) modal.classList.remove('active');
}

async function handleCreateEvent(e) {
  e.preventDefault();
  if (!currentWedding) return;

  const data = {
    wedding_id: currentWedding.id,
    title: document.getElementById('modal-event-title').value.trim(),
    event_date: document.getElementById('modal-event-date').value.trim(),
    event_time: document.getElementById('modal-event-time').value.trim(),
    venue: document.getElementById('modal-event-venue').value.trim(),
    address: document.getElementById('modal-event-address').value.trim(),
    description: document.getElementById('modal-event-desc').value.trim(),
    icon: 'fas fa-heart',
    sort_order: Date.now()
  };

  try {
    await AdminService.createEvent(data);
    showToast('Đã thêm sự kiện lễ cưới thành công! ❤️');
    closeEventModal();
    e.target.reset();
    await loadEventsTable();
  } catch (err) {
    showToast(`❌ Lỗi thêm sự kiện: ${err.message}`);
  }
}

// 10. MUSIC FORM HANDLERS
function populateMusicForm() {
  const titleEl = document.getElementById('edit-music-title');
  const urlEl = document.getElementById('edit-music-url');
  const enabledEl = document.getElementById('edit-music-enabled');

  if (titleEl) titleEl.value = 'Love Song';
  if (urlEl) urlEl.value = './assets/music/love.mp3';
  if (enabledEl) enabledEl.checked = true;
}

async function handleUpdateMusic(e) {
  e.preventDefault();
  if (!currentWedding) return;

  const musicData = {
    title: document.getElementById('edit-music-title').value.trim(),
    audio_url: document.getElementById('edit-music-url').value.trim(),
    enabled: document.getElementById('edit-music-enabled').checked
  };

  await AdminService.updateMusic(currentWedding.id, musicData);
  showToast('Đã lưu cài đặt nhạc nền thành công! 🎵');
}

// 11. BANK & QR FORM HANDLERS
function populateBankForm() {
  const gName = document.getElementById('edit-groom-bank-name');
  const gAcc = document.getElementById('edit-groom-acc-name');
  const gNum = document.getElementById('edit-groom-acc-num');
  const gQr = document.getElementById('edit-groom-qr-url');

  const bName = document.getElementById('edit-bride-bank-name');
  const bAcc = document.getElementById('edit-bride-acc-name');
  const bNum = document.getElementById('edit-bride-acc-num');
  const bQr = document.getElementById('edit-bride-qr-url');

  if (gName) gName.value = 'MB Bank';
  if (gAcc) gAcc.value = 'VAN TIEN';
  if (gNum) gNum.value = '1234 5678 9999';
  if (gQr) gQr.value = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MUNG-CUOI-CHU-RE-VAN-TIEN-MBBANK';

  if (bName) bName.value = 'Vietcombank';
  if (bAcc) bAcc.value = 'THU HA';
  if (bNum) bNum.value = '9876 5432 1000';
  if (bQr) bQr.value = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MUNG-CUOI-CO-DAU-THU-HA-VIETCOMBANK';
}

async function handleUpdateBank(e) {
  e.preventDefault();
  if (!currentWedding) return;

  const bankData = {
    groom_bank: {
      bank_name: document.getElementById('edit-groom-bank-name').value.trim(),
      account_name: document.getElementById('edit-groom-acc-name').value.trim(),
      account_number: document.getElementById('edit-groom-acc-num').value.trim()
    },
    groom_qr: document.getElementById('edit-groom-qr-url').value.trim(),
    bride_bank: {
      bank_name: document.getElementById('edit-bride-bank-name').value.trim(),
      account_name: document.getElementById('edit-bride-acc-name').value.trim(),
      account_number: document.getElementById('edit-bride-acc-num').value.trim()
    },
    bride_qr: document.getElementById('edit-bride-qr-url').value.trim()
  };

  await AdminService.updateBank(currentWedding.id, bankData);
  showToast('Đã lưu thông tin chuyển khoản & QR mừng cưới! 💳');
}


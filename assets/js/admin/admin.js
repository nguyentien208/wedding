/**
 * ADMIN.JS
 * Điều khiển giao diện Admin Dashboard & Tương tác CRUD các Tab Quản Lý
 */

let activeSession = null;
let currentWedding = null;
let currentRSVPFilter = "all";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Kiểm tra session đăng nhập (bắt buộc)
  activeSession = await AdminAuth.requireAuth();
  if (!activeSession) return;

  // Hiển thị Email Admin
  const emailEl = document.getElementById("admin-user-email");
  if (emailEl) emailEl.textContent = activeSession.user.email;

  // 2. Load danh sách Thiệp Cưới & chọn Thiệp hiện tại
  await loadWeddingCardsSelector();

  // 3. Gắn sự kiện chuyển Tab
  setupTabNavigation();

  // 4. Sidebar Mobile Toggle
  const toggleBtn = document.getElementById("admin-toggle-btn");
  const sidebar = document.getElementById("admin-sidebar");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("show");
    });
  }

  // 5. Submit Handlers
  const formWedding = document.getElementById("form-wedding-info");
  if (formWedding) formWedding.addEventListener("submit", handleUpdateWedding);

  const formNewWedding = document.getElementById("form-new-wedding");
  if (formNewWedding)
    formNewWedding.addEventListener("submit", handleCreateNewWedding);

  const formStory = document.getElementById("form-story-modal");
  if (formStory) formStory.addEventListener("submit", handleCreateStory);

  const formEvent = document.getElementById("form-event-modal");
  if (formEvent) formEvent.addEventListener("submit", handleCreateEvent);

  const formMusic = document.getElementById("form-music-info");
  if (formMusic) formMusic.addEventListener("submit", handleUpdateMusic);

  const formBank = document.getElementById("form-bank-info");
  if (formBank) formBank.addEventListener("submit", handleUpdateBank);
});

// MULTI-WEDDING CARD MANAGEMENT
let allWeddingCards = [];

async function loadWeddingCardsSelector(selectSlug = null) {
  const selector = document.getElementById("admin-wedding-selector");
  if (!selector) return;

  allWeddingCards = await AdminService.getAllWeddings();

  if (allWeddingCards.length === 0) {
    allWeddingCards = [CONFIG.SAMPLE_DATA.wedding];
  }

  selector.innerHTML = allWeddingCards
    .map(
      (c) => `
    <option value="${c.slug}">${escapeHtml(c.groom_name)} ❤️ ${escapeHtml(c.bride_name)} (${c.slug})</option>
  `,
    )
    .join("");

  const targetSlug =
    selectSlug || getCurrentWeddingSlug() || allWeddingCards[0].slug;
  selector.value = targetSlug;

  await switchActiveWeddingCard(targetSlug);
}

async function switchActiveWeddingCard(slug) {
  const weddingRes = await WeddingService.getWeddingBySlug(slug);
  currentWedding = weddingRes.data;

  if (currentWedding) {
    const previewBtn = document.getElementById("btn-preview-wedding");
    if (previewBtn) {
      previewBtn.href = `../index.html?wedding=${currentWedding.slug}`;
    }
    updateShareLinkAndQR(currentWedding.slug);
  }

  const activeLink = document.querySelector(".admin-nav-link.active");
  const activeTab = activeLink
    ? activeLink.getAttribute("data-tab")
    : "dashboard";
  await switchTab(activeTab);
}

let qrCodeStylingInstance = null;

function updateShareLinkAndQR(slug) {
  let baseUrl =
    window.location.origin +
    window.location.pathname.replace(/\/admin\/(index\.html)?$/i, "");
  if (!baseUrl.endsWith("/")) baseUrl += "/";
  const fullShareUrl = `${baseUrl}index.html?wedding=${slug}`;

  const urlInput = document.getElementById("share-card-url-input");
  if (urlInput) urlInput.value = fullShareUrl;

  customizeQRCode();
}

function customizeQRCode() {
  const urlInput = document.getElementById("share-card-url-input");
  const fullShareUrl = urlInput ? urlInput.value : window.location.href;

  const dotsColor =
    document.getElementById("qr-color-dots")?.value || "#8B1E3F";
  const bgColor = document.getElementById("qr-color-bg")?.value || "#FFFFFF";
  const dotsStyle =
    document.getElementById("qr-style-dots")?.value || "rounded";
  const cornersStyle =
    document.getElementById("qr-style-corners")?.value || "dot";
  const shapeFrame =
    document.getElementById("qr-shape-frame")?.value || "heart";

  const container = document.getElementById("share-card-qr-canvas");
  if (!container) return;

  container.innerHTML = "";

  if (typeof QRCodeStyling !== "undefined") {
    qrCodeStylingInstance = new QRCodeStyling({
      width: 400,
      height: 400,
      type: "canvas",
      data: fullShareUrl,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H",
      },
      dotsOptions: {
        color: dotsColor,
        type: dotsStyle,
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        color: dotsColor,
        type: cornersStyle === "dot" ? "extra-rounded" : "square",
      },
      cornersDotOptions: {
        color: dotsColor,
        type: cornersStyle,
      },
    });

    qrCodeStylingInstance.append(container);

    // If Heart shape or Circle shape selected, apply mask after render
    setTimeout(() => {
      applyShapeMaskToCanvas(container, shapeFrame, 300, bgColor);
    }, 50);
  } else {
    // Fallback if library didn't load
    const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullShareUrl)}`;
    container.innerHTML = `<img src="${fallbackUrl}" style="width:100%; height:100%; border-radius:8px;">`;
  }
}

function drawHeartQRComposition(
  targetCanvas,
  qrCanvas,
  dotsColor,
  bgColor,
  size,
) {
  targetCanvas.width = size;
  targetCanvas.height = size;
  const ctx = targetCanvas.getContext("2d");

  // Clear background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // 1. Draw Heart Path Mask
  ctx.save();
  ctx.beginPath();
  const w = size;
  const h = size;

  // Perfect Heart Geometry
  ctx.moveTo(w / 2, h * 0.92);
  ctx.bezierCurveTo(
    w * 0.04,
    h * 0.58,
    w * -0.05,
    h * 0.22,
    w * 0.26,
    h * 0.06,
  );
  ctx.bezierCurveTo(w * 0.43, h * -0.02, w / 2, h * 0.16, w / 2, h * 0.24);
  ctx.bezierCurveTo(w / 2, h * 0.16, w * 0.57, h * -0.02, w * 0.74, h * 0.06);
  ctx.bezierCurveTo(w * 1.05, h * 0.22, w * 0.96, h * 0.58, w / 2, h * 0.92);
  ctx.closePath();

  // Clip everything inside the Heart
  ctx.clip();

  // Fill Background inside heart
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // 2. Fill background area with aesthetic decorative QR dots (Filler modules)
  ctx.fillStyle = dotsColor;
  const tileSize = Math.max(4, Math.round(size / 48));
  for (let y = 0; y < size; y += tileSize) {
    for (let x = 0; x < size; x += tileSize) {
      // Random pseudo decorative pattern
      const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const pseudoRandom = hash - Math.floor(hash);
      if (pseudoRandom > 0.42) {
        ctx.beginPath();
        if (pseudoRandom > 0.75) {
          ctx.arc(
            x + tileSize / 2,
            y + tileSize / 2,
            tileSize * 0.42,
            0,
            Math.PI * 2,
          );
        } else {
          ctx.rect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);
        }
        ctx.fill();
      }
    }
  }

  // 3. Draw real scannable QR Code rotated 45 degrees in the center
  ctx.save();
  ctx.translate(w / 2, h * 0.54);
  ctx.rotate(Math.PI / 4); // Rotate 45 degrees (Diamond stance)

  const qrDrawSize = Math.round(size * 0.52);

  // Draw white padding / border behind central QR
  ctx.fillStyle = bgColor;
  const pad = Math.round(qrDrawSize * 0.06);
  ctx.fillRect(
    -qrDrawSize / 2 - pad,
    -qrDrawSize / 2 - pad,
    qrDrawSize + pad * 2,
    qrDrawSize + pad * 2,
  );

  // Draw the real QR Code
  ctx.drawImage(
    qrCanvas,
    -qrDrawSize / 2,
    -qrDrawSize / 2,
    qrDrawSize,
    qrDrawSize,
  );

  ctx.restore(); // Restore 45 deg rotation
  ctx.restore(); // Restore Clip & Translate
}

function applyShapeMaskToCanvas(container, shape, displaySize, bgColor) {
  const sourceCanvas = container.querySelector("canvas");
  if (!sourceCanvas) return;

  if (shape === "square") return;

  const dotsColor =
    document.getElementById("qr-color-dots")?.value || "#8B1E3F";
  const width = sourceCanvas.width;

  if (shape === "heart") {
    const artCanvas = document.createElement("canvas");
    drawHeartQRComposition(artCanvas, sourceCanvas, dotsColor, bgColor, width);
    container.innerHTML = "";
    container.appendChild(artCanvas);
  } else if (shape === "circle") {
    const maskedCanvas = document.createElement("canvas");
    maskedCanvas.width = width;
    maskedCanvas.height = width;
    const ctx = maskedCanvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(width / 2, width / 2, width / 2 - 4, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(sourceCanvas, 0, 0);
    container.innerHTML = "";
    container.appendChild(maskedCanvas);
  }
}

function downloadCardQRCode() {
  const currentSlug = currentWedding ? currentWedding.slug : "wedding";
  const urlInput = document.getElementById("share-card-url-input");
  const fullShareUrl = urlInput ? urlInput.value : window.location.href;

  const dotsColor =
    document.getElementById("qr-color-dots")?.value || "#8B1E3F";
  const bgColor = document.getElementById("qr-color-bg")?.value || "#FFFFFF";
  const dotsStyle =
    document.getElementById("qr-style-dots")?.value || "rounded";
  const cornersStyle =
    document.getElementById("qr-style-corners")?.value || "dot";
  const shapeFrame =
    document.getElementById("qr-shape-frame")?.value || "heart";
  const exportSize = parseInt(
    document.getElementById("qr-export-size")?.value || "1000",
    10,
  );

  if (typeof QRCodeStyling !== "undefined") {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    document.body.appendChild(tempDiv);

    const highResQR = new QRCodeStyling({
      width: exportSize,
      height: exportSize,
      type: "canvas",
      data: fullShareUrl,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H",
      },
      dotsOptions: {
        color: dotsColor,
        type: dotsStyle,
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        color: dotsColor,
        type: cornersStyle === "dot" ? "extra-rounded" : "square",
      },
      cornersDotOptions: {
        color: dotsColor,
        type: cornersStyle,
      },
    });

    highResQR.append(tempDiv);

    setTimeout(() => {
      const generatedCanvas = tempDiv.querySelector("canvas");
      if (generatedCanvas) {
        const finalCanvas = document.createElement("canvas");
        if (shapeFrame === "heart") {
          drawHeartQRComposition(
            finalCanvas,
            generatedCanvas,
            dotsColor,
            bgColor,
            exportSize,
          );
        } else if (shapeFrame === "circle") {
          finalCanvas.width = exportSize;
          finalCanvas.height = exportSize;
          const ctx = finalCanvas.getContext("2d");
          ctx.beginPath();
          ctx.arc(
            exportSize / 2,
            exportSize / 2,
            exportSize / 2 - 10,
            0,
            Math.PI * 2,
          );
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(generatedCanvas, 0, 0);
        } else {
          finalCanvas.width = exportSize;
          finalCanvas.height = exportSize;
          const ctx = finalCanvas.getContext("2d");
          ctx.drawImage(generatedCanvas, 0, 0);
        }

        // Trigger Download from Canvas DataURL
        const link = document.createElement("a");
        link.download = `QR_Trai_Tim_Thiep_Cuoi_${currentSlug}.png`;
        link.href = finalCanvas.toDataURL("image/png");
        link.click();
      }

      document.body.removeChild(tempDiv);
      showToast(
        `🚀 Đã tải xuống mã QR trái tim nghệ thuật HD (${exportSize}px)!`,
      );
    }, 150);
  } else {
    const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${exportSize}x${exportSize}&data=${encodeURIComponent(fullShareUrl)}`;
    const a = document.createElement("a");
    a.href = fallbackUrl;
    a.download = `QR_Thiep_Cuoi_${currentSlug}.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("🚀 Đã tải xuống mã QR thiệp cưới!");
  }
}

function copyCardShareLink() {
  const urlInput = document.getElementById("share-card-url-input");
  if (!urlInput || !urlInput.value) return;

  urlInput.select();
  urlInput.setSelectionRange(0, 99999);

  navigator.clipboard
    .writeText(urlInput.value)
    .then(() => {
      showToast("📋 Đã sao chép link chia sẻ thiệp cưới thành công!");
    })
    .catch(() => {
      document.execCommand("copy");
      showToast("📋 Đã sao chép link chia sẻ thiệp cưới!");
    });
}

async function handleSelectWeddingCard(slug) {
  await switchActiveWeddingCard(slug);
  showToast(
    `Đã chuyển sang thiệp cưới: ${currentWedding.groom_name} ❤️ ${currentWedding.bride_name}`,
  );
}

function openNewWeddingModal() {
  const modal = document.getElementById("modal-new-wedding");
  if (modal) modal.classList.add("active");
}

function closeNewWeddingModal() {
  const modal = document.getElementById("modal-new-wedding");
  if (modal) modal.classList.remove("active");
}

function autoGenerateSlug() {
  const gName = document.getElementById("new-groom-name").value;
  const bName = document.getElementById("new-bride-name").value;
  const slugInput = document.getElementById("new-wedding-slug");

  if (gName || bName) {
    const combined = `${gName}-${bName}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    slugInput.value = combined;
  }
}

async function handleCreateNewWedding(e) {
  e.preventDefault();

  const gName = document.getElementById("new-groom-name").value.trim();
  const bName = document.getElementById("new-bride-name").value.trim();
  const slug = document
    .getElementById("new-wedding-slug")
    .value.trim()
    .toLowerCase();
  const dateVal = document.getElementById("new-wedding-date").value;
  const venue =
    document.getElementById("new-venue-name").value.trim() || "Tại nhà";

  let dateIso = new Date().toISOString();
  if (dateVal) {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) dateIso = d.toISOString();
  }

  const newCard = {
    id: "wedding-" + Date.now(),
    slug: slug,
    groom_name: gName,
    bride_name: bName,
    groom_title: "GROOM",
    bride_title: "BRIDE",
    groom_father: "ÔNG NGUYỄN VĂN THẠCH",
    groom_mother: "BÀ DƯ THỊ THỎA",
    bride_father: "ÔNG NGÔ VĂN CẢNH",
    bride_mother: "BÀ PHẠM THỊ HUYỀN",
    wedding_date: dateIso,
    lunar_date: "Tức ngày 25 tháng 02 năm Đinh Mùi",
    venue_name: venue,
    venue_address: venue,
    hero_title: "WE ARE GETTING MARRIED",
    hero_image: "./assets/img/banner.webp",
    groom_image: "./assets/img/men.webp",
    bride_image: "./assets/img/girl.webp",
    intro_title: "THƯ MỜI TIỆC CƯỚI",
    intro_text:
      "Chung tay dựng một mái nhà, / Sơn khuya có bạn, đường xa có cùng.",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  };

  await AdminService.createWedding(newCard);
  showToast(`🎉 Đã tạo thiệp cưới mới: ${gName} ❤️ ${bName} thành công!`);
  closeNewWeddingModal();
  e.target.reset();

  await loadWeddingCardsSelector(slug);
}

// Chuyển đổi Tab trong Admin SPA
function setupTabNavigation() {
  const links = document.querySelectorAll(".admin-nav-link[data-tab]");
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tabName = link.getAttribute("data-tab");
      switchTab(tabName);
    });
  });
}

async function switchTab(tabName) {
  // Cập nhật UI Menu Active
  document
    .querySelectorAll(".admin-nav-link")
    .forEach((l) => l.classList.remove("active"));
  const activeLink = document.querySelector(
    `.admin-nav-link[data-tab="${tabName}"]`,
  );
  if (activeLink) activeLink.classList.add("active");

  // Ẩn tất cả Tab Pane
  document
    .querySelectorAll(".tab-pane")
    .forEach((pane) => (pane.style.display = "none"));
  const targetPane = document.getElementById(`tab-${tabName}`);
  if (targetPane) targetPane.style.display = "block";

  // Dynamic Data Load theo từng Tab
  if (!currentWedding) return;

  switch (tabName) {
    case "dashboard":
      await loadDashboardOverview();
      break;
    case "wedding":
      populateWeddingForm();
      break;
    case "story":
      await loadLoveStoryTable();
      break;
    case "events":
      await loadEventsTable();
      break;
    case "gallery":
      await loadGalleryGrid();
      break;
    case "rsvp":
      await loadRSVPTable();
      break;
    case "wishes":
      await loadWishesTable();
      break;
    case "music":
      populateMusicForm();
      break;
    case "bank":
      populateBankForm();
      break;
  }
}

// 1. DASHBOARD OVERVIEW METRICS
async function loadDashboardOverview() {
  if (!currentWedding) currentWedding = CONFIG.SAMPLE_DATA.wedding;

  try {
    // Render thông tin cơ bản
    const gName = document.getElementById("dash-groom-name");
    const bName = document.getElementById("dash-bride-name");
    const dateEl = document.getElementById("dash-wedding-date");
    const slugEl = document.getElementById("dash-wedding-slug");

    if (gName) gName.textContent = currentWedding.groom_name || "Văn Tiến";
    if (bName) bName.textContent = currentWedding.bride_name || "Thu Hà";

    if (dateEl && currentWedding.wedding_date) {
      try {
        dateEl.textContent = new Date(
          currentWedding.wedding_date,
        ).toLocaleString("vi-VN");
      } catch (e) {
        dateEl.textContent = currentWedding.wedding_date;
      }
    }
    if (slugEl) slugEl.textContent = currentWedding.slug || "van-tien-thu-ha";

    // Lấy dữ liệu thống kê RSVP & Wishes với try-catch an toàn
    const rsvps = await AdminService.getAllRSVPs(currentWedding.id).catch(
      () => [],
    );
    const wishes = await AdminService.getAllWishes(currentWedding.id).catch(
      () => [],
    );

    const safeRSVP = Array.isArray(rsvps) ? rsvps : [];
    const safeWishes = Array.isArray(wishes) ? wishes : [];

    const totalRSVP = safeRSVP.length;
    const attendingGuests = safeRSVP
      .filter(
        (r) => r && (r.attendance === "attending" || r.attendance === "yes"),
      )
      .reduce((sum, r) => sum + (r.guest_count || 1), 0);
    const notAttendingCount = safeRSVP.filter(
      (r) => r && (r.attendance === "not_attending" || r.attendance === "no"),
    ).length;

    const rsvpCountEl = document.getElementById("metric-rsvp-count");
    const guestCountEl = document.getElementById("metric-guest-count");
    const notAttendCountEl = document.getElementById("metric-not-attend-count");
    const wishesCountEl = document.getElementById("metric-wishes-count");

    if (rsvpCountEl) rsvpCountEl.textContent = totalRSVP;
    if (guestCountEl) guestCountEl.textContent = attendingGuests;
    if (notAttendCountEl) notAttendCountEl.textContent = notAttendingCount;
    if (wishesCountEl) wishesCountEl.textContent = safeWishes.length;
  } catch (err) {
    console.warn("loadDashboardOverview warning:", err);
  }
}

// 2. CẶP ĐÔI (WEDDING FORM)
function populateWeddingForm() {
  if (!currentWedding) currentWedding = CONFIG.SAMPLE_DATA.wedding;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
  };

  setVal("edit-groom-name", currentWedding.groom_name || "Văn Tiến");
  setVal("edit-bride-name", currentWedding.bride_name || "Thu Hà");
  setVal(
    "edit-groom-image",
    currentWedding.groom_image || "./assets/img/men_v2.png",
  );
  setVal(
    "edit-bride-image",
    currentWedding.bride_image || "./assets/img/girl_v2.png",
  );
  setVal(
    "edit-hero-image",
    currentWedding.hero_image || "./assets/img/banner_v3.png",
  );

  setVal(
    "edit-groom-father",
    currentWedding.groom_father || "ÔNG NGUYỄN VĂN THẠCH",
  );
  setVal("edit-groom-mother", currentWedding.groom_mother || "BÀ DƯ THỊ THỎA");
  setVal(
    "edit-bride-father",
    currentWedding.bride_father || "ÔNG NGÔ VĂN CẢNH",
  );
  setVal(
    "edit-bride-mother",
    currentWedding.bride_mother || "BÀ PHẠM THỊ HUYỀN",
  );

  setVal(
    "edit-lunar-date",
    currentWedding.lunar_date || "Tức ngày 25 tháng 02 năm Đinh Mùi",
  );
  setVal("edit-venue-name", currentWedding.venue_name || "Tại nhà");
  setVal("edit-venue-address", currentWedding.venue_address || "Tại nhà");
  setVal(
    "edit-video-url",
    currentWedding.video_url || "https://www.youtube.com/embed/dQw4w9WgXcQ",
  );
  setVal(
    "edit-intro-text",
    currentWedding.intro_text ||
      "Chung tay dựng một mái nhà, / Sơn khuya có bạn, đường xa có cùng.",
  );

  const dateEl = document.getElementById("edit-wedding-date");
  if (dateEl && currentWedding.wedding_date) {
    try {
      const d = new Date(currentWedding.wedding_date);
      if (!isNaN(d.getTime())) {
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        dateEl.value = d.toISOString().slice(0, 16);
      }
    } catch (e) {}
  }
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
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : "";
    };

    const rawDate = getVal("edit-wedding-date");
    let weddingDateIso =
      currentWedding.wedding_date || new Date().toISOString();

    if (rawDate) {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        weddingDateIso = parsedDate.toISOString();
      }
    }

    const updatedData = {
      groom_name: getVal("edit-groom-name") || "Văn Tiến",
      bride_name: getVal("edit-bride-name") || "Thu Hà",
      groom_image: getVal("edit-groom-image") || "./assets/img/men_v2.webp",
      bride_image: getVal("edit-bride-image") || "./assets/img/girl_v2.webp",
      hero_image: getVal("edit-hero-image") || "./assets/img/banner_v3.webp",
      groom_father: getVal("edit-groom-father") || "ÔNG NGUYỄN VĂN THẠCH",
      groom_mother: getVal("edit-groom-mother") || "BÀ DƯ THỊ THỎA",
      bride_father: getVal("edit-bride-father") || "ÔNG NGÔ VĂN CẢNH",
      bride_mother: getVal("edit-bride-mother") || "BÀ PHẠM THỊ HUYỀN",
      wedding_date: weddingDateIso,
      lunar_date:
        getVal("edit-lunar-date") || "Tức ngày 25 tháng 02 năm Đinh Mùi",
      venue_name: getVal("edit-venue-name") || "Tại nhà",
      venue_address: getVal("edit-venue-address") || "Tại nhà",
      video_url: getVal("edit-video-url"),
      intro_text: getVal("edit-intro-text"),
      description: getVal("edit-intro-text"),
      hero_title: "WE ARE GETTING MARRIED",
    };

    const res = await AdminService.updateWeddingInfo(
      currentWedding.id,
      updatedData,
    );

    if (res.success) {
      showToast("Đã lưu thay đổi thông tin Cặp đôi thành công! ❤️");
      currentWedding = { ...currentWedding, ...updatedData };
      loadDashboardOverview();
    } else {
      showToast(`❌ Có lỗi xảy ra: ${res.error || "Vui lòng thử lại"}`);
    }
  } catch (err) {
    console.error("handleUpdateWedding exception:", err);
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
  const container = document.getElementById("admin-story-table-body");
  if (!container || !currentWedding) return;

  const res = await WeddingService.getLoveStories(currentWedding.id);
  const stories = res.data || [];

  if (stories.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-text-muted);">Chưa có mốc thời gian nào</td></tr>`;
    return;
  }

  container.innerHTML = stories
    .map(
      (s) => `
    <tr>
      <td><strong>${s.year}</strong></td>
      <td>${escapeHtml(s.title)}</td>
      <td style="max-width: 280px;">${escapeHtml(s.description)}</td>
      <td>${s.image_url ? `<img src="${s.image_url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">` : "Không có"}</td>
      <td>
        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteStoryItem('${s.id}', '${s.storage_path || ""}')">
          <i class="fas fa-trash"></i> Xóa
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function deleteStoryItem(id, storagePath) {
  openConfirmModal("Bạn có chắc chắn muốn xóa mốc kỷ niệm này?", async () => {
    await AdminService.deleteLoveStory(id, storagePath);
    showToast("Đã xóa mốc kỷ niệm thành công!");
    await loadLoveStoryTable();
  });
}

// 4. EVENTS TABLE
async function loadEventsTable() {
  const container = document.getElementById("admin-events-table-body");
  if (!container || !currentWedding) return;

  const res = await WeddingService.getEvents(currentWedding.id);
  const events = res.data || [];

  if (events.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-text-muted);">Chưa có sự kiện nào</td></tr>`;
    return;
  }

  container.innerHTML = events
    .map(
      (e) => `
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
  `,
    )
    .join("");
}

function deleteEventItem(id) {
  openConfirmModal("Bạn có chắc muốn xóa sự kiện này?", async () => {
    await AdminService.deleteEvent(id);
    showToast("Đã xóa sự kiện thành công!");
    await loadEventsTable();
  });
}

// 5. GALLERY GRID & UPLOAD
async function loadGalleryGrid() {
  const container = document.getElementById("gallery-grid");
  if (!container || !currentWedding) return;

  const res = await WeddingService.getGallery(currentWedding.id);
  const gallery = res.data || [];

  if (gallery.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--admin-text-muted); padding: 40px;">Chưa có ảnh cưới nào trong album</div>`;
    return;
  }

  container.innerHTML = gallery
    .map(
      (img) => `
    <div style="position: relative; border-radius: 8px; overflow: hidden; border: 1px solid var(--admin-border); background: #fff;">
      <img src="${img.image_url}" style="width: 100%; height: 140px; object-fit: cover;">
      <div style="padding: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.75rem; color: var(--admin-text-muted);">${img.caption || "Ảnh cưới"}</span>
        <button class="btn-admin btn-admin-danger btn-sm" style="padding: 4px 8px;" onclick="deleteGalleryItem('${img.id}', '${img.storage_path || ""}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}

async function handleGalleryUpload(input) {
  if (!input.files || input.files.length === 0 || !currentWedding) return;

  try {
    showToast("Đang upload ảnh lên Supabase Storage... ⏳");
    await AdminService.uploadGalleryImages(currentWedding.id, input.files);
    showToast("Upload album ảnh thành công! ❤️");
    input.value = "";
    await loadGalleryGrid();
  } catch (err) {
    showToast(`❌ Lỗi upload: ${err.message}`);
  }
}

function deleteGalleryItem(id, storagePath) {
  openConfirmModal("Bạn có chắc muốn xóa ảnh này khỏi Album?", async () => {
    await AdminService.deleteGalleryImage(id, storagePath);
    showToast("Đã xóa ảnh khỏi album!");
    await loadGalleryGrid();
  });
}

// 6. RSVP TABLE
async function loadRSVPTable() {
  const container = document.getElementById("admin-rsvp-table-body");
  if (!container || !currentWedding) return;

  const rsvps = await AdminService.getAllRSVPs(currentWedding.id);

  let filtered = rsvps;
  if (currentRSVPFilter === "attending") {
    filtered = rsvps.filter(
      (r) => r.attendance === "attending" || r.attendance === "yes",
    );
  } else if (currentRSVPFilter === "not_attending") {
    filtered = rsvps.filter(
      (r) => r.attendance === "not_attending" || r.attendance === "no",
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--admin-text-muted);">Không có dữ liệu RSVP</td></tr>`;
    return;
  }

  container.innerHTML = filtered
    .map(
      (r) => `
    <tr>
      <td><strong>${escapeHtml(r.guest_name)}</strong></td>
      <td>${r.phone || "--"}</td>
      <td>
        ${
          r.attendance === "attending" || r.attendance === "yes"
            ? '<span class="badge badge-success">Có Tham Dự</span>'
            : '<span class="badge badge-danger">Không Tham Dự</span>'
        }
      </td>
      <td>${r.guest_count || 1} người</td>
      <td style="max-width: 240px;">${escapeHtml(r.message || "--")}</td>
      <td>${new Date(r.created_at).toLocaleDateString("vi-VN")}</td>
      <td>
        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteRSVPItem('${r.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function filterRSVP(type) {
  currentRSVPFilter = type;
  loadRSVPTable();
}

function deleteRSVPItem(id) {
  openConfirmModal("Xóa xác nhận RSVP này?", async () => {
    await AdminService.deleteRSVP(id);
    showToast("Đã xóa RSVP!");
    await loadRSVPTable();
  });
}

// 7. WISHES TABLE (APPROVE / HIDE / DELETE)
async function loadWishesTable() {
  const container = document.getElementById("admin-wishes-table-body");
  if (!container || !currentWedding) return;

  const wishes = await AdminService.getAllWishes(currentWedding.id);

  if (wishes.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-text-muted);">Chưa có lời chúc nào</td></tr>`;
    return;
  }

  container.innerHTML = wishes
    .map(
      (w) => `
    <tr>
      <td><strong>${escapeHtml(w.guest_name)}</strong></td>
      <td style="max-width: 300px;">${escapeHtml(w.message)}</td>
      <td>
        ${w.status === "approved" ? '<span class="badge badge-success">Đã duyệt</span>' : ""}
        ${w.status === "pending" ? '<span class="badge badge-warning">Chờ duyệt</span>' : ""}
        ${w.status === "hidden" ? '<span class="badge badge-danger">Đã ẩn</span>' : ""}
      </td>
      <td>${new Date(w.created_at).toLocaleDateString("vi-VN")}</td>
      <td>
        ${
          w.status !== "approved"
            ? `
          <button class="btn-admin btn-admin-primary btn-sm" onclick="changeWishStatus('${w.id}', 'approved')">
            <i class="fas fa-check"></i> Duyệt
          </button>
        `
            : ""
        }
        ${
          w.status === "approved"
            ? `
          <button class="btn-admin btn-admin-secondary btn-sm" onclick="changeWishStatus('${w.id}', 'hidden')">
            <i class="fas fa-eye-slash"></i> Ẩn
          </button>
        `
            : ""
        }
        <button class="btn-admin btn-admin-danger btn-sm" onclick="deleteWishItem('${w.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

async function changeWishStatus(id, newStatus) {
  await AdminService.updateWishStatus(id, newStatus);
  showToast("Cập nhật trạng thái lời chúc thành công!");
  await loadWishesTable();
}

function deleteWishItem(id) {
  openConfirmModal("Bạn có chắc muốn xóa lời chúc này?", async () => {
    await AdminService.deleteWish(id);
    showToast("Đã xóa lời chúc!");
    await loadWishesTable();
  });
}

// UTILITY MODAL & TOAST
let confirmCallback = null;

function openConfirmModal(msg, onOk) {
  const modal = document.getElementById("confirm-modal");
  const msgEl = document.getElementById("confirm-modal-msg");
  const okBtn = document.getElementById("confirm-modal-ok-btn");

  if (!modal) return;
  msgEl.textContent = msg;
  confirmCallback = onOk;

  okBtn.onclick = async () => {
    if (confirmCallback) await confirmCallback();
    closeConfirmModal();
  };

  modal.classList.add("active");
}

function closeConfirmModal() {
  const modal = document.getElementById("confirm-modal");
  if (modal) modal.classList.remove("active");
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m];
  });
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
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
  const modal = document.getElementById("modal-story");
  if (modal) modal.classList.add("active");
}

function closeStoryModal() {
  const modal = document.getElementById("modal-story");
  if (modal) modal.classList.remove("active");
}

async function handleCreateStory(e) {
  e.preventDefault();
  if (!currentWedding) return;

  const data = {
    wedding_id: currentWedding.id,
    year: document.getElementById("modal-story-year").value.trim(),
    title: document.getElementById("modal-story-title").value.trim(),
    description: document.getElementById("modal-story-desc").value.trim(),
    image_url:
      document.getElementById("modal-story-img").value.trim() ||
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    sort_order: Date.now(),
  };

  try {
    await AdminService.createLoveStory(data);
    showToast("Đã thêm mốc thời gian thành công! ❤️");
    closeStoryModal();
    e.target.reset();
    await loadLoveStoryTable();
  } catch (err) {
    showToast(`❌ Lỗi thêm mốc thời gian: ${err.message}`);
  }
}

// 9. EVENT MODAL HANDLERS
function openEventModal() {
  const modal = document.getElementById("modal-event");
  if (modal) modal.classList.add("active");
}

function closeEventModal() {
  const modal = document.getElementById("modal-event");
  if (modal) modal.classList.remove("active");
}

async function handleCreateEvent(e) {
  e.preventDefault();
  if (!currentWedding) return;

  const data = {
    wedding_id: currentWedding.id,
    title: document.getElementById("modal-event-title").value.trim(),
    event_date: document.getElementById("modal-event-date").value.trim(),
    event_time: document.getElementById("modal-event-time").value.trim(),
    venue: document.getElementById("modal-event-venue").value.trim(),
    address: document.getElementById("modal-event-address").value.trim(),
    description: document.getElementById("modal-event-desc").value.trim(),
    icon: "fas fa-heart",
    sort_order: Date.now(),
  };

  try {
    await AdminService.createEvent(data);
    showToast("Đã thêm sự kiện lễ cưới thành công! ❤️");
    closeEventModal();
    e.target.reset();
    await loadEventsTable();
  } catch (err) {
    showToast(`❌ Lỗi thêm sự kiện: ${err.message}`);
  }
}

// 10. MUSIC FORM HANDLERS
async function populateMusicForm() {
  if (!currentWedding) return;

  const titleEl = document.getElementById("edit-music-title");
  const urlEl = document.getElementById("edit-music-url");
  const enabledEl = document.getElementById("edit-music-enabled");
  const presetSelect = document.getElementById("preset-music-select");

  // Lấy dữ liệu nhạc hiện tại từ WeddingService / LocalStorage
  const res = await WeddingService.getMusic(currentWedding.id);
  const music = res.data || {
    title: "Love Song",
    audio_url: "./assets/music/love.mp3",
    enabled: true,
  };

  if (titleEl) titleEl.value = music.title || "Love Song";
  if (urlEl) urlEl.value = music.audio_url || "./assets/music/love.mp3";
  if (enabledEl) enabledEl.checked = music.enabled !== false;

  if (presetSelect) {
    if (
      music.audio_url === "./assets/music/love.mp3" ||
      music.audio_url === "./assets/music/50namvesau.mp3"
    ) {
      presetSelect.value = music.audio_url;
    } else {
      presetSelect.value = "custom";
    }
  }
}

function onSelectPresetMusic(val) {
  const titleEl = document.getElementById("edit-music-title");
  const urlEl = document.getElementById("edit-music-url");

  if (val === "./assets/music/love.mp3") {
    if (titleEl) titleEl.value = "Love Song";
    if (urlEl) urlEl.value = "./assets/music/love.mp3";
  } else if (val === "./assets/music/50namvesau.mp3") {
    if (titleEl) titleEl.value = "50 Năm Về Sau";
    if (urlEl) urlEl.value = "./assets/music/50namvesau.mp3";
  }
}

async function handleUpdateMusic(e) {
  e.preventDefault();
  if (!currentWedding) return;

  const musicData = {
    title: document.getElementById("edit-music-title").value.trim(),
    audio_url: document.getElementById("edit-music-url").value.trim(),
    enabled: document.getElementById("edit-music-enabled").checked,
  };

  await AdminService.updateMusic(currentWedding.id, musicData);
  showToast("Đã lưu cài đặt nhạc nền thành công! 🎵");
}

// 11. BANK & QR FORM HANDLERS
function populateBankForm() {
  const gName = document.getElementById("edit-groom-bank-name");
  const gAcc = document.getElementById("edit-groom-acc-name");
  const gNum = document.getElementById("edit-groom-acc-num");
  const gQr = document.getElementById("edit-groom-qr-url");

  const bName = document.getElementById("edit-bride-bank-name");
  const bAcc = document.getElementById("edit-bride-acc-name");
  const bNum = document.getElementById("edit-bride-acc-num");
  const bQr = document.getElementById("edit-bride-qr-url");

  if (gName) gName.value = "MB Bank";
  if (gAcc) gAcc.value = "VAN TIEN";
  if (gNum) gNum.value = "1234 5678 9999";
  if (gQr)
    gQr.value =
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MUNG-CUOI-CHU-RE-VAN-TIEN-MBBANK";

  if (bName) bName.value = "Vietcombank";
  if (bAcc) bAcc.value = "THU HA";
  if (bNum) bNum.value = "9876 5432 1000";
  if (bQr)
    bQr.value =
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MUNG-CUOI-CO-DAU-THU-HA-VIETCOMBANK";
}

async function handleUpdateBank(e) {
  e.preventDefault();
  if (!currentWedding) return;

  const bankData = {
    groom_bank: {
      bank_name: document.getElementById("edit-groom-bank-name").value.trim(),
      account_name: document.getElementById("edit-groom-acc-name").value.trim(),
      account_number: document
        .getElementById("edit-groom-acc-num")
        .value.trim(),
    },
    groom_qr: document.getElementById("edit-groom-qr-url").value.trim(),
    bride_bank: {
      bank_name: document.getElementById("edit-bride-bank-name").value.trim(),
      account_name: document.getElementById("edit-bride-acc-name").value.trim(),
      account_number: document
        .getElementById("edit-bride-acc-num")
        .value.trim(),
    },
    bride_qr: document.getElementById("edit-bride-qr-url").value.trim(),
  };

  await AdminService.updateBank(currentWedding.id, bankData);
  showToast("Đã lưu thông tin chuyển khoản & QR mừng cưới! 💳");
}

// 12. SMART MEDIA LIBRARY & SINGLE FILE UPLOAD HELPERS
let currentTargetInputId = null;

async function uploadSingleImageFile(inputEl, targetInputId = null, refreshPicker = false) {
  if (!inputEl.files || inputEl.files.length === 0) return;
  const file = inputEl.files[0];

  try {
    showToast("Đang tải ảnh lên... ⏳");
    const uploadedUrl = await AdminService.uploadSingleImage(file, "images");

    const inputId = targetInputId || currentTargetInputId;
    if (inputId) {
      const targetInput = document.getElementById(inputId);
      if (targetInput) targetInput.value = uploadedUrl;
    }

    showToast("Tải ảnh lên thành công! ✨");
    inputEl.value = "";

    if (refreshPicker || document.getElementById("modal-media-picker")?.classList.contains("active")) {
      await renderMediaPickerGrid();
    }
  } catch (err) {
    showToast(`❌ Lỗi tải ảnh: ${err.message}`);
  }
}

async function openMediaPicker(targetInputId) {
  currentTargetInputId = targetInputId;
  const modal = document.getElementById("modal-media-picker");
  if (!modal) return;

  await renderMediaPickerGrid();
  modal.classList.add("active");
}

function closeMediaPicker() {
  const modal = document.getElementById("modal-media-picker");
  if (modal) modal.classList.remove("active");
}

function selectMediaPickerImage(url) {
  if (currentTargetInputId) {
    const input = document.getElementById(currentTargetInputId);
    if (input) input.value = url;
  }
  showToast("Đã chọn ảnh thành công! 🖼️");
  closeMediaPicker();
}

async function renderMediaPickerGrid() {
  const grid = document.getElementById("media-picker-grid");
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--admin-text-muted); padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Đang tải thư viện ảnh...</div>`;

  // Preset Local Images
  const presetImages = [
    { title: 'Banner 3', url: './assets/img/banner_v3.png' },
    { title: 'Banner 2', url: './assets/img/banner_v2.png' },
    { title: 'Chú Rể V2', url: './assets/img/men_v2.png' },
    { title: 'Cô Dâu V2', url: './assets/img/girl_v2.png' },
    { title: 'Ảnh 2', url: './assets/img/anh2.png' },
    { title: 'Ảnh Địa Điểm', url: './assets/img/anh_address.png' },
    { title: 'Ảnh Thời Gian', url: './assets/img/anh_time.png' },
    { title: 'Ảnh Kết', url: './assets/img/anh_ket.png' },
    { title: 'Ảnh Gallery 1', url: './assets/img/gr1.png' },
    { title: 'Ảnh Gallery 2', url: './assets/img/gr2.png' }
  ];

  // Fetch Supabase Gallery Uploads if available
  let galleryImages = [];
  if (currentWedding) {
    try {
      const res = await WeddingService.getGallery(currentWedding.id);
      if (res && res.data) {
        galleryImages = res.data.map(g => ({ title: g.caption || 'Album Ảnh', url: g.image_url }));
      }
    } catch (e) {}
  }

  const allMedia = [...presetImages, ...galleryImages];

  grid.innerHTML = allMedia.map(item => `
    <div onclick="selectMediaPickerImage('${item.url}')" style="cursor: pointer; border-radius: 8px; overflow: hidden; border: 2px solid var(--admin-border); background: #FFF; transition: transform 0.2s, border-color 0.2s; position: relative; aspect-ratio: 1;" onmouseover="this.style.borderColor='var(--admin-primary)'; this.style.transform='scale(1.03)';" onmouseout="this.style.borderColor='var(--admin-border)'; this.style.transform='scale(1)';">
      <img src="${item.url}" style="width: 100%; height: 100%; object-fit: cover;" alt="${item.title}">
      <div style="position: absolute; bottom: 0; inset-x: 0; background: rgba(0,0,0,0.6); color: #FFF; font-size: 0.7rem; padding: 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${item.title}
      </div>
    </div>
  `).join('');
}

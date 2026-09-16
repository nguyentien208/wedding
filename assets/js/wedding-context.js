/**
 * WEDDING-CONTEXT.JS
 * Xác định Wedding Slug hiện tại từ URL parameter (?wedding=... hoặc ?slug=...)
 */

function getCurrentWeddingSlug() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('wedding') || urlParams.get('slug') || CONFIG.DEFAULT_SLUG || 'nguyen-a-nguyen-b';
  return slug.trim().toLowerCase();
}

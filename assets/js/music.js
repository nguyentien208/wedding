/**
 * MUSIC.JS
 * Trình phát nhạc nền thiệp cưới (mặc định love.mp3), tự động phát khi scroll & toggle nhạc
 */

class WeddingMusic {
  constructor(audioUrl = './assets/music/love.mp3') {
    this.audioUrl = audioUrl || './assets/music/love.mp3';
    this.audio = new Audio(this.audioUrl);
    this.audio.loop = true;
    this.audio.volume = 0.5;
    this.isPlaying = false;
    this.hasStarted = false;

    this.btn = document.getElementById('music-toggle-btn');
    this.icon = document.getElementById('music-toggle-icon');

    this.init();
  }

  init() {
    if (this.btn) {
      this.btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    // Tự động bật nhạc khi người dùng bắt đầu cuộn trang (scroll) hoặc chạm màn hình
    const autoPlayOnScroll = () => {
      if (!this.hasStarted && !this.isPlaying) {
        this.play();
      }
      window.removeEventListener('scroll', autoPlayOnScroll);
      window.removeEventListener('touchmove', autoPlayOnScroll);
      window.removeEventListener('wheel', autoPlayOnScroll);
    };

    window.addEventListener('scroll', autoPlayOnScroll, { passive: true });
    window.addEventListener('touchmove', autoPlayOnScroll, { passive: true });
    window.addEventListener('wheel', autoPlayOnScroll, { passive: true });
    window.addEventListener('click', autoPlayOnScroll, { passive: true, once: true });
  }

  play() {
    this.hasStarted = true;
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updateUI();
    }).catch(err => {
      console.log('Autoplay waiting for user gesture:', err);
      this.isPlaying = false;
      this.updateUI();
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updateUI();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  updateUI() {
    if (!this.btn) return;

    if (this.isPlaying) {
      if (this.icon) this.icon.classList.add('playing');
      this.btn.title = 'Tắt nhạc';
    } else {
      if (this.icon) this.icon.classList.remove('playing');
      this.btn.title = 'Bật nhạc';
    }
  }

  setAudioUrl(newUrl) {
    if (newUrl && newUrl !== this.audioUrl) {
      const wasPlaying = this.isPlaying;
      this.pause();
      this.audioUrl = newUrl;
      this.audio = new Audio(newUrl);
      this.audio.loop = true;
      this.audio.volume = 0.5;
      if (wasPlaying) {
        this.play();
      }
    }
  }
}

let weddingMusicInstance = null;

function initMusic(audioUrl) {
  const finalUrl = audioUrl || './assets/music/love.mp3';
  if (!weddingMusicInstance) {
    weddingMusicInstance = new WeddingMusic(finalUrl);
  } else if (audioUrl) {
    weddingMusicInstance.setAudioUrl(finalUrl);
  }
}

function playWeddingMusic() {
  if (!weddingMusicInstance) {
    initMusic('./assets/music/love.mp3');
  }
  if (weddingMusicInstance) {
    weddingMusicInstance.play();
  }
}

// Khởi tạo mặc định với love.mp3
document.addEventListener('DOMContentLoaded', () => {
  if (!weddingMusicInstance) {
    initMusic('./assets/music/love.mp3');
  }
});


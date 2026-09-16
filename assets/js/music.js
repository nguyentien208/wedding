/**
 * MUSIC.JS
 * Trình phát nhạc nền thiệp cưới, toggle Music On/Off, volume control
 */

class WeddingMusic {
  constructor(audioUrl) {
    this.audio = new Audio(audioUrl);
    this.audio.loop = true;
    this.audio.volume = 0.4; // Đặt âm lượng 40% theo yêu cầu
    this.isPlaying = false;
    this.btn = document.getElementById('music-toggle-btn');
    this.icon = document.getElementById('music-toggle-icon');

    this.init();
  }

  init() {
    if (!this.btn) return;

    this.btn.addEventListener('click', () => {
      this.toggle();
    });
  }

  play() {
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updateUI();
    }).catch(err => {
      console.log('Autoplay blocked or audio load error:', err);
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
    if (!this.icon || !this.btn) return;

    if (this.isPlaying) {
      this.icon.className = 'fas fa-music music-disc-spinning';
      this.btn.title = 'Tắt nhạc';
    } else {
      this.icon.className = 'fas fa-volume-mute';
      this.btn.title = 'Bật nhạc';
    }
  }
}

let weddingMusicInstance = null;

function initMusic(audioUrl) {
  if (audioUrl) {
    weddingMusicInstance = new WeddingMusic(audioUrl);
  }
}

function playWeddingMusic() {
  if (weddingMusicInstance) {
    weddingMusicInstance.play();
  }
}

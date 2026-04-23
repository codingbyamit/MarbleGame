// // src/utils/SoundManager.js
// import Sound from 'react-native-sound';

// // Enable playback in silence mode (iOS)
// Sound.setCategory('Playback');

// class SoundManager {
//   constructor() {
//     this.sounds = {};
//     this.enabled = true;
//     this.loaded = false;
//   }

//   // Load all sounds at app start
//   loadSounds() {
//     if (this.loaded) return;

//     const soundFiles = {
//       click: 'marble_click.mp3',
//       move: 'marble_move.mp3',
//       push: 'marble_push.mp3',
//       pushOff: 'push_off.mp3',
//       win: 'win.mp3',
//     };

//     Object.keys(soundFiles).forEach((key) => {
//       const sound = new Sound(
//         soundFiles[key],
//         Sound.MAIN_BUNDLE,
//         (error) => {
//           if (error) {
//             console.log(`Failed to load ${key}:`, error);
//             return;
//           }
//           console.log(`✅ Loaded: ${key}`);
//         }
//       );
//       sound.setVolume(0.7);
//       this.sounds[key] = sound;
//     });

//     this.loaded = true;
//   }

//   // Play a sound
//   play(soundName) {
//     if (!this.enabled || !this.sounds[soundName]) return;

//     const sound = this.sounds[soundName];
//     sound.stop(() => {
//       sound.play((success) => {
//         if (!success) {
//           console.log(`Sound playback failed: ${soundName}`);
//         }
//       });
//     });
//   }

//   // Toggle sound on/off
//   setEnabled(enabled) {
//     this.enabled = enabled;
//   }

//   isEnabled() {
//     return this.enabled;
//   }

//   // Release all sounds (cleanup)
//   release() {
//     Object.values(this.sounds).forEach((sound) => {
//       sound.release();
//     });
//     this.sounds = {};
//     this.loaded = false;
//   }
// }

// // Singleton instance
// const soundManager = new SoundManager();
// export default soundManager;

// src/utils/SoundManager.js
// Marble Game ke liye complete sound system
// react-native-sound use karta hai

import Sound from 'react-native-sound';

// Android ke liye background category set karo
Sound.setCategory('Ambient', true);

// ===== Programmatic Sound Generator =====
// Actual .wav files ki zaroorat nahi - Web Audio API se sounds banao
// React Native mein hum react-native-sound ke saath pre-generated
// base64 audio ya bundled assets use karte hain.
// Is implementation mein hum ek clean architecture banate hain
// jisme real audio files aasani se add ho sakein.

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.musicEnabled = true;
    this.initialized = false;
    this.volume = 1.0;
  }

  // ===== Initialize: Sabhi sounds load karo =====
  async init() {
    if (this.initialized) return;

    const soundFiles = [
      { key: 'marble_click', file: 'marble_click.mp3' },
      { key: 'marble_move', file: 'marble_move.mp3' },
      { key: 'marble_push', file: 'marble_push.mp3' },
      { key: 'marble_select', file: 'push_off.mp3' },
      { key: 'win_jingle', file: 'win.mp3' },
      { key: 'marble_fall', file: 'marble_fall.mp3' },
      { key: 'lose_jingle', file: 'loose_game.mp3' },
      { key: 'button_tap', file: 'button_tap.mp3' },
      { key: 'invalid_move', file: 'invalid_move.mp3' },
      { key: 'ai_thinking', file: 'ai_thinking.mp3' },
    ];

    const loadPromises = soundFiles.map(
      ({ key, file }) =>
        new Promise((resolve) => {
          const sound = new Sound(file, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
              // File nahi mili - silent fail (graceful degradation)
              console.log(`Sound '${key}' load failed:`, error.message);
              resolve(null);
            } else {
              sound.setVolume(this.volume);
              this.sounds[key] = sound;
              resolve(sound);
            }
          });
        })
    );

    await Promise.all(loadPromises);
    this.initialized = true;
    console.log('SoundManager initialized:', Object.keys(this.sounds).length, 'sounds loaded');
  }

  // ===== Play a sound =====
  play(key, options = {}) {
    if (!this.enabled) return;

    const sound = this.sounds[key];
    if (!sound) return; // Sound file nahi hai - silently skip

    const { volume = this.volume, loop = false } = options;

    // Pehle stop karo agar already chal raha hai
    sound.stop(() => {
      sound.setVolume(volume);
      sound.setNumberOfLoops(loop ? -1 : 0);
      sound.play((success) => {
        if (!success) {
          // Android mein playback fail ho sakta hai - reinitialize
          sound.reset();
        }
      });
    });
  }

  // ===== Stop a specific sound =====
  stop(key) {
    const sound = this.sounds[key];
    if (sound) sound.stop();
  }

  // ===== Stop all sounds =====
  stopAll() {
    Object.values(this.sounds).forEach((sound) => {
      if (sound) sound.stop();
    });
  }

  // ===== Volume control =====
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    Object.values(this.sounds).forEach((sound) => {
      if (sound) sound.setVolume(this.volume);
    });
  }

  // ===== Enable/Disable sounds =====
  setSoundEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stopAll();
  }

  // ===== Release memory =====
  release() {
    Object.values(this.sounds).forEach((sound) => {
      if (sound) sound.release();
    });
    this.sounds = {};
    this.initialized = false;
  }

  // ===== Game-specific convenience methods =====

  // Marble tap kiya (select karne ke liye)
  playMarbleClick() {
    this.play('marble_click', { volume: 0.7 });
  }

  // Marble select hua (highlight show hoga)
  playMarbleSelect() {
    this.play('marble_select', { volume: 0.8 });
  }

  // Marble move hua (empty cell mein)
  playMarbleMove() {
    this.play('marble_move', { volume: 0.9 });
  }

  // Marble ne doosre marble ko push kiya
  playMarblePush() {
    this.play('marble_push', { volume: 1.0 });
  }

  // Marble board se bahar gaya (push off!)
  playMarbleFall() {
    this.play('marble_fall', { volume: 1.0 });
  }

  // Jeet gaye!
  playWin() {
    this.stopAll();
    this.play('win_jingle', { volume: 1.0 });
  }

  // Haar gaye
  playLose() {
    this.stopAll();
    this.play('lose_jingle', { volume: 0.8 });
  }

  // UI button press
  playButtonTap() {
    this.play('button_tap', { volume: 0.5 });
  }

  // Invalid move attempt
  playInvalidMove() {
    this.play('invalid_move', { volume: 0.6 });
  }
}

// Singleton - poori app mein ek hi instance
const soundManager = new SoundManager();
export default soundManager;

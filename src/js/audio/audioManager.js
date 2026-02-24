// src/js/audio/audioManager.js
let backgroundMusic = null;
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

export function initAudio() {
    backgroundMusic = new Audio('/assets/battleship-theme.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
}

export function playBackgroundMusic() {
    if (soundEnabled && backgroundMusic) {
        backgroundMusic.play().catch(err => {
            console.log('Audio autoplay blocked:', err);
        });
    }
}

export function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

export function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    
    if (soundEnabled) {
        playBackgroundMusic();
    } else {
        stopBackgroundMusic();
    }
    
    return soundEnabled;
}

export function playSound(soundName) {
    if (!soundEnabled) return;
    
    const sounds = {
        hit: '/assets/sounds/hit.mp3',
        miss: '/assets/sounds/miss.mp3',
        sink: '/assets/sounds/sink.mp3',
        win: '/assets/sounds/win.mp3'
    };
    
    const audio = new Audio(sounds[soundName]);
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Sound play failed:', err));
}
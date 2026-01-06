// ==================== Vocabulary Data ====================
const VOCABULARY_WORDS = [
    'Ephemeral',
    'Ubiquitous',
    'Sycophant',
    'Pragmatic',
    'Eloquent',
    'Resilient',
    'Meticulous',
    'Ambiguous',
    'Paradigm',
    'Euphoria',
    'Catalyst',
    'Enigma',
    'Serendipity',
    'Ineffable',
    'Tenacious',
    'Vicarious',
    'Candor',
    'Aesthetic',
    'Cognizant',
    'Diligent',
    'Empathy',
    'Facade',
    'Gratitude',
    'Hypothesis',
    'Innovative',
    'Juxtapose',
    'Kinetic',
    'Lucid',
    'Nuance',
    'Omnipotent'
];

// ==================== Global Variables ====================
let currentSpeech = null;

// ==================== Initialize Marquee ====================
/**
 * Initializes the marquee by creating word elements and duplicating them
 * for seamless looping animation
 */
function initializeMarquee() {
    const marqueeContent = document.getElementById('marquee');
    
    // Clear any existing content
    marqueeContent.innerHTML = '';
    
    // Create the first set of words
    const fragment1 = document.createDocumentFragment();
    VOCABULARY_WORDS.forEach(word => {
        const wordElement = createWordElement(word);
        fragment1.appendChild(wordElement);
    });
    
    // Create duplicate set for seamless loop
    const fragment2 = document.createDocumentFragment();
    VOCABULARY_WORDS.forEach(word => {
        const wordElement = createWordElement(word);
        fragment2.appendChild(wordElement);
    });
    
    // Append both sets to the marquee
    marqueeContent.appendChild(fragment1);
    marqueeContent.appendChild(fragment2);
}

/**
 * Creates a word element with click and keyboard event listeners
 * @param {string} word - The vocabulary word
 * @returns {HTMLElement} The created word element
 */
function createWordElement(word) {
    const wordElement = document.createElement('span');
    wordElement.className = 'word';
    wordElement.textContent = word;
    wordElement.tabIndex = 0;
    wordElement.setAttribute('role', 'button');
    wordElement.setAttribute('aria-label', `Click to hear pronunciation of ${word}`);
    
    // Click event
    wordElement.addEventListener('click', () => {
        speakWord(word, wordElement);
    });
    
    // Keyboard accessibility (Enter or Space)
    wordElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            speakWord(word, wordElement);
        }
    });
    
    return wordElement;
}

// ==================== Speech Synthesis ====================
/**
 * Uses Web Speech API to pronounce a word with visual feedback
 * @param {string} word - The word to pronounce
 * @param {HTMLElement} element - The word element for visual feedback
 */
function speakWord(word, element) {
    // Cancel any ongoing speech
    if (currentSpeech) {
        window.speechSynthesis.cancel();
    }
    
    // Remove speaking class from all words
    document.querySelectorAll('.word.speaking').forEach(el => {
        el.classList.remove('speaking');
    });
    
    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(word);
    
    // Set language to English
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use an English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en-') && voice.lang.includes('US')
    ) || voices.find(voice => voice.lang.startsWith('en-'));
    
    if (englishVoice) {
        utterance.voice = englishVoice;
    }
    
    // Add visual feedback
    element.classList.add('speaking');
    
    // Remove speaking class when done
    utterance.onend = () => {
        element.classList.remove('speaking');
        currentSpeech = null;
    };
    
    utterance.onerror = () => {
        element.classList.remove('speaking');
        currentSpeech = null;
        console.error('Speech synthesis error');
    };
    
    // Store current speech
    currentSpeech = utterance;
    
    // Speak the word
    window.speechSynthesis.speak(utterance);
}

// ==================== Speed Control ====================
/**
 * Updates the animation duration based on slider value
 * Slider: 10 (slow) to 100 (fast)
 * Duration: 60s (slow) to 10s (fast)
 */
function updateScrollSpeed() {
    const slider = document.getElementById('speed-slider');
    const marqueeContent = document.querySelector('.marquee-content');
    
    slider.addEventListener('input', (e) => {
        const sliderValue = parseInt(e.target.value);
        
        // Map slider value (10-100) inversely to duration (60s-10s)
        // Formula: duration = 70 - (sliderValue * 0.5556)
        // When slider = 10: duration = 70 - 5.556 ≈ 64.4s (let's use 60s)
        // When slider = 100: duration = 70 - 55.56 ≈ 14.4s (let's use 10s)
        // Better formula: duration = 65 - (sliderValue * 0.611)
        // Even better: linear interpolation
        const minDuration = 10;
        const maxDuration = 60;
        const minSlider = 10;
        const maxSlider = 100;
        
        // Linear interpolation (inverse relationship)
        const duration = maxDuration - ((sliderValue - minSlider) / (maxSlider - minSlider)) * (maxDuration - minDuration);
        
        // Update animation duration
        marqueeContent.style.animationDuration = `${duration}s`;
        
        // Update aria-valuenow for accessibility
        slider.setAttribute('aria-valuenow', sliderValue);
    });
}

// ==================== Initialization ====================
/**
 * Initialize the application when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize marquee with words
    initializeMarquee();
    
    // Setup speed control
    updateScrollSpeed();
    
    // Load voices for speech synthesis
    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            // Voices are loaded
        };
    }
});

// ==================== Cleanup ====================
/**
 * Cancel any ongoing speech when page is unloaded
 */
window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
});

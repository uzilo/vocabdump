// ==================== Vocabulary Data ====================
const VOCABULARY_UNITS = [
    {
        id: 1,
        title: "Personality",
        words: [
            'Introvert', 'Extrovert', 'Charismatic', 'Ambivert', 'Empathetic',
            'Optimistic', 'Pessimistic', 'Ambitious', 'Humble', 'Arrogant',
            'Compassionate', 'Resilient', 'Stubborn', 'Diplomatic', 'Impulsive',
            'Meticulous', 'Gregarious', 'Reserved', 'Assertive', 'Adaptable'
        ]
    },
    {
        id: 2,
        title: "Technology",
        words: [
            'Algorithm', 'Database', 'Framework', 'API', 'Cloud',
            'Encryption', 'Bandwidth', 'Protocol', 'Repository', 'Debugging',
            'Compiler', 'Interface', 'Middleware', 'Virtualization', 'Blockchain',
            'Neural', 'Quantum', 'Microservices', 'Container', 'DevOps'
        ]
    }
];

// ==================== Global Variables ====================
let currentSpeech = null;
let currentUnitId = 1;
let animationFrameId = null;
let isHovering = false;

// ==================== Initialize Marquee ====================
/**
 * Initializes the marquee by creating word elements and duplicating them
 * for seamless looping animation in a vertical paragraph layout
 */
function initializeMarquee() {
    const unit = VOCABULARY_UNITS.find(u => u.id === currentUnitId);
    if (!unit) return;
    
    const marqueeContent = document.getElementById('marquee');
    
    // Clear any existing content
    marqueeContent.innerHTML = '';
    
    // Cancel any ongoing animation
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // Create the first set of words as a paragraph
    const paragraph1 = document.createElement('p');
    paragraph1.style.margin = '0';
    paragraph1.style.padding = '0';
    
    unit.words.forEach((word, index) => {
        const wordElement = createWordElement(word);
        paragraph1.appendChild(wordElement);
        
        // Add space between words
        if (index < unit.words.length - 1) {
            paragraph1.appendChild(document.createTextNode(' '));
        }
    });
    
    // Create duplicate set for seamless loop
    const paragraph2 = document.createElement('p');
    paragraph2.style.margin = '0';
    paragraph2.style.padding = '0';
    
    unit.words.forEach((word, index) => {
        const wordElement = createWordElement(word);
        paragraph2.appendChild(wordElement);
        
        // Add space between words
        if (index < unit.words.length - 1) {
            paragraph2.appendChild(document.createTextNode(' '));
        }
    });
    
    // Append both sets to the marquee
    marqueeContent.appendChild(paragraph1);
    marqueeContent.appendChild(paragraph2);
    
    // Start tracking active word
    updateActiveWord();
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

// ==================== Active Word Tracking ====================
/**
 * Uses requestAnimationFrame to track which word is at the center line
 * and highlight it appropriately
 */
function updateActiveWord() {
    const marqueeContainer = document.querySelector('.marquee-container');
    const marqueeContent = document.getElementById('marquee');
    const words = marqueeContent.querySelectorAll('.word');
    
    if (!marqueeContainer || words.length === 0) return;
    
    function animate() {
        // Don't update if hovering (paused)
        if (!isHovering) {
            // Cache container bounds (only needs to be recalculated if window resizes)
            const containerRect = marqueeContainer.getBoundingClientRect();
            const centerY = containerRect.top + containerRect.height / 2;
            
            let closestWord = null;
            let minDistance = Infinity;
            
            // Find the word closest to the center line
            words.forEach(word => {
                const wordRect = word.getBoundingClientRect();
                const wordCenterY = wordRect.top + wordRect.height / 2;
                const distance = Math.abs(wordCenterY - centerY);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestWord = word;
                }
            });
            
            // Update active class
            words.forEach(word => {
                if (word === closestWord && !word.classList.contains('speaking')) {
                    word.classList.add('active');
                } else {
                    word.classList.remove('active');
                }
            });
        }
        
        // Continue animation loop
        animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
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
    const englishVoice = voices.find(voice => voice.lang === 'en-US') 
        || voices.find(voice => voice.lang.startsWith('en-'));
    
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

// ==================== Unit Selector ====================
/**
 * Initializes the unit selector dropdown with available units
 */
function initializeUnitSelector() {
    const unitSelect = document.getElementById('unit-select');
    
    // Clear existing options
    unitSelect.innerHTML = '';
    
    // Add options for each unit
    VOCABULARY_UNITS.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit.id;
        option.textContent = `Unit ${unit.id}: ${unit.title}`;
        if (unit.id === currentUnitId) {
            option.selected = true;
        }
        unitSelect.appendChild(option);
    });
    
    // Add change event listener
    unitSelect.addEventListener('change', (e) => {
        currentUnitId = parseInt(e.target.value);
        initializeMarquee();
    });
}

// ==================== Speed Control ====================
/**
 * Sets up the speed control slider event listener
 * Slider: 10 (slow) to 100 (fast)
 * Duration: 60s (slow) to 10s (fast)
 */
function setupSpeedControl() {
    const slider = document.getElementById('speed-slider');
    const marqueeContent = document.querySelector('.marquee-content');
    
    const handleSpeedChange = (e) => {
        const sliderValue = parseInt(e.target.value);
        
        // Map slider value (10-100) inversely to duration (60s-10s) using linear interpolation
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
    };
    
    slider.addEventListener('input', handleSpeedChange);
}

// ==================== Hover Pause ====================
/**
 * Sets up hover event listeners to pause scrolling and highlighting
 */
function setupHoverPause() {
    const marqueeContainer = document.querySelector('.marquee-container');
    
    marqueeContainer.addEventListener('mouseenter', () => {
        isHovering = true;
    });
    
    marqueeContainer.addEventListener('mouseleave', () => {
        isHovering = false;
    });
}

// ==================== Initialization ====================
/**
 * Initialize the application when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize unit selector
    initializeUnitSelector();
    
    // Initialize marquee with words
    initializeMarquee();
    
    // Setup speed control
    setupSpeedControl();
    
    // Setup hover pause
    setupHoverPause();
    
    // Load voices for speech synthesis
    // Some browsers load voices asynchronously
    if ('speechSynthesis' in window) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            // Voices are loaded and available
        });
    }
});

// ==================== Cleanup ====================
/**
 * Cancel any ongoing speech and animation when page is unloaded
 */
window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});

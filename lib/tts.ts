/**
 * Professional Uzbek TTS Module for Queue Announcements
 * 
 * Strategy:
 * 1. Primary: Uses a server-side proxy to Google Translate TTS for natural Uzbek voice
 * 2. Fallback: Browser SpeechSynthesis with optimized settings
 */

let audioContext: AudioContext | null = null;
let currentAudio: HTMLAudioElement | null = null;

const numberToUzbekWords = (n: number): string => {
    const units = ["", "bir", "ikki", "uch", "to'rt", "besh", "olti", "yetti", "sakkiz", "to'qqiz"];
    const tens = ["", "o'n", "yigirma", "o'ttiz", "qirq", "ellik", "oltmish", "yetmish", "sakson", "to'qson"];
    const hundreds = ["", "yuz", "ikki yuz", "uch yuz", "to'rt yuz", "besh yuz", "olti yuz", "yetti yuz", "sakkiz yuz", "to'qqiz yuz"];

    if (n === 0) return "nol";
    if (n < 0) return "";

    let result = "";

    if (n >= 1000) {
        const thousands = Math.floor(n / 1000);
        result += (thousands === 1 ? "ming" : numberToUzbekWords(thousands) + " ming") + " ";
        n %= 1000;
    }

    if (n >= 100) {
        result += hundreds[Math.floor(n / 100)] + " ";
        n %= 100;
    }

    if (n >= 10) {
        result += tens[Math.floor(n / 10)] + " ";
        n %= 10;
    }

    if (n > 0) {
        result += units[n];
    }

    return result.trim();
};

const uzSpelling: { [key: string]: string } = {
    'A': 'A', 'B': 'Be', 'C': 'Se', 'D': 'De', 'E': 'E', 'F': 'Ef', 'G': 'Ge', 'H': 'Ha',
    'I': 'I', 'J': 'Je', 'K': 'Ka', 'L': 'El', 'M': 'Em', 'N': 'En', 'O': 'O', 'P': 'Pe',
    'Q': 'Qa', 'R': 'Er', 'S': 'Es', 'T': 'Te', 'U': 'U', 'V': 'Ve', 'X': 'Xa', 'Y': 'Ye', 'Z': 'Ze'
};

/**
 * Process text to make it more natural for TTS:
 * - Convert queue numbers (A001) to spoken words
 * - Expand abbreviations
 */
const preprocessText = (text: string): string => {
    let processed = text;

    // Handle queue number format like "A001", "K012" etc.
    // Pattern: letter(s) followed by digits in "raqami" context
    const queueMatch = processed.match(/raqami\s+([A-Z]?)(\d+)/i);
    if (queueMatch) {
        const letter = queueMatch[1] || "";
        const num = parseInt(queueMatch[2], 10);
        const numWords = numberToUzbekWords(num);
        // Spell out the letter naturally in Uzbek
        const letterSpoken = letter ? `${uzSpelling[letter.toUpperCase()] || letter}, ` : "";
        processed = processed.replace(
            /raqami\s+[A-Z]?\d+/i,
            `raqami ${letterSpoken}${numWords}`
        );
    }

    // Replace common abbreviations
    processed = processed
        .replace(/Dr\./gi, "doktor")
        .replace(/shifokor\s+qabuliga/gi, "shifokor qabuliga");

    // Add natural pauses with commas for clearer announcement
    processed = processed
        .replace(/marhamat,/gi, "marhamat, ,")
        .replace(/kiring\./gi, "kiring.");

    return processed;
};

/**
 * Split long text into chunks for Google TTS (max ~200 chars per request)
 */
const splitTextIntoChunks = (text: string, maxLen = 200): string[] => {
    if (text.length <= maxLen) return [text];

    const chunks: string[] = [];
    const sentences = text.split(/([,.!?;:])\s*/);
    let current = "";

    for (let i = 0; i < sentences.length; i++) {
        const part = sentences[i];
        if ((current + part).length > maxLen && current.length > 0) {
            chunks.push(current.trim());
            current = part;
        } else {
            current += part;
        }
    }
    if (current.trim()) {
        chunks.push(current.trim());
    }

    return chunks;
};

const API_BASE = "https://dental.api.ardentsoft.uz/api";

/**
 * Play audio using high-quality backend TTS proxy endpoint.
 * The backend proxies requests to deliver professional neural voices without CORS restrictions.
 */
const playGoogleTTS = async (text: string): Promise<boolean> => {
    try {
        const chunks = splitTextIntoChunks(text);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = encodeURIComponent(chunks[i]);
            const url = `${API_BASE}/clinic/tts/?text=${chunk}`;

            await new Promise<void>((resolve, reject) => {
                // Stop any currently playing audio
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio = null;
                }

                const audio = new Audio(url);
                currentAudio = audio;
                audio.volume = 1.0;

                audio.onended = () => {
                    currentAudio = null;
                    resolve();
                };
                audio.onerror = (err) => {
                    currentAudio = null;
                    reject(err);
                };

                audio.play().catch(reject);
            });

            // Small pause between chunks
            if (i < chunks.length - 1) {
                await new Promise(r => setTimeout(r, 300));
            }
        }

        return true;
    } catch (e) {
        console.warn("Google TTS failed, falling back to browser TTS:", e);
        return false;
    }
};

/**
 * Fallback: Browser SpeechSynthesis with optimized settings
 */
const playBrowserTTS = (text: string): void => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Priority order for voice selection:
    // 1. Uzbek voice (uz-UZ)
    // 2. Turkish voice (tr-TR) - closest related language
    // 3. Russian voice (ru-RU) - many Uzbek speakers understand Russian accent
    // 4. Default
    const uzVoice = voices.find(v => v.lang.startsWith('uz'));
    const trVoice = voices.find(v => v.lang.startsWith('tr'));
    const ruVoice = voices.find(v => v.lang.startsWith('ru'));

    if (uzVoice) {
        msg.voice = uzVoice;
        msg.lang = uzVoice.lang;
    } else if (trVoice) {
        msg.voice = trVoice;
        msg.lang = trVoice.lang;
    } else if (ruVoice) {
        // For Russian voice, transliterate Uzbek text to be more readable
        msg.voice = ruVoice;
        msg.lang = ruVoice.lang;
    } else {
        msg.lang = 'tr-TR';
    }

    msg.rate = 0.85;   // Slower for better clarity in clinical setting
    msg.pitch = 1.0;
    msg.volume = 1.0;

    window.speechSynthesis.speak(msg);
};

/**
 * Main TTS function: Play an Uzbek voice announcement
 * Tries Google TTS first, falls back to browser SpeechSynthesis
 */
export const playUzbekVoice = async (text: string): Promise<void> => {
    if (typeof window === "undefined") return;

    const processedText = preprocessText(text);

    // Try Google TTS first for natural Uzbek pronunciation
    const success = await playGoogleTTS(processedText);

    // If Google TTS fails, use browser fallback
    if (!success) {
        playBrowserTTS(processedText);
    }
};

/**
 * Play a "ding" notification sound before the announcement
 */
export const playAnnouncementWithDing = async (text: string): Promise<void> => {
    if (typeof window === "undefined") return;

    try {
        // Create a pleasant notification ding using Web Audio API
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Two-tone ding (like hospital/clinic notification)
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(830, ctx.currentTime);        // First tone
        oscillator.frequency.setValueAtTime(1050, ctx.currentTime + 0.15); // Second tone (higher)

        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.6);

        // Wait for ding to finish, then speak
        await new Promise(r => setTimeout(r, 800));
        await playUzbekVoice(text);

        ctx.close();
    } catch (e) {
        // If ding fails, just speak
        await playUzbekVoice(text);
    }
};

/**
 * Stop any currently playing audio or speech
 */
export const stopSpeaking = (): void => {
    if (typeof window === "undefined") return;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
};

/**
 * Initialize TTS: preload voices for browser fallback
 */
export const initTTS = (): void => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
        // Force voice list loading
        window.speechSynthesis.getVoices();

        // Some browsers need this event to populate voices
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
};

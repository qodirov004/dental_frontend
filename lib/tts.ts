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
 * - Convert queue numbers (e.g. A001, K15, A 3) to spoken Uzbek words
 * - Convert any other standalone numbers (like room numbers) to spoken Uzbek words
 * - Expand abbreviations and fix spellings
 */
const preprocessText = (text: string): string => {
    let processed = text;

    // 1. Spell out queue numbers like "A003" or "K 15" naturally anywhere in the text
    processed = processed.replace(/\b([A-Z])\s*0*([1-9]\d*|0)\b/gi, (match, letter, numStr) => {
        const num = parseInt(numStr, 10);
        const numWords = numberToUzbekWords(num);
        const letterSpoken = uzSpelling[letter.toUpperCase()] || letter;
        return `${letterSpoken} ${numWords}`;
    });

    // 2. Spell out any remaining standalone numbers (e.g. "2" in "2-xonaga")
    processed = processed.replace(/\b(\d+)\b/g, (match, numStr) => {
        const num = parseInt(numStr, 10);
        return numberToUzbekWords(num);
    });

    // Replace common abbreviations and typos for better accent
    processed = processed
        .replace(/xurmatli/gi, "hurmatli")
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

const getApiBase = (): string => {
    if (typeof window === "undefined") return "https://dental.api.ardentsoft.uz/api";
    const { protocol, hostname, port } = window.location;
    let resolvedHost = hostname;
    if (hostname === "localhost") {
        resolvedHost = "127.0.0.1";
    }

    // If in local development or local network, point to Django port 8000
    if (port === "3000" || port === "3001" || port === "3002" || resolvedHost === "127.0.0.1" || /^192\.168\./.test(resolvedHost)) {
        return `${protocol}//${resolvedHost}:8000/api`;
    }

    // Production/Staging fallback: use current domain/port
    return `${protocol}//${resolvedHost}${port ? `:${port}` : ""}/api`;
};

/**
 * Play audio using high-quality backend TTS proxy endpoint.
 * The backend proxies requests to deliver professional neural voices without CORS/User-Agent restrictions.
 */
const playGoogleTTS = async (text: string): Promise<boolean> => {
    try {
        const chunks = splitTextIntoChunks(text);
        const apiBase = getApiBase();

        for (let i = 0; i < chunks.length; i++) {
            const chunk = encodeURIComponent(chunks[i]);
            // Backend TTS proxy URL for genuine Uzbek voice
            const url = `${apiBase}/clinic/tts/?text=${chunk}`;

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
 * Phonetic transliteration from Latin Uzbek to Russian Cyrillic for browser voice fallback.
 * By mapping letters like q->к, h->х, and o'->о, the Russian TTS engine pronounces
 * the words with a highly accurate, natural-sounding Uzbek accent.
 */
const latinToCyrillic = (text: string): string => {
    const map: { [key: string]: string } = {
        "ch": "ч", "Ch": "Ч", "CH": "Ч",
        "sh": "ш", "Sh": "Ш", "SH": "Ш",
        "yo'": "ё", "Yo'": "Ё", "YO'": "Ё",
        "ya": "я", "Ya": "Я", "YA": "Я",
        "yu": "ю", "Yu": "Ю", "YU": "Ю",
        "ye": "е", "Ye": "Е", "YE": "Е",
        "o'": "о", "O'": "О", "g'": "г",
        "G'": "Г", "q": "к", "Q": "К",
        "h": "х", "H": "Х", "x": "х",
        "X": "Х", "a": "а", "A": "А",
        "b": "б", "B": "Б", "v": "в",
        "V": "В", "g": "г", "G": "Г",
        "d": "д", "D": "Д", "e": "е",
        "E": "Е", "j": "ж", "J": "Ж",
        "z": "з", "Z": "З", "i": "и",
        "I": "И", "k": "к", "K": "К",
        "l": "л", "L": "Л", "m": "м",
        "M": "М", "n": "н", "N": "Н",
        "o": "о", "O": "О", "p": "п",
        "P": "П", "r": "р", "R": "Р",
        "s": "с", "S": "С", "t": "т",
        "T": "Т", "u": "у", "U": "У",
        "f": "ф", "F": "Ф", "ts": "ц",
        "Ts": "Ц", "TS": "Ц"
    };

    let result = text;
    // Replace multi-character combinations first
    const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        const regex = new RegExp(key, 'g');
        result = result.replace(regex, map[key]);
    }
    return result;
};

/**
 * Fallback and Local SpeechSynthesis with Microsoft Madina (HD) priority
 */
const playBrowserTTS = (text: string): void => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();

    // Priority order for voice selection:
    // 1. Madina (HD) voice (Microsoft Madina Online) - stunning natural Uzbek voice
    // 2. Uzbek voice (uz-UZ)
    // 3. Turkish voice (tr-TR) - closest related language
    // 4. Russian voice (ru-RU) - fallback with phonetic transliteration
    // 5. Default
    const madinaVoice = voices.find(v => v.name.toLowerCase().includes('madina'));
    const uzVoice = voices.find(v => v.lang.startsWith('uz'));
    const trVoice = voices.find(v => v.lang.startsWith('tr'));
    const ruVoice = voices.find(v => v.lang.startsWith('ru'));

    let speakText = text;
    let selectedVoice: SpeechSynthesisVoice | null = null;
    let selectedLang = 'tr-TR';

    if (madinaVoice) {
        selectedVoice = madinaVoice;
        selectedLang = madinaVoice.lang;
    } else if (uzVoice) {
        selectedVoice = uzVoice;
        selectedLang = uzVoice.lang;
    } else if (trVoice) {
        selectedVoice = trVoice;
        selectedLang = trVoice.lang;
    } else if (ruVoice) {
        // Transliterate to Cyrillic so the Russian voice pronounces Uzbek beautifully
        selectedVoice = ruVoice;
        selectedLang = ruVoice.lang;
        speakText = latinToCyrillic(text);
    }

    const msg = new SpeechSynthesisUtterance(speakText);
    if (selectedVoice) {
        msg.voice = selectedVoice;
        msg.lang = selectedLang;
    } else {
        msg.lang = selectedLang;
    }

    msg.rate = 0.85;   // Slower for better clarity in clinical setting
    msg.pitch = 1.0;
    msg.volume = 1.0;

    window.speechSynthesis.speak(msg);
};

/**
 * Main TTS function: Play an Uzbek voice announcement
 * Tries Microsoft Madina (HD) natively first, then Google TTS backend proxy, then browser fallbacks
 */
export const playUzbekVoice = async (text: string): Promise<void> => {
    if (typeof window === "undefined") return;

    const processedText = preprocessText(text);

    // 1. Try to find the high-quality Microsoft Madina (HD) voice in SpeechSynthesis first.
    // If it is natively present, use it immediately for zero latency and HD quality!
    if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const madinaVoice = voices.find(v => v.name.toLowerCase().includes('madina'));

        if (madinaVoice) {
            console.log("Found native Microsoft Madina (HD) voice. Using for local synthesis:", madinaVoice.name);
            playBrowserTTS(processedText);
            return;
        }
    }

    // 2. Try Google TTS backend proxy next for natural Uzbek pronunciation
    const success = await playGoogleTTS(processedText);

    // 3. If Google TTS fails, use browser fallback
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

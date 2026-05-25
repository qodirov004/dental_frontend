/**
 * Professional Multi-language TTS Module for Queue Announcements (Uzbek & Russian)
 * 
 * Strategy:
 * 1. Primary: Uses a server-side proxy to Google Translate TTS for natural voice or browser SpeechSynthesis
 * 2. Fallback: Browser SpeechSynthesis with optimized settings
 * 
 * Uzbek Accent Strategy:
 * Since Google TTS and most browsers lack a native Uzbek voice, we leverage
 * the close linguistic relationship between Uzbek and Turkish (both Turkic languages).
 * By transliterating Uzbek text into Turkish phonetic equivalents, the Turkish TTS engine
 * produces a near-perfect, natural-sounding Uzbek accent.
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

/**
 * Converts cardinal numbers to ordinal words in Uzbek (e.g., 2 -> ikkinchi)
 * Uzbek ordinal suffix rules:
 * - After vowels (a, i, o, u, e): drop last vowel, add -nchi/-inchi
 * - After consonants: add -inchi
 * Special cases handled individually for accuracy.
 */
const numberToUzbekOrdinalWords = (n: number): string => {
    // Hardcoded ordinals for common numbers to guarantee correctness
    const ordinals: { [key: number]: string } = {
        1: "birinchi",
        2: "ikkinchi",
        3: "uchinchi",
        4: "to'rtinchi",
        5: "beshinchi",
        6: "oltinchi",
        7: "yettinchi",
        8: "sakkizinchi",
        9: "to'qqizinchi",
        10: "o'ninchi",
    };

    if (ordinals[n]) return ordinals[n];

    const cardinal = numberToUzbekWords(n);
    if (!cardinal) return "";

    // General rule: add -inchi after consonant, -nchi after vowel
    const lastChar = cardinal[cardinal.length - 1];
    const vowels = ['a', 'i', 'o', 'u', 'e'];

    if (vowels.includes(lastChar)) {
        return cardinal + "nchi";
    }
    return cardinal + "inchi";
};

const numberToRussianWords = (n: number): string => {
    const units = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
    const teens = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
    const tens = ["", "десять", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
    const hundreds = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];

    if (n === 0) return "ноль";
    if (n < 0) return "";

    let result = "";

    if (n >= 1000) {
        const thousands = Math.floor(n / 1000);
        if (thousands === 1) {
            result += "тысяча ";
        } else if (thousands === 2) {
            result += "две тысячи ";
        } else if (thousands === 3 || thousands === 4) {
            result += numberToRussianWords(thousands) + " тысячи ";
        } else {
            result += numberToRussianWords(thousands) + " тысяч ";
        }
        n %= 1000;
    }

    if (n >= 100) {
        result += hundreds[Math.floor(n / 100)] + " ";
        n %= 100;
    }

    if (n >= 20) {
        result += tens[Math.floor(n / 10)] + " ";
        n %= 10;
    } else if (n >= 10) {
        result += teens[n - 10] + " ";
        n = 0;
    }

    if (n > 0) {
        result += units[n] + " ";
    }

    return result.trim();
};

const uzSpelling: { [key: string]: string } = {
    'A': 'A', 'B': 'Be', 'C': 'Se', 'D': 'De', 'E': 'E', 'F': 'Ef', 'G': 'Ge', 'H': 'Ha',
    'I': 'I', 'J': 'Je', 'K': 'Ka', 'L': 'El', 'M': 'Em', 'N': 'En', 'O': 'O', 'P': 'Pe',
    'Q': 'Qa', 'R': 'Er', 'S': 'Es', 'T': 'Te', 'U': 'U', 'V': 'Ve', 'X': 'Xa', 'Y': 'Ye', 'Z': 'Ze'
};

const ruSpelling: { [key: string]: string } = {
    'A': 'А', 'B': 'Бэ', 'C': 'Цэ', 'D': 'Дэ', 'E': 'Е', 'F': 'Эф', 'G': 'Гэ', 'H': 'Ха',
    'I': 'И', 'J': 'Же', 'K': 'Ка', 'L': 'Эль', 'M': 'Эм', 'N': 'Эн', 'O': 'О', 'P': 'Пэ',
    'Q': 'Ку', 'R': 'Эр', 'S': 'Эс', 'T': 'Тэ', 'U': 'У', 'V': 'Вэ', 'W': 'Дабл-ю', 'X': 'Икс',
    'Y': 'Игрек', 'Z': 'Зет'
};

/**
 * Process text to make it more natural for TTS:
 * - Convert queue numbers (e.g. A001, K15, A 3) to spoken Uzbek words
 * - Convert ordinal numbers (e.g. 2-xona -> ikkinchi xona) to correct Uzbek ordinal words
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
        return `${letterSpoken}, ${numWords}`;
    });

    // 2. Spell out ordinal numbers naturally (e.g., "2-xona" -> "ikkinchi xona")
    processed = processed.replace(/\b(\d+)-xona/gi, (match, numStr) => {
        const num = parseInt(numStr, 10);
        return numberToUzbekOrdinalWords(num) + " xona";
    });

    // 3. Spell out any remaining standalone numbers
    processed = processed.replace(/\b(\d+)\b/g, (match, numStr) => {
        const num = parseInt(numStr, 10);
        return numberToUzbekWords(num);
    });

    // Replace common abbreviations and typos for better accent
    processed = processed
        .replace(/xurmatli/gi, "hurmatli")
        .replace(/Dr\./gi, "doktor")
        .replace(/shifokor\s+qabuliga/gi, "shifokor qabuliga");

    return processed;
};

/**
 * Preprocess Russian text to make it natural for Russian TTS:
 * - Convert queue numbers (e.g. A001, K15) to spoken Russian phonetic spelling and words
 * - Convert any other numbers to Russian words
 */
const preprocessRussianText = (text: string): string => {
    let processed = text;

    // 1. Spell out queue numbers like "A003" or "K 15" naturally anywhere in the text
    processed = processed.replace(/\b([A-Z])\s*0*([1-9]\d*|0)\b/gi, (match, letter, numStr) => {
        const num = parseInt(numStr, 10);
        const numWords = numberToRussianWords(num);
        const letterSpoken = ruSpelling[letter.toUpperCase()] || letter;
        return `${letterSpoken} ${numWords}`;
    });

    // 2. Spell out any remaining standalone numbers
    processed = processed.replace(/\b(\d+)\b/g, (match, numStr) => {
        const num = parseInt(numStr, 10);
        return numberToRussianWords(num);
    });

    // Expand doctor prefix
    processed = processed
        .replace(/Dr\./gi, "доктору")
        .replace(/доктор\s+/gi, "доктору ");

    return processed;
};

/**
 * Advanced transliteration from Latin Uzbek to Turkish phonetics for pure Uzbek accent.
 * 
 * Turkish and Uzbek share Turkic roots with nearly identical vowel harmony,
 * agglutinative structure, and prosodic patterns. This comprehensive mapping
 * ensures the Turkish TTS engine produces authentic Uzbek pronunciation.
 * 
 * Key mappings:
 * - o' (ўзбек ō) → ö (Turkish ö) — the critical Uzbek mid-rounded vowel
 * - g' (ғ) → ğ (Turkish soft-g) — uvular/velar fricative  
 * - sh → ş, ch → ç — standard Turkic sibilant mapping
 * - j → c (Uzbek ж = Turkish c [dʒ])
 * - q → k (Uzbek uvular q approximated as Turkish k)
 * - x → h (Uzbek velar x approximated as Turkish h)
 * - ng → special nasal handling
 */
const latinToTurkishPhonetic = (text: string): string => {
    let processed = text;

    // Word-level replacements for common announcement words to ensure perfect pronunciation
    const wordMap: { [key: string]: string } = {
        "hurmatli": "hürmetli",
        "marhamat": "marhamat",
        "mijoz": "micöz",
        "xona": "höna",
        "xonaga": "hönaga",
        "doktor": "doktör",
        "shifokor": "şifökör",
        "qabuliga": "kabuliga",
        "kiring": "kiring",
        "kabinetga": "kabinetga",
    };

    // Apply word-level replacements (case-insensitive, preserving sentence position)
    for (const [uzWord, trWord] of Object.entries(wordMap)) {
        const regex = new RegExp(`\\b${uzWord}\\b`, 'gi');
        processed = processed.replace(regex, (match) => {
            // Preserve capitalization of first letter
            if (match[0] === match[0].toUpperCase()) {
                return trWord[0].toUpperCase() + trWord.slice(1);
            }
            return trWord;
        });
    }

    // Multi-character combinations (must come before single character replacements)
    processed = processed
        // Tri-graphs first
        .replace(/ng'/gi, 'ñ')   // ng' combination
        
        // Di-graphs
        .replace(/ch/gi, (m) => m[0] === m[0].toUpperCase() ? 'Ç' : 'ç')
        .replace(/sh/gi, (m) => m[0] === m[0].toUpperCase() ? 'Ş' : 'ş')
        .replace(/ng/gi, 'ng')   // Turkish ng is close enough
        .replace(/o'/gi, 'ö')
        .replace(/O'/gi, 'Ö')
        .replace(/g'/gi, 'ğ')
        .replace(/G'/gi, 'Ğ')
        
        // Single characters  
        .replace(/j/gi, (m) => m === 'J' ? 'C' : 'c')
        .replace(/q/gi, (m) => m === 'Q' ? 'K' : 'k')
        .replace(/x/gi, (m) => m === 'X' ? 'H' : 'h');

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
    return `${protocol}//${resolvedHost}${port ? `:${port}` : ""}`;
};

/**
 * Play audio using high-quality backend TTS proxy endpoint.
 * 
 * CRITICAL for Uzbek: We send Turkish-transliterated text with lang=tr
 * because Google TTS has no native Uzbek voice. The Turkish voice engine
 * is the closest match for natural Uzbek pronunciation.
 */
const playGoogleTTS = async (text: string, lang: 'uz' | 'ru' = 'uz'): Promise<boolean> => {
    try {
        // For Uzbek: transliterate to Turkish phonetics and use Turkish voice
        let ttsText = text;
        let ttsLang = lang;
        
        if (lang === 'uz') {
            ttsText = latinToTurkishPhonetic(text);
            ttsLang = 'tr' as any; // Use Turkish voice for natural Uzbek accent
        }

        const chunks = splitTextIntoChunks(ttsText);
        const apiBase = getApiBase();

        for (let i = 0; i < chunks.length; i++) {
            const chunk = encodeURIComponent(chunks[i]);
            // Backend TTS proxy URL — use 'tr' for Uzbek, 'ru' for Russian
            const url = `${apiBase}/clinic/tts/?text=${chunk}&lang=${ttsLang}`;

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
 * Play Uzbek announcement using the native Microsoft Madina (HD) voice.
 * Madina is a neural uz-UZ voice — no transliteration needed.
 * We send clean Uzbek Latin text directly.
 * Returns a Promise that resolves when speech finishes.
 */
const playMadinaTTS = (text: string, voice: SpeechSynthesisVoice): Promise<void> => {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) { resolve(); return; }

        window.speechSynthesis.cancel();

        const msg = new SpeechSynthesisUtterance(text);
        msg.voice = voice;
        msg.lang = voice.lang || 'uz-UZ';

        // Natural Uzbek accent — normal speed, natural pitch, no artificial tweaks
        msg.rate = 0.92;
        msg.pitch = 1.0;
        msg.volume = 1.0;

        msg.onend = () => resolve();
        msg.onerror = () => resolve();

        window.speechSynthesis.speak(msg);

        console.log(`🎙️ Madina HD: "${text.substring(0, 80)}..." | rate=${msg.rate} pitch=${msg.pitch}`);
    });
};

/**
 * Fallback Browser SpeechSynthesis (when Madina is not available)
 */
const playBrowserTTS = (text: string, lang: 'uz' | 'ru' = 'uz'): void => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();

    let speakText = text;
    let selectedVoice: SpeechSynthesisVoice | null = null;
    let selectedLang = lang === 'uz' ? 'tr-TR' : 'ru-RU';

    if (lang === 'ru') {
        const premiumRuVoice = voices.find(v => v.lang.startsWith('ru') && v.name.toLowerCase().includes('google'));
        const microsoftRuVoice = voices.find(v => v.lang.startsWith('ru') && v.name.toLowerCase().includes('microsoft'));
        const genericRuVoice = voices.find(v => v.lang.startsWith('ru'));
        selectedVoice = premiumRuVoice || microsoftRuVoice || genericRuVoice || null;
        selectedLang = 'ru-RU';
    } else {
        // Priority: Uzbek voice > Turkish (with transliteration) > Russian (with Cyrillic)
        const uzVoice = voices.find(v => v.lang.startsWith('uz'));
        const trVoice = voices.find(v => v.lang.startsWith('tr'));
        const ruVoice = voices.find(v => v.lang.startsWith('ru'));

        if (uzVoice) {
            selectedVoice = uzVoice;
            selectedLang = uzVoice.lang;
        } else if (trVoice) {
            selectedVoice = trVoice;
            selectedLang = trVoice.lang;
            speakText = latinToTurkishPhonetic(text);
        } else if (ruVoice) {
            selectedVoice = ruVoice;
            selectedLang = ruVoice.lang;
            speakText = latinToCyrillic(text);
        }
    }

    const msg = new SpeechSynthesisUtterance(speakText);
    if (selectedVoice) {
        msg.voice = selectedVoice;
        msg.lang = selectedLang;
    } else {
        msg.lang = selectedLang;
    }

    msg.rate = lang === 'ru' ? 0.9 : 0.85;
    msg.pitch = 1.0;
    msg.volume = 1.0;

    window.speechSynthesis.speak(msg);
};

/**
 * Main TTS function: Play a voice announcement (Uzbek or Russian)
 */
export const playVoice = async (text: string, lang: 'uz' | 'ru' = 'uz'): Promise<void> => {
    if (typeof window === "undefined") return;

    if (lang === 'ru') {
        const processedText = preprocessRussianText(text);

        // Try local SpeechSynthesis first for Russian as it is extremely high quality on most systems
        if (window.speechSynthesis) {
            const voices = window.speechSynthesis.getVoices();
            const ruVoice = voices.find(v => v.lang.startsWith('ru'));
            if (ruVoice) {
                console.log("Found native Russian voice. Using local SpeechSynthesis.");
                playBrowserTTS(processedText, 'ru');
                return;
            }
        }

        // Fallback to Google TTS proxy with lang=ru
        const success = await playGoogleTTS(processedText, 'ru');
        if (!success) {
            playBrowserTTS(processedText, 'ru');
        }
    } else {
        const processedText = preprocessText(text);

        // === PRIORITY 1: Microsoft Madina (HD) — Native Uzbek Neural Voice ===
        // This is the BEST option. Madina speaks pure, native Uzbek.
        // No transliteration needed — just clean o'zbek lotin yozuvi.
        if (window.speechSynthesis) {
            const voices = window.speechSynthesis.getVoices();
            const madinaVoice = voices.find(v => 
                v.name.toLowerCase().includes('madina') || 
                (v.lang.startsWith('uz') && v.name.toLowerCase().includes('microsoft'))
            );

            if (madinaVoice) {
                console.log("✅ Madina (HD) topildi! Toza o'zbek ovozi ishlatilmoqda:", madinaVoice.name);
                await playMadinaTTS(processedText, madinaVoice);
                return;
            }
        }

        // === PRIORITY 2: Google TTS with Turkish transliteration ===
        const success = await playGoogleTTS(processedText, 'uz');

        // === PRIORITY 3: Browser fallback (Turkish or Russian voice) ===
        if (!success) {
            playBrowserTTS(processedText, 'uz');
        }
    }
};

/**
 * Legacy wrapper to maintain strict backward compatibility for playUzbekVoice
 */
export const playUzbekVoice = async (text: string): Promise<void> => {
    return playVoice(text, 'uz');
};

/**
 * Play a "ding" notification sound before the announcement
 */
export const playAnnouncementWithDing = async (text: string, lang: 'uz' | 'ru' = 'uz'): Promise<void> => {
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
        await playVoice(text, lang);

        ctx.close();
    } catch (e) {
        // If ding fails, just speak
        await playVoice(text, lang);
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

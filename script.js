// Game State
let coins = 1000;
let satisfaction = 85;
let xp = 0;
let soundEnabled = true;
let unlockedLevels = [1];
let currentLevel = 1;

// Web Audio API Synthesizer (Zero External Dependencies)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSound(type) {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'coin') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(987.77, now); // B5
            osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'victory') {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(freq, now + idx * 0.12);
                o.connect(g);
                g.connect(ctx.destination);
                g.gain.setValueAtTime(0.2, now + idx * 0.12);
                g.gain.linearRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
                o.start(now + idx * 0.12);
                o.stop(now + idx * 0.12 + 0.3);
            });
        }
    } catch (e) {
        console.log('Audio error:', e);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = document.getElementById('sound-icon');
    const text = document.getElementById('sound-text');
    if (soundEnabled) {
        icon.innerText = '🔊';
        text.innerText = 'صدا: فعال';
        playSound('click');
    } else {
        icon.innerText = '🔇';
        text.innerText = 'صدا: غیرفعال';
    }
}

// Level Data
const levelsData = {
    1: {
        title: 'مرحله ۱: جزیره کارآفرینی & مرز امکانات تولید',
        speaker: 'آرش (کارآفرین جوان)',
        avatar: '🍦',
        dialogue: 'سلام! به کارگاه تولیدی ما خوش آمدید. ما با محدودیت منابع (شیر و شکر) روبرو هستیم. می‌خواهیم تولید بستنی و آبمیوه را به حداکثر نقطه کارایی روی مرز امکانات تولید (PPF) برسانیم تا دچار ناکارایی یا اتلاف منابع نشویم.',
        options: [
            {
                icon: '🚀',
                text: 'سرمایه‌گذاری روی فناوری دانش‌بنیان (انتقال منحنی مرز امکانات به سمت راست)',
                resultTitle: '🎯 تصمیم فوق‌العاده و هوشمندانه!',
                resultText: 'با ورود ماشین‌آلات مدرن، ظرفیت تولید کارگاه ۲۰٪ افزایش یافت و مرز امکانات به سمت راست منتقل شد! آرش توانست بدون اتلاف منابع، بستنی و آبمیوه بیشتری تولید کند.',
                coinsReward: 300,
                satReward: 10,
                xpReward: 200
            },
            {
                icon: '⚖️',
                text: 'تنظیم دقیق خط تولید روی نقطه ج (تولید کارا روی خودِ منحنی مرز)',
                resultTitle: '✅ انتخاب عالی و کارا!',
                resultText: 'تولید دقیقاً روی منحنی مرز امکانات قرار گرفت. در این حالت تمام منابع کارگاه کاملاً استفاده شده و هیچ بیکاری یا اتلافی وجود ندارد.',
                coinsReward: 200,
                satReward: 5,
                xpReward: 150
            },
            {
                icon: '⚠️',
                text: 'تمرکز تک‌محصولی (تولید فقط یک کالا و فدا کردن کالای دیگر)',
                resultTitle: '⚠️ ایجاد هزینه فرصت بالا!',
                resultText: 'هرچند یک محصول زیاد شد، اما هزینه فرصت از دست رفتن محصول دیگر بالا رفت. سعی کنید متوازن‌تر تصمیم بگیرید.',
                coinsReward: 100,
                satReward: 0,
                xpReward: 80
            }
        ]
    },
    2: {
        title: 'مرحله ۲: شهر بازار & نقش دولت',
        speaker: 'سارا (خریدار هوشمند بازار)',
        avatar: '🛒',
        dialogue: 'سلام! در بازار شهر نوسان قیمت رخ داده است. اگر قیمت خیلی بالا باشد، خریداران عقب می‌نشینند و مازاد عرضه رخ می‌دهد؛ و اگر قیمت خیلی پایین باشد، صف‌های طولانی و کمبود کالا به وجود می‌آید. همچنین دولت برای امنیت و جاده به منابع مالی نیاز دارد.',
        options: [
            {
                icon: '⚖️',
                text: 'تنظیم قیمت در نقطه تعادل بازار (تلاقی دقیق منحنی عرضه و تقاضا)',
                resultTitle: '🟢 بازار در تعادل کامل قرار گرفت!',
                resultText: 'در قیمت تعادلی، مقدار عرضه با تقاضا برابر شد! نه جنسی روی دست فروشنده ماند و نه مشتری ناامید از بازار برگشت.',
                coinsReward: 300,
                satReward: 10,
                xpReward: 200
            },
            {
                icon: '🏛️',
                text: 'پرداخت مالیات قانونی جهت تامین کالاهای عمومی و جاده‌های ترانزیت',
                resultTitle: '🏛️ عمران و امنیت شهر تامین شد!',
                resultText: 'با پرداخت مالیات، دولت توانست زیرساخت‌های حمل‌ونقل و امنیت بازار را ارتقا دهد و هزینه‌های مبادله کارخانه‌ها کاهش یافت.',
                coinsReward: 250,
                satReward: 12,
                xpReward: 180
            },
            {
                icon: '📦',
                text: 'قیمت‌گذاری دستوری بسیار پایین‌تر از تعادل',
                resultTitle: '🚨 بروز کمبود کالا و تشکیل بازار سیاه!',
                resultText: 'قیمت پایین باعث صف‌های طولانی و نایاب شدن کالا شد. بازار نیازمند تعادل طبیعی عرضه و تقاضا است.',
                coinsReward: 50,
                satReward: -5,
                xpReward: 60
            }
        ]
    },
    3: {
        title: 'مرحله ۳: پایتخت اقتصاد کلان & مهار تورم',
        speaker: 'استاد بهنام (مشاور کلان اقتصاد)',
        avatar: '📊',
        dialogue: 'خوش آمدید! در سطح کلان، رشد نقدینگی سرگردان بدون رشد تولید باعث بروز تورم شده و قدرت خرید مردم را کاهش داده است. برای افزایش واقعی تولید ناخالص داخلی (GDP) چه برنامه‌ای دارید؟',
        options: [
            {
                icon: '🧠',
                text: 'هدایت نقدینگی به سمت شرکت‌های دانش‌بنیان و رشد تولید واقعی',
                resultTitle: '🚀 مهار تورم و رشد پایداری اقتصاد!',
                resultText: 'با هدایت پول به سمت تولید دانش‌بنیان، عرضه کالاها افزایش یافت و تورم کنترل شد. تولید واقعی ناخالص داخلی (Real GDP) رشد کرد!',
                coinsReward: 350,
                satReward: 15,
                xpReward: 250
            },
            {
                icon: '🏦',
                text: 'فروش اوراق مشارکت و جذب نقدینگی سرگردان جامعه',
                resultTitle: '🏦 نقدینگی زائد جمع‌آوری شد!',
                resultText: 'بانک مرکزی با عرضه اوراق مشارکت توانست پول سرگردان را از بازار جمع کند و فشار تورمی کاهش یافت.',
                coinsReward: 300,
                satReward: 10,
                xpReward: 200
            },
            {
                icon: '🖨️',
                text: 'چاپ پول بدون پشتوانه برای جبران کسری بودجه',
                resultTitle: '🚨 تشدید تورم و کاهش قدرت خرید!',
                resultText: 'چاپ پول بدون رشد تولید، ارزش پول ملی را کاهش داد. باید نقدینگی به سمت بخش مولد هدایت شود.',
                coinsReward: 50,
                satReward: -10,
                xpReward: 40
            }
        ]
    },
    4: {
        title: 'مرحله ۴: دژ هوش مالی & بورس',
        speaker: 'نوید (تحلیل‌گر بازار دارایی)',
        avatar: '📈',
        dialogue: 'مرحله نهایی! برای حفظ ارزش پس‌انداز و قدرت خرید در برابر تورم، مدیریت دارایی بسیار حیاتی است. بهترین فرمول ترکیب سبد دارایی شخصی چیست؟',
        options: [
            {
                icon: '💎',
                text: 'تشکیل سبد دارایی متنوع (تقسیم پس‌انداز بین طلا، بورس، صندوق و سپرده)',
                resultTitle: '🏆 مدیریت عالی سبد دارایی و پوشش کامل تورم!',
                resultText: 'با تنوع‌بخشی به دارایی‌ها، ریسک سرمایه‌گذاری به حداقل رسید و قدرت خرید خانوار در برابر تورم کاملاً حفظ شد!',
                coinsReward: 400,
                satReward: 15,
                xpReward: 300
            },
            {
                icon: '🛡️',
                text: 'استفاده از پوشش بیمه و سرمایه‌گذاری در صندوق‌های با درآمد ثابت',
                resultTitle: '🛡️ امنیت کامل مالی و کاهش ریسک!',
                resultText: 'بیمه و صندوق‌های مطمئن باعث شدند که حوادث غیرمترقبه آسیب مالی ایجاد نکنند و سود باثبات حاصل شود.',
                coinsReward: 300,
                satReward: 10,
                xpReward: 220
            },
            {
                icon: '🎲',
                text: 'سرمایه‌گذاری هیجانی و تک‌دارایی در بازار غیررسمی',
                resultTitle: '⚠️ ریسک بالا و احتمال زیان!',
                resultText: 'قرار دادن تمام دارایی در یک بازار پرریسک خطرناک است. همواره اصل تنوع‌بخشی به سبد دارایی را رعایت کنید.',
                coinsReward: 100,
                satReward: 0,
                xpReward: 80
            }
        ]
    }
};

function updateStatusBar() {
    document.getElementById('coins-val').innerText = coins;
    document.getElementById('satisfaction-val').innerText = satisfaction + '%';
    document.getElementById('xp-val').innerText = xp;
}

function startLevel(levelNum) {
    playSound('click');
    currentLevel = levelNum;
    const level = levelsData[levelNum];
    if (!level) return;

    document.getElementById('modal-step-badge').innerText = `مرحله ${levelNum}`;
    document.getElementById('modal-title').innerText = level.title;
    document.getElementById('modal-avatar').innerText = level.avatar;
    document.getElementById('modal-speaker').innerText = level.speaker;
    document.getElementById('modal-dialogue').innerText = level.dialogue;

    // Render Options
    const optionsGrid = document.getElementById('modal-options');
    optionsGrid.innerHTML = '';

    level.options.forEach((opt, idx) => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.onclick = () => selectOption(idx);
        card.innerHTML = `
            <span class="option-icon">${opt.icon}</span>
            <span class="option-text">${opt.text}</span>
        `;
        optionsGrid.appendChild(card);
    });

    document.getElementById('modal-outcome').classList.add('hidden');
    document.getElementById('game-modal').classList.remove('hidden');
}

function selectOption(optIdx) {
    const level = levelsData[currentLevel];
    const opt = level.options[optIdx];

    coins += opt.coinsReward;
    satisfaction = Math.min(100, Math.max(0, satisfaction + opt.satReward));
    xp += opt.xpReward;
    updateStatusBar();

    playSound('coin');

    document.getElementById('outcome-header').innerText = opt.resultTitle;
    document.getElementById('outcome-text').innerText = opt.resultText;
    document.getElementById('outcome-rewards').innerHTML = `
        <span>🪙 +${opt.coinsReward} سکه</span>
        <span>❤️ ${opt.satReward >= 0 ? '+' : ''}${opt.satReward}% رضایت</span>
        <span>⭐ +${opt.xpReward} XP</span>
    `;

    document.getElementById('modal-outcome').classList.remove('hidden');

    // Unlock next level
    const nextLvl = currentLevel + 1;
    if (nextLvl <= 4 && !unlockedLevels.includes(nextLvl)) {
        unlockedLevels.push(nextLvl);
        unlockLevelUI(nextLvl);
    }
}

function unlockLevelUI(lvlNum) {
    const card = document.getElementById(`card-level-${lvlNum}`);
    if (card) {
        card.classList.remove('locked');
        card.classList.add('unlocked');
    }
    const status = document.getElementById(`status-level-${lvlNum}`);
    if (status) {
        status.innerText = '🟢 آماده بازی';
        status.className = 'status-indicator unlocked-text';
    }
    const btn = document.getElementById(`btn-level-${lvlNum}`);
    if (btn) {
        btn.disabled = false;
        btn.classList.remove('locked-btn');
        btn.innerText = `شروع مرحله ${lvlNum} 🚀`;
    }
}

function nextStep() {
    playSound('click');
    closeModal();

    if (currentLevel === 4) {
        showVictory();
    }
}

function closeModal() {
    document.getElementById('game-modal').classList.add('hidden');
}

function showVictory() {
    playSound('victory');
    document.getElementById('final-cert-xp').innerText = `${xp} XP`;
    document.getElementById('final-cert-sat').innerText = `${satisfaction}%`;
    document.getElementById('victory-modal').classList.remove('hidden');
}

function restartGame() {
    playSound('click');
    coins = 1000;
    satisfaction = 85;
    xp = 0;
    unlockedLevels = [1];
    currentLevel = 1;
    updateStatusBar();

    for (let i = 2; i <= 4; i++) {
        const card = document.getElementById(`card-level-${i}`);
        if (card) {
            card.classList.remove('unlocked');
            card.classList.add('locked');
        }
        const status = document.getElementById(`status-level-${i}`);
        if (status) {
            status.innerText = '🔒 قفل است';
            status.className = 'status-indicator locked-text';
        }
        const btn = document.getElementById(`btn-level-${i}`);
        if (btn) {
            btn.disabled = true;
            btn.classList.add('locked-btn');
            btn.innerText = `شروع مرحله ${i} 🔒`;
        }
    }

    document.getElementById('victory-modal').classList.hidden = true;
    document.getElementById('victory-modal').classList.add('hidden');
}

window.onload = function() {
    updateStatusBar();
};
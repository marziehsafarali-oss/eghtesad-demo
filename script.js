// Adventure Game Logic & Level Quests
let playerScore = 0;
let unlockedLevel = 1;
let levelStars = { 1: 0, 2: 0, 3: 0, 4: 0 };
let currentActiveLevel = 1;
let currentQuestStepIndex = 0;
let selectedOptionIndex = null;

// Sound Effects Engine
function playSFX(type) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5
        osc.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.08); // E6
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'victory') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.30); // G5
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.45); // C6
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
    } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.setValueAtTime(150, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }
}

// LEVEL QUEST DATA (Curriculum-based Adventure)
const levelData = {
    1: {
        title: "جزیره کارآفرینی & مرز امکانات",
        avatar: "👷‍♂️",
        charName: "آرش (کارآفرین جوان):",
        quests: [
            {
                dialogue: "سلام! ما توی کارگاهمون فقط ۱۰۰ واحد نیروی کار داریم. اگر همه رو بذاریم روی بستنی، ۱۰۰۰ بستنی تولید میشه و صفر آبمیوه (نقطه الف). اگر ۵۰۷ تا بستنی بپزیم و ۲۰۰ تا آبمیوه، روی مرز هستیم (نقطه ج). حالا اگر بخوایم ۵۰ تا آبمیوه بیشتر تولید کنیم، باید از چی بگذریم؟",
                question: "هزینه فرصتِ تولید آبمیوه اضافی چیست؟",
                options: [
                    "دستپخت کارگران کارخانه",
                    "مقدار بستنی که به خاطر تخصیص منابع کمتر تولید می‌شود",
                    "قیمت فروش آبمیوه در مغازه",
                    "هزینه برق و گاز کارگاه"
                ],
                correct: 1,
                explanation: "آفرین! هزینه فرصت یعنی از دست دادن بهترین جایگزین (در اینجا مقدار بستنی کاهش‌یافته) برای به دست آوردن کالای دیگر!"
            },
            {
                dialogue: "بازرس اومده کارگاه و می‌گه: 'شما الان ۵۵۰ تا بستنی و ۲۰۰ تا آبمیوه تولید می‌کنید (نقطه ز)؛ در حالی که می‌تونستید با همین امکانات ۷۵۰ تا بستنی بسازید!' این وضعیت یعنی چی؟",
                question: "نقطه ز (داخل مرز امکانات) نشان‌دهنده چیست؟",
                options: [
                    "تولید فوق‌العاده و جادویی",
                    "ناکارایی و اتلاف/بیکاری منابع کارگاه",
                    "نقطه غیرقابل دستیابی با تکنولوژی امروز",
                    "نقطه تعادل بازار"
                ],
                correct: 1,
                explanation: "دقیقاً! هر نقطه‌ای داخل منحنی PPF نشان‌دهنده اتلاف منابع و بیکاری عوامل تولید (ناکارایی) است."
            },
            {
                dialogue: "حالا می‌خوایم مرز امکانات تولید کارگاه رو کلاً به سمت راست منتقل کنیم تا به نقطه ح (خارج از مرز فعلی) برسیم. بهترین راهکار چیه؟",
                question: "کدام عامل باعث انتقال مرز امکانات تولید به سمت راست می‌شود؟",
                options: [
                    "کاهش حقوق کارگران",
                    "سرمایه‌گذاری دانش‌بنیان و ارتقای فناوری دستگاه‌ها",
                    "تعطیل کردن خط تولید آبمیوه",
                    "افزایش قیمت بستنی در بازار"
                ],
                correct: 1,
                explanation: "عالی بود! ارتقای فناوری و افزایش منابع باعث رشد اقتصادی و انتقال مرز PPF به سمت راست می‌شود."
            }
        ]
    },
    2: {
        title: "شهر بازار & دخالت دولت",
        avatar: "👩‍💼",
        charName: "سارا (نماینده خریداران در بازار):",
        quests: [
            {
                dialogue: "به شهر بازار خوش آمدید! فروشندگان بستنی قیمت هر بستنی رو ۳۵۰ timeline/تومان گذاشتن. خریدارها صف کشیدن و خشمگینن چون جنس کمه و قیمت خیلی بالاست! برای رسیدن به نقطه تعادل (Equilibrium) چیکار کنیم؟",
                question: "در وضعیت مازاد تقاضا و صف خریداران، قیمت تعادلی چگونه شکل می‌گیرد؟",
                options: [
                    "قیمت باید تا نقطه‌ای که مقدار عرضه و تقاضا برابر شود تعدیل گردد",
                    "فروشندگان باید مغازه‌ها را ببندند",
                    "دولت خرید بستنی را ممنوع کند",
                    "تقاضا کلاً صفر شود"
                ],
                correct: 0,
                explanation: "درست است! در قیمت تعادلی، منحنی عرضه و تقاضا متقاطع شده و صف و کمبود کالا از بین می‌رود."
            },
            {
                dialogue: "دولت برای احداث جاده کارخانه تا بازار و تامین امنیت شهر احتیاج به درآمد دارد. این هزینه‌ها از چه منبعی تامین می‌شود؟",
                question: "کالاهای عمومی و زیرساخت‌ها عمدتاً از چه راهی تامین مالی می‌شوند؟",
                options: [
                    "چاپ بی‌رویه اسکناس",
                    "دریافت مالیات و عوارض قانونی",
                    "وام گرفتن از کشورهای خارجی",
                    "فروش کارخانه‌های خصوصی"
                ],
                correct: 1,
                explanation: "کاملاً صحیح! مالیات منبع اصلی دولت برای ارائه خدمات عمومی و ساخت زیرساخت‌هاست."
            }
        ]
    },
    3: {
        title: "پایتخت اقتصاد کلان",
        avatar: "👨‍🏫",
        charName: "استاد بهنام (تحلیل‌گر اقتصاد کلان):",
        quests: [
            {
                dialogue: "در پایتخت، غول تورم بیدار شده! نقدینگی در دست مردم زیاد شده و قیمت‌ها مدام بالا می‌روند. بانک مرکزی برای مهار تورم چه کار کلانی انجام دهد؟",
                question: "کدام سیاست کلان به کاهش و مهار نرخ تورم کمک می‌کند؟",
                options: [
                    "چاپ مجدد پول و پخش در خیابان",
                    "جمع‌آوری نقدینگی سرگردان با اوراق مشارکت و هدایت به تولید دانش‌بنیان",
                    "افزایش هزینه‌های جاری دولت",
                    "کاهش تولید کارخانه‌ها"
                ],
                correct: 1,
                explanation: "درخشان! جمع‌آوری نقدینگی و هدایت آن به سمت خطوط تولید واقعی، غول تورم را مهار می‌کند."
            }
        ]
    },
    4: {
        title: "قلعه بورس & سبد دارایی",
        avatar: "🧑‍💻",
        charName: "نوید (مشاور مالی و بورس):",
        quests: [
            {
                dialogue: "شما ۵۰ میلیون تومان پس‌انداز دارید و می‌خواهید قدرت خریدتان را در برابر تورم حفظ کنید. بهترین استراتژی هوش مالی چیست؟",
                question: "اصل «عدم قرار دادن تمام تخم‌مرغ‌ها در یک سبد» در پس‌انداز یعنی چه؟",
                options: [
                    "تنوع‌بخشی به سبد دارایی (ترکیب بورس، طلا، سپرده و بیمه)",
                    "نگه داشتن تمام پول نقد زیر بالش!",
                    "خرید فقط یک سهم پرریسک در بورس",
                    "خرج کردن تمام پول در یک روز"
                ],
                correct: 0,
                explanation: "فوق‌العاده! تنوع‌بخشی به دارایی‌ها باعث کاهش ریسک و حفظ قدرت خرید در طول زمان می‌شود."
            }
        ]
    }
};

// Functions
function updateScoreboard() {
    document.getElementById('total-score').innerText = playerScore;
    let totalS = Object.values(levelStars).reduce((a, b) => a + b, 0);
    document.getElementById('total-stars').innerText = `${totalS} / 12`;

    // Update Map Nodes
    for (let i = 1; i <= 4; i++) {
        let node = document.getElementById(`node-${i}`);
        if (i <= unlockedLevel) {
            node.classList.remove('locked');
            node.classList.add('unlocked');
        } else {
            node.classList.add('locked');
            node.classList.remove('unlocked');
        }

        let starsElem = document.getElementById(`stars-lvl-${i}`);
        let count = levelStars[i] || 0;
        starsElem.innerText = "★".repeat(count) + "☆".repeat(3 - count);
    }
}

function startLevel(lvlNum) {
    if (lvlNum > unlockedLevel) {
        playSFX('wrong');
        alert("🔒 این مرحله هنوز قفل است! ابتدا مراحل قبلی را با موفقیت تمام کنید.");
        return;
    }

    currentActiveLevel = lvlNum;
    currentQuestStepIndex = 0;
    selectedOptionIndex = null;

    document.getElementById('map-view').classList.remove('active');
    document.getElementById('quest-screen').classList.add('active');

    loadQuestStep();
}

function showMapView() {
    document.getElementById('quest-screen').classList.remove('active');
    document.getElementById('map-view').classList.add('active');
    updateScoreboard();
}

function loadQuestStep() {
    const data = levelData[currentActiveLevel];
    const quest = data.quests[currentQuestStepIndex];

    document.getElementById('quest-lvl-badge').innerText = `مرحله ${currentActiveLevel} - معما ${currentQuestStepIndex + 1}`;
    document.getElementById('quest-avatar').innerText = data.avatar;
    document.getElementById('quest-title').innerText = data.title;
    document.getElementById('quest-narrator').innerText = `مأموریت: پاسخ به معماهای کاربردی درس`;

    document.getElementById('char-name').innerText = data.charName;
    document.getElementById('char-dialogue').innerText = quest.dialogue;

    // Build Challenge Options
    let html = `<p style="margin-bottom:12px; font-weight:bold; color:#38bdf8;">❓ ${quest.question}</p>`;
    html += `<div class="options-grid">`;
    quest.options.forEach((opt, idx) => {
        let letter = ['الف', 'ب', 'ج', 'د'][idx];
        html += `
            <div class="option-card" id="opt-${idx}" onclick="selectOption(${idx})">
                <span class="opt-letter">${letter}</span>
                <span class="opt-text">${opt}</span>
            </div>
        `;
    });
    html += `</div>`;

    document.getElementById('challenge-area').innerHTML = html;
    document.getElementById('quest-feedback').classList.add('hidden');
    document.getElementById('next-quest-btn').innerText = "پاسخ و ثبت تصمیم 🚀";
    selectedOptionIndex = null;
}

function selectOption(idx) {
    selectedOptionIndex = idx;
    document.querySelectorAll('.option-card').forEach((card, i) => {
        card.classList.toggle('selected', i === idx);
    });
}

function nextQuestStep() {
    if (selectedOptionIndex === null) {
        alert("لطفاً ابتدا یکی از گزینه‌ها را انتخاب کنید!");
        return;
    }

    const data = levelData[currentActiveLevel];
    const quest = data.quests[currentQuestStepIndex];
    const feedbackBox = document.getElementById('quest-feedback');

    if (selectedOptionIndex === quest.correct) {
        playSFX('coin');
        playerScore += 250;
        feedbackBox.className = "feedback-box correct";
        feedbackBox.innerHTML = `✅ <strong>پاسخ درست!</strong> ${quest.explanation}`;
        feedbackBox.classList.remove('hidden');

        setTimeout(() => {
            currentQuestStepIndex++;
            if (currentQuestStepIndex < data.quests.length) {
                loadQuestStep();
            } else {
                // Completed Level
                playSFX('victory');
                levelStars[currentActiveLevel] = 3;
                if (unlockedLevel < currentActiveLevel + 1) {
                    unlockedLevel = currentActiveLevel + 1;
                }
                alert(`🎉 آفرین! مرحله ${currentActiveLevel} با ۳ ستاره کامل به پایان رسید!`);
                showMapView();

                if (unlockedLevel > 4) {
                    showCertificateIfReady();
                }
            }
        }, 1800);
    } else {
        playSFX('wrong');
        feedbackBox.className = "feedback-box wrong";
        feedbackBox.innerHTML = `❌ <strong>پاسخ نادرست!</strong> دوباره تلاش کنید و به راهنمایی توجه کنید.`;
        feedbackBox.classList.remove('hidden');
    }
}

function showCertificateIfReady() {
    document.getElementById('final-cert-score').innerText = `${playerScore} / 1000`;
    document.getElementById('victory-modal').classList.remove('hidden');
    playSFX('victory');
}

function closeVictoryModal() {
    document.getElementById('victory-modal').classList.add('hidden');
}

window.onload = function() {
    updateScoreboard();
};

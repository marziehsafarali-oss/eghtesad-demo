// Game State
let gameState = {
    gold: 1000000,
    morale: 85,
    infrastructure: "متوسط",
    completedBuildings: {
        factory: false,
        market: false,
        cityhall: false,
        finance: false
    },
    audioEnabled: true
};

// Web Audio API Synthesizer for SFX
function playSFX(type) {
    if (!gameState.audioEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'coin') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77, now); // B5
            osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15); // E6
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'upgrade') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now); // A4
            osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
            osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
            osc.frequency.setValueAtTime(880, now + 0.3); // A5
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'fanfare') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
            osc.frequency.setValueAtTime(1046.50, now + 0.45); // C6
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
            osc.start(now);
            osc.stop(now + 0.8);
        }
    } catch(e) {
        console.log('Audio Context error', e);
    }
}

function toggleAudio() {
    gameState.audioEnabled = !gameState.audioEnabled;
    const btn = document.getElementById('sfx-toggle');
    btn.innerText = gameState.audioEnabled ? "🔊 صدا: فعال" : "🔇 صدا: غیرفعال";
}

function updateUI() {
    document.getElementById('gold-val').innerText = gameState.gold.toLocaleString('fa-IR');
    document.getElementById('morale-val').innerText = gameState.morale + '%';
    document.getElementById('infra-val').innerText = gameState.infrastructure;

    // Check overall win condition
    const allDone = Object.values(gameState.completedBuildings).every(val => val === true);
    if (allDone) {
        setTimeout(() => {
            playSFX('fanfare');
            document.getElementById('victory-modal').classList.remove('hidden');
        }, 500);
    }
}

function openBuilding(type) {
    playSFX('coin');
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    modal.classList.remove('hidden');

    if (type === 'factory') {
        content.innerHTML = `
            <div class="modal-title">
                <span class="icon">🏭</span>
                <div>
                    <h2>مدیریت خط تولید کارخانه (درس ۴: مرز امکانات و تخصیص منابع)</h2>
                    <small>انتخاب تخصیص منابع کمیاب بین بستنی و آبمیوه</small>
                </div>
            </div>
            <div class="modal-body">
                <p>شما مدیریت کارخانه را بر عهده دارید. منابع و کارگران محدودند! برای بهینه‌سازی تولید چه تصمیمی می‌گیرید؟</p>
                <div class="option-group">
                    <button class="btn-option" onclick="chooseOption('factory', 'tech')">
                        <span class="opt-icon">🚀</span>
                        <div>
                            <span class="opt-title">سرمایه‌گذاری روی ماشین‌آلات دانش‌بنیان (انتقال مرز به سمت راست)</span>
                            <span class="opt-desc">ظرفیت تولید هر دو محصول ۲۰٪ افزایش می‌یابد و به نقطه کارایی برتر می‌رسید. (هزینه: ۲۰۰,۰۰۰ تومان)</span>
                        </div>
                    </button>
                    <button class="btn-option" onclick="chooseOption('factory', 'balanced')">
                        <span class="opt-icon">⚖️</span>
                        <div>
                            <span class="opt-title">تخصیص متوازن (تولید روی منحنی مرز امکانات - نقطه ج)</span>
                            <span class="opt-desc">تولید ۷۵۰ عدد بستنی و ۲۰۰ بطری آبمیوه بدون اتلاف منابع و بدون بیکاری کارگران.</span>
                        </div>
                    </button>
                </div>
            </div>
        `;
    } else if (type === 'market') {
        content.innerHTML = `
            <div class="modal-title">
                <span class="icon">🛒</span>
                <div>
                    <h2>مدیریت بازار و قیمت‌گذاری (درس ۵: عرضه، تقاضا و تعادل)</h2>
                    <small>تنظیم قیمت برای جلوگیری از کمبود کالا یا مازاد عرضه</small>
                </div>
            </div>
            <div class="modal-body">
                <p>خریداران و فروشندگان در بازار حضور دارند. قیمت مناسب بستنی چقدر تعیین شود؟</p>
                <div class="option-group">
                    <button class="btn-option" onclick="chooseOption('market', 'equilibrium')">
                        <span class="opt-icon">🟢</span>
                        <div>
                            <span class="opt-title">قیمت تعادلی (۲,۰۰۰ تومان)</span>
                            <span class="opt-desc">مقدار عرضه و تقاضا کاملاً برابر می‌شود، کالا روی دست فروشنده نمی‌ماند و خریداران خشنودند.</span>
                        </div>
                    </button>
                    <button class="btn-option" onclick="chooseOption('market', 'surplus')">
                        <span class="opt-icon">📦</span>
                        <div>
                            <span class="opt-title">قیمت گران (۳,۵۰۰ تومان)</span>
                            <span class="opt-desc">مازاد عرضه ایجاد می‌شود! جنس روی دست فروشنده می‌ماند و رضایت مشتریان کاهش می‌یابد.</span>
                        </div>
                    </button>
                </div>
            </div>
        `;
    } else if (type === 'cityhall') {
        content.innerHTML = `
            <div class="modal-title">
                <span class="icon">🏛️</span>
                <div>
                    <h2>شهرداری و دولت (درس ۶: زیرساخت‌ها، کالای عمومی و مالیات)</h2>
                    <small>تامین بودجه برای توسعه جاده‌ها و امنیت شهر</small>
                </div>
            </div>
            <div class="modal-body">
                <p>شهر برای حمل‌ونقل کالاهای کارخانه نیازمند جاده‌های نوساز و امنیت است. چگونه بودجه آن را تامین می‌کنید؟</p>
                <div class="option-group">
                    <button class="btn-option" onclick="chooseOption('cityhall', 'tax')">
                        <span class="opt-icon">🛣️</span>
                        <div>
                            <span class="opt-title">پرداخت مالیات عادلانه و احداث زیرساخت‌ها</span>
                            <span class="opt-desc">جاده‌های شهر نوساز شده، خطوط حمل‌ونقل روان می‌شود و امنیت شهر ارتقا می‌یابد.</span>
                        </div>
                    </button>
                </div>
            </div>
        `;
    } else if (type === 'finance') {
        content.innerHTML = `
            <div class="modal-title">
                <span class="icon">🪙</span>
                <div>
                    <h2>مرکز مالی و بورس (درس ۱۴: پس‌انداز و تشکیل سبد دارایی)</h2>
                    <small>حفظ قدرت خرید در برابر تورم با مدیریت هوشمندانه دارایی</small>
                </div>
            </div>
            <div class="modal-body">
                <p>پس‌انداز شهر چگونه مدیریت شود تا ارزش آن در برابر تورم حفظ شود؟</p>
                <div class="option-group">
                    <button class="btn-option" onclick="chooseOption('finance', 'portfolio')">
                        <span class="opt-icon">💎</span>
                        <div>
                            <span class="opt-title">تشکیل سبد دارایی متنوع (طلا، بورس، بانک و بیمه)</span>
                            <span class="opt-desc">ارزش سرمایه در برابر تورم حفظ شده و سود سالانه ۳۰۰,۰۰۰ تومانی به خزانه شهر اضافه می‌شود.</span>
                        </div>
                    </button>
                </div>
            </div>
        `;
    }
}

function chooseOption(building, action) {
    playSFX('upgrade');
    closeModal();

    if (building === 'factory') {
        gameState.completedBuildings.factory = true;
        if (action === 'tech') {
            gameState.gold += 300000;
            gameState.morale += 5;
            document.getElementById('factory-status').innerText = "دانش‌بنیان (فوق‌العاده)";
        } else {
            gameState.gold += 150000;
            document.getElementById('factory-status').innerText = "تولید بهینه (روی مرز)";
        }
    } else if (building === 'market') {
        gameState.completedBuildings.market = true;
        if (action === 'equilibrium') {
            gameState.gold += 250000;
            gameState.morale += 10;
            document.getElementById('market-status').innerText = "تعادل کامل (سبز)";
        } else {
            gameState.morale -= 5;
            document.getElementById('market-status').innerText = "مازاد عرضه (گران)";
        }
    } else if (building === 'cityhall') {
        gameState.completedBuildings.cityhall = true;
        gameState.infrastructure = "پیشرفته و نوساز 🛣️";
        gameState.morale += 10;
        document.getElementById('cityhall-status').innerText = "توسعه‌یافته";
    } else if (building === 'finance') {
        gameState.completedBuildings.finance = true;
        gameState.gold += 300000;
        gameState.morale += 5;
        document.getElementById('finance-status').innerText = "سودآور و مطمئن";
    }

    updateUI();
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

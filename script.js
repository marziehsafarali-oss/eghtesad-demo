// Audio Synthesizer & Web Audio API for Game Sound Effects & Voice
let voiceMuted = false;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (voiceMuted) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'click') {
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
            osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
        } else if (type === 'warn') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, audioCtx.currentTime);
            osc.frequency.setValueAtTime(180, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
        }
    } catch(e) {}
}

function speakSpeechBubble(text) {
    if (voiceMuted) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fa-IR';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    }
}

function toggleVoiceMute() {
    voiceMuted = !voiceMuted;
    document.getElementById('voice-icon').innerText = voiceMuted ? '🔇' : '🔊';
    if (voiceMuted) {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
        playSound('click');
        speakSpeechBubble(document.getElementById('speech-bubble').innerText);
    }
}

// Chapter Navigation
let currentChapter = 1;
function switchChapter(chNum) {
    playSound('click');
    currentChapter = chNum;
    document.querySelectorAll('.nav-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx + 1 === chNum);
    });
    document.querySelectorAll('.chapter-content').forEach((ch, idx) => {
        ch.classList.toggle('active', idx + 1 === chNum);
    });

    const charName = document.getElementById('char-name');
    const bubble = document.getElementById('speech-bubble');

    if (chNum === 1) {
        charName.innerText = 'آرش (مدیر کارآفرین جوان)';
        bubble.innerText = 'در این بخش باید خط تولید بستنی و آبمیوه رو روی منحنی مرز امکانات تولید (PPF) طوری تنظیم کنی که به حداکثر کارایی برسی!';
        updatePPF();
    } else if (chNum === 2) {
        charName.innerText = 'سارا (خریدار و ناظر بازار)';
        bubble.innerText = 'حالا وارد بازار شدیم! قیمت رو طوری تنظیم کن که عرضه و تقاضا برابر بشن و تعادل بازار شکل بگیره. حواست به مالیات دولت هم باشه!';
        updateMarket();
    } else if (chNum === 3) {
        charName.innerText = 'استاد بهنام (مشاور اقتصاد کلان)';
        bubble.innerText = 'در سطح کلان، باید با سرمایه‌گذاری دانش‌بنیان و محاسبه استهلاک، تولید واقعی (Real GDP) رو ارتقا بدی و اثر تورم رو مهار کنی!';
        updateMacro();
    } else if (chNum === 4) {
        charName.innerText = 'نوید (تحلیل‌گر مالی و بورس)';
        bubble.innerText = 'در فصل آخر، باید پس‌انداز شخصی خودت رو بین طلا، بورس و حساب بانکی تقسیم کنی تا قدرت خریدت در برابر تورم حفظ بشه!';
        updateAssets();
    }
    speakSpeechBubble(bubble.innerText);
}

// CHAPTER 1: PPF LOGIC
let techLevel = 1.0;
function upgradeTechnology() {
    playSound('success');
    techLevel += 0.2;
    const bubble = document.getElementById('speech-bubble');
    bubble.innerText = 'عالی شد! با ارتقای فناوری و ابزار دانش‌بنیان، منحنی مرز امکانات به سمت راست منتقل شد و ظرفیت تولید کشور افزایش یافت!';
    speakSpeechBubble(bubble.innerText);
    updatePPF();
}

function updatePPF() {
    const icecream = parseInt(document.getElementById('slider-icecream').value);
    const juice = parseInt(document.getElementById('slider-juice').value);
    document.getElementById('val-icecream').innerText = icecream;
    document.getElementById('val-juice').innerText = juice;

    const maxCapacity = 100 * techLevel;
    // Normalized distance from origin
    const currentDist = Math.sqrt(icecream * icecream + juice * juice);
    const idealDist = maxCapacity * 0.707; // 100 on curve

    const statusBox = document.getElementById('ppf-status-box');
    const statusText = document.getElementById('ppf-status-text');
    const detailText = document.getElementById('ppf-detail-text');

    if (currentDist > idealDist + 5) {
        statusText.innerText = 'غیرقابل دستیابی (خارج مرز)';
        statusText.style.color = '#ef4444';
        statusBox.style.borderColor = '#ef4444';
        detailText.innerText = 'منابع و امکانات موجود برای این سطح از تولید کافی نیست!';
    } else if (Math.abs(currentDist - idealDist) <= 5) {
        statusText.innerText = 'حداکثر کارایی (روی مرز)';
        statusText.style.color = '#10b981';
        statusBox.style.borderColor = '#10b981';
        detailText.innerText = 'تخصیص کاملاً بهینه است. هزینه فرصت تولید ۱ واحد بستنی بیشتر، کاهش تولید آبمیوه است.';
    } else {
        statusText.innerText = 'ناکارا (داخل مرز / اتلاف منابع)';
        statusText.style.color = '#f59e0b';
        statusBox.style.borderColor = '#f59e0b';
        detailText.innerText = 'بخشی از ماشین‌آلات یا نیروی کار بیکار مانده‌اند و منابع هدر می‌روند!';
    }

    drawPPFCanvas(icecream, juice, maxCapacity);
}

function drawPPFCanvas(ice, juice, cap) {
    const canvas = document.getElementById('ppfCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 20); ctx.lineTo(50, 270); ctx.lineTo(370, 270);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Vazirmatn';
    ctx.fillText('بستنی (واحد)', 15, 30);
    ctx.fillText('آبمیوه (واحد)', 310, 295);

    // Curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const radiusX = 280 * (cap / 100);
    const radiusY = 220 * (cap / 100);
    ctx.ellipse(50, 270, radiusX, radiusY, 0, Math.PI * 1.5, Math.PI * 2);
    ctx.stroke();

    // User Point
    const px = 50 + (juice / 100) * 220;
    const py = 270 - (ice / 100) * 180;

    ctx.fillStyle = '#f72585';
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// CHAPTER 2: MARKET LOGIC
function updateMarket() {
    const price = parseInt(document.getElementById('slider-price').value);
    const tax = parseInt(document.getElementById('slider-tax').value);
    document.getElementById('val-price').innerText = price.toLocaleString('fa-IR');
    document.getElementById('val-tax').innerText = tax;

    // Supply = (Price / 100) - 50, Demand = 1000 - (Price / 50)
    const demand = Math.max(0, Math.round(1000 - price / 40));
    const supply = Math.max(0, Math.round(price / 30 - 100));

    document.getElementById('m-demand').innerText = demand.toLocaleString('fa-IR');
    document.getElementById('m-supply').innerText = supply.toLocaleString('fa-IR');

    const statusText = document.getElementById('market-status-text');
    const detailText = document.getElementById('market-detail-text');

    if (supply > demand) {
        statusText.innerText = 'مازاد عرضه (کالای اضافه روی دست فروشنده)';
        statusText.style.color = '#f59e0b';
        detailText.innerText = 'قیمت بالا باعث کاهش خرید مردم شده. فروشندگان باید برای رقابت قیمت را پایین بیاورند.';
    } else if (demand > supply) {
        statusText.innerText = 'کمبود عرضه (صف و کمبود کالا در بازار)';
        statusText.style.color = '#ef4444';
        detailText.innerText = 'قیمت پایین است؛ تقاضای خریداران زیاد شده اما عرضه کافی نیست!';
    } else {
        statusText.innerText = 'تعادل کامل بازار (Equilibrium)';
        statusText.style.color = '#10b981';
        detailText.innerText = 'قیمت تعادلی به دست آمد! تمام کالاهای تولیدشده خریدار دارند.';
    }

    drawMarketCanvas(price, demand, supply);
}

function drawMarketCanvas(price, demand, supply) {
    const canvas = document.getElementById('marketCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 20); ctx.lineTo(50, 270); ctx.lineTo(370, 270);
    ctx.stroke();

    // Demand Line (Blue)
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(60, 40); ctx.lineTo(350, 260); ctx.stroke();

    // Supply Line (Red)
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(60, 260); ctx.lineTo(350, 40); ctx.stroke();

    // Current Price Line
    const py = 270 - ((price - 5000) / 45000) * 220;
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(50, py); ctx.lineTo(370, py); ctx.stroke();
    ctx.setLineDash([]);
}

// CHAPTER 3: MACRO LOGIC
function updateMacro() {
    const infl = parseInt(document.getElementById('slider-inflation').value);
    const techInvest = parseInt(document.getElementById('slider-tech-invest').value);
    const depr = parseInt(document.getElementById('slider-depr').value);

    document.getElementById('val-inflation').innerText = infl;
    document.getElementById('val-tech-invest').innerText = techInvest;
    document.getElementById('val-depr').innerText = depr;

    const nominalGDP = 1200 + techInvest * 5;
    const netGDP = nominalGDP - depr;
    const realGDP = Math.round(netGDP / (1 + infl / 100));

    document.getElementById('gdp-nominal').innerText = nominalGDP.toLocaleString('fa-IR');
    document.getElementById('gdp-net').innerText = netGDP.toLocaleString('fa-IR');
    document.getElementById('gdp-real').innerText = realGDP.toLocaleString('fa-IR');

    drawMacroCanvas(realGDP, infl);
}

function drawMacroCanvas(realGDP, infl) {
    const canvas = document.getElementById('macroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const deciles = [10, 15, 22, 30, 42, 55, 70, 90, 120, 180];
    const barWidth = 25;
    ctx.fillStyle = '#10b981';

    deciles.forEach((val, idx) => {
        const x = 50 + idx * 30;
        const h = (val / 200) * 200;
        ctx.fillRect(x, 260 - h, barWidth, h);
    });

    ctx.strokeStyle = '#64748b';
    ctx.beginPath(); ctx.moveTo(40, 260); ctx.lineTo(360, 260); ctx.stroke();
}

// CHAPTER 4: ASSETS
function updateAssets() {
    const gold = parseInt(document.getElementById('slider-gold').value);
    const stocks = parseInt(document.getElementById('slider-stocks').value);
    const bank = parseInt(document.getElementById('slider-bank').value);
    const insurance = parseInt(document.getElementById('slider-insurance').value);

    document.getElementById('val-gold').innerText = gold;
    document.getElementById('val-stocks').innerText = stocks;
    document.getElementById('val-bank').innerText = bank;
    document.getElementById('val-insurance').innerText = insurance;

    drawAssetCanvas(gold, stocks, bank, insurance);
}

function drawAssetCanvas(g, s, b, i) {
    const canvas = document.getElementById('assetCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = g + s + b + i || 1;
    let startAngle = 0;

    const colors = ['#fbbf24', '#3b82f6', '#10b981', '#a855f7'];
    const values = [g, s, b, i];

    values.forEach((val, idx) => {
        const sliceAngle = (val / total) * Math.PI * 2;
        ctx.fillStyle = colors[idx];
        ctx.beginPath();
        ctx.moveTo(200, 150);
        ctx.arc(200, 150, 100, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        startAngle += sliceAngle;
    });
}

// Modal & Certificate
function generateFinalReport() {
    playSound('success');
    document.getElementById('certModal').classList.add('active');
}

function closeModal() {
    document.getElementById('certModal').classList.remove('active');
}

// Initial Load
window.onload = function() {
    updatePPF();
    renderAdventure();
};


// Adventure progression and knowledge challenges (local to this browser)
const adventureKey = 'eghtesadAdventureV3';
const missionQuestions = {
  1: [{q:'وقتی منابع محدودند، انتخاب یک گزینه معمولاً چه پیامدی دارد؟',a:['هزینه فرصت','حذف همه محدودیت‌ها','افزایش خودکار منابع'],correct:0,why:'هزینه فرصت، ارزش بهترین گزینه‌ای است که از آن صرف‌نظر می‌کنیم.'},{q:'نقطه‌ای داخل مرز امکانات تولید معمولاً چه چیزی را نشان می‌دهد؟',a:['تولید غیرقابل دستیابی','استفاده ناکامل از منابع','حداکثر تولید ممکن'],correct:1,why:'نقطه داخل مرز می‌تواند نشان‌دهنده بیکاری یا استفاده ناکامل از منابع باشد.'}],
  2: [{q:'اگر قیمت از قیمت تعادلی پایین‌تر باشد، معمولاً چه رخ می‌دهد؟',a:['مازاد عرضه','کمبود کالا','عرضه و تقاضا همیشه برابر می‌مانند'],correct:1,why:'در الگوی معمول بازار، قیمت پایین‌تر از تعادل تقاضا را بیشتر از عرضه می‌کند.'},{q:'قیمت تعادلی در بازار کجا شکل می‌گیرد؟',a:['جایی که عرضه و تقاضا برابرند','جایی که عرضه صفر است','هر قیمتی که دولت تعیین کند'],correct:0,why:'در مدل ساده بازار، تعادل جایی است که مقدار عرضه و تقاضا برابر می‌شوند.'}],
  3: [{q:'تورم به چه معناست؟',a:['کاهش مداوم سطح عمومی قیمت‌ها','افزایش مداوم سطح عمومی قیمت‌ها','افزایش تولید یک کالای خاص'],correct:1,why:'تورم به افزایش مداوم سطح عمومی قیمت‌ها گفته می‌شود.'},{q:'استهلاک سرمایه به چه چیزی اشاره دارد؟',a:['فرسودگی یا کاهش ارزش سرمایه در طول زمان','افزایش خودکار پس‌انداز','کاهش تعداد مصرف‌کنندگان'],correct:0,why:'سرمایه‌های تولیدی در اثر استفاده و گذر زمان فرسوده یا کم‌ارزش می‌شوند.'}],
  4: [{q:'چرا تنوع‌بخشی به سبد دارایی می‌تواند مفید باشد؟',a:['ریسک را بین چند دارایی پخش می‌کند','سود قطعی را تضمین می‌کند','تورم را کاملاً حذف می‌کند'],correct:0,why:'تنوع‌بخشی می‌تواند تمرکز ریسک را کاهش دهد، اما سود قطعی را تضمین نمی‌کند.'},{q:'قدرت خرید پول بیشتر به چه چیزی وابسته است؟',a:['فقط رنگ اسکناس','مقدار کالا و خدماتی که می‌توان خرید','تعداد حساب‌های بانکی'],correct:1,why:'قدرت خرید نشان می‌دهد با مقدار مشخصی پول چه میزان کالا و خدمات می‌توان تهیه کرد.'}]
};
let adventure = loadAdventure();
let quizIndex = 0;
let quizAnswered = false;
function loadAdventure(){try{return JSON.parse(localStorage.getItem(adventureKey))||{xp:0,completed:[],active:1}}catch(e){return {xp:0,completed:[],active:1}}}
function saveAdventure(){try{localStorage.setItem(adventureKey,JSON.stringify(adventure))}catch(e){} renderAdventure()}
function renderAdventure(){const done=adventure.completed.length;const progress=document.getElementById('progress-fill');if(!progress)return;progress.style.width=(done/4*100)+'%';document.getElementById('progress-text').innerText=done.toLocaleString('fa-IR')+' از ۴ مأموریت';document.getElementById('xp-total').innerText=adventure.xp.toLocaleString('fa-IR');document.getElementById('player-level').innerText=(1+Math.floor(adventure.xp/100)).toLocaleString('fa-IR');document.getElementById('player-rank').innerText=adventure.xp>=300?'فرمانده اقتصاد':adventure.xp>=150?'تحلیل‌گر جوان':adventure.xp>=50?'کاوشگر بازار':'کارآموز اقتصاد';for(let n=1;n<=4;n++){const node=document.querySelector('.mission-node[onclick="startMission('+n+')"]');const status=document.getElementById('mission-status-'+n);if(node)node.classList.toggle('completed',adventure.completed.includes(n));if(status)status.innerText=adventure.completed.includes(n)?'✅ تکمیل شد':(adventure.active===n?'📍 مرحله فعلی':'مأموریت باز')}}
function startMission(n){adventure.active=n;switchChapter(n);saveAdventure();document.querySelector('.adventure-dashboard').scrollIntoView({behavior:'smooth',block:'start'})}
function openMissionQuiz(){quizIndex=0;quizAnswered=false;document.getElementById('quizModal').classList.add('active');renderQuiz()}
function renderQuiz(){const list=missionQuestions[adventure.active]||missionQuestions[1];const item=list[quizIndex];document.getElementById('quiz-title').innerText='مأموریت '+adventure.active.toLocaleString('fa-IR')+' • پرسش '+(quizIndex+1).toLocaleString('fa-IR');document.getElementById('quiz-question').innerText=item.q;document.getElementById('quiz-feedback').innerText='';document.getElementById('quiz-next').hidden=true;const box=document.getElementById('quiz-options');box.innerHTML='';item.a.forEach((answer,i)=>{const b=document.createElement('button');b.className='quiz-option';b.innerText=String.fromCharCode(1570+i)+'؛ '+answer;b.onclick=()=>answerQuiz(i,b);box.appendChild(b)})}
function answerQuiz(index,button){if(quizAnswered)return;quizAnswered=true;const item=missionQuestions[adventure.active][quizIndex];document.querySelectorAll('.quiz-option').forEach((b,i)=>{b.disabled=true;if(i===item.correct)b.classList.add('correct')});if(index===item.correct){adventure.xp+=25;document.getElementById('quiz-feedback').innerText='آفرین! ۲۵ امتیاز تجربه گرفتی. '+item.why;playSound('success')}else{button.classList.add('wrong');document.getElementById('quiz-feedback').innerText='این بار نشد؛ پاسخ درست مشخص شده است. '+item.why;playSound('warn')}document.getElementById('quiz-next').hidden=false;saveAdventure()}
function nextQuizQuestion(){const list=missionQuestions[adventure.active];if(quizIndex<list.length-1){quizIndex++;quizAnswered=false;renderQuiz();return}if(!adventure.completed.includes(adventure.active)){adventure.completed.push(adventure.active);adventure.xp+=25}saveAdventure();document.getElementById('quiz-title').innerText=adventure.completed.length===4?'🏆 شهر اقتصاد آباد شد!':'🌟 مأموریت به پایان رسید';document.getElementById('quiz-question').innerText=adventure.completed.length===4?'هر چهار منطقه را تکمیل کردی. می‌توانی گواهی‌نامه را از بخش مدیریت مالی دریافت کنی.':'خوب پیش رفتی! منطقه بعدی را از نقشه انتخاب کن.';document.getElementById('quiz-options').innerHTML='';document.getElementById('quiz-feedback').innerText='امتیاز تجربه: '+adventure.xp.toLocaleString('fa-IR')+' XP';document.getElementById('quiz-next').hidden=true;const close=document.createElement('button');close.className='btn-primary';close.innerText='بازگشت به نقشه';close.onclick=closeMissionQuiz;document.getElementById('quiz-options').appendChild(close)}
function closeMissionQuiz(){document.getElementById('quizModal').classList.remove('active')}
function resetAdventure(){if(!confirm('پیشرفت و امتیازهای این مرورگر پاک شود؟'))return;adventure={xp:0,completed:[],active:1};saveAdventure()}

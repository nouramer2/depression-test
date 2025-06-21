// المتغيرات العامة
let mediaRecorder;
let audioChunks = [];
let audioBlob = null;
let startTime;
let timerInterval;

// عناصر DOM
const elements = {
    consentSection: document.getElementById('consent-section'),
    demographicsSection: document.getElementById('demographics-section'),
    recordingSection: document.getElementById('recording-section'),
    phq9Section: document.getElementById('phq9-section'),
    thankYouSection: document.getElementById('thank-you-section'),
    questionText: document.getElementById('question-text'),
    recordBtn: document.getElementById('record-btn'),
    stopBtn: document.getElementById('stop-btn'),
    playBtn: document.getElementById('play-btn'),
    nextBtn: document.getElementById('next-btn'),
    audioPlayback: document.getElementById('audio-playback'),
    timer: document.getElementById('timer'),
    consentBtn: document.getElementById('consent-btn'),
    demographicsNext: document.getElementById('demographics-next'),
    phqQuestions: document.getElementById('phq-questions'),
    submitBtn: document.getElementById('submit-btn'),
    recordingStatus: document.getElementById('recording-status'),
    recordingSize: document.getElementById('recording-size')
};

// تهيئة أسئلة PHQ-9
function initPHQ9Questions() {
    elements.phqQuestions.innerHTML = '';
    const phq9Questions = [
        "كم مرة شعرت بانعدام المتعة في ممارسة أنشطتك المعتادة خلال الأسبوعين الماضيين؟",
        "كم مرة شعرت باليأس أو الاكتئاب خلال الأسبوعين الماضيين؟",
        "كم مرة واجهت صعوبة في النوم أو النوم أكثر من المعتاد؟",
        "كم مرة شعرت بالتعب أو قلة الطاقة خلال الأسبوعين الماضيين؟",
        "كم مرة شعرت بفقدان الشهية أو الإفراط في الأكل خلال الأسبوعين الماضيين؟",
        "كم مرة شعرت بأنك فاشل أو أنك خذلت نفسك أو عائلتك خلال الأسبوعين الماضيين؟",
        "كم مرة واجهت صعوبة في التركيز على الأشياء مثل القراءة أو مشاهدة التلفزيون خلال الأسبوعين الماضيين؟",
        "كم مرة تحركت أو تكلمت ببطء شديد لدرجة أن الآخرين لاحظوا ذلك؟ أو العكس - شعرت بعدم الراحة أو التململ لدرجة أنك تتحرك أكثر من المعتاد؟",
        "كم مرة خطرت لك أفكار بأنك سيكون من الأفضل أن تموت أو أن تؤذي نفسك بطريقة ما خلال الأسبوعين الماضيين؟"
    ];

    phq9Questions.forEach((question, index) => {
        const div = document.createElement('div');
        div.className = 'phq-question';
        
        const label = document.createElement('label');
        label.textContent = question;
        
        const select = document.createElement('select');
        select.className = 'phq-answer';
        select.name = `phq-${index}`;
        select.required = true;
        
        const options = [
            {value: 0, text: "أبداً (0 أيام)"},
            {value: 1, text: "عدة أيام (1-2 أيام)"},
            {value: 2, text: "أكثر من نصف الأيام (3-4 أيام)"},
            {value: 3, text: "كل يوم تقريباً (5-7 أيام)"}
        ];
        
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.text;
            select.appendChild(optElement);
        });
        
        div.appendChild(label);
        div.appendChild(select);
        elements.phqQuestions.appendChild(div);
    });
}

// التحكم في التسجيل الصوتي
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            window.audioBlob = audioBlob;
            const audioUrl = URL.createObjectURL(audioBlob);
            elements.audioPlayback.src = audioUrl;
            elements.audioPlayback.classList.remove('hidden');
            elements.playBtn.disabled = false;
            elements.nextBtn.disabled = false;
            elements.recordingStatus.classList.remove('hidden');
            elements.recordingSize.textContent = ` (حجم الملف: ${Math.round(audioBlob.size/1024)} كيلوبايت)`;
            
            // إيقاف جميع مسارات الميكروفون
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start(100); // جمع البيانات كل 100 مللي ثانية
        startTimer();
        elements.recordBtn.disabled = true;
        elements.stopBtn.disabled = false;
        audioChunks = [];
    } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('حدث خطأ في الوصول إلى الميكروفون. يرجى التحقق من الأذونات.');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        stopTimer();
        elements.recordBtn.disabled = false;
        elements.stopBtn.disabled = true;
    }
}

// التحكم في الوقت
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    elements.timer.textContent = `${minutes}:${seconds}`;
}

// التحكم في التدفق بين الأقسام
function showSection(sectionToShow) {
    document.querySelectorAll('.container > div').forEach(section => {
        section.classList.add('hidden');
    });
    sectionToShow.classList.remove('hidden');
}

// الأحداث
elements.consentBtn.addEventListener('click', () => showSection(elements.demographicsSection));

elements.demographicsNext.addEventListener('click', () => {
    if (!document.getElementById('age').value || !document.getElementById('gender').value) {
        alert('الرجاء إدخال جميع المعلومات الأساسية');
        return;
    }
    showSection(elements.recordingSection);
});

elements.recordBtn.addEventListener('click', startRecording);
elements.stopBtn.addEventListener('click', stopRecording);
elements.playBtn.addEventListener('click', () => elements.audioPlayback.play());

elements.nextBtn.addEventListener('click', () => {
    if (!audioBlob || audioBlob.size === 0) {
        alert('الرجاء تسجيل صوتك أولاً');
        return;
    }
    initPHQ9Questions();
    showSection(elements.phq9Section);
});

// جعل المتغيرات والدوال متاحة عالمياً
window.audioBlob = audioBlob;
window.showThankYou = () => showSection(elements.thankYouSection);
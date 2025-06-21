const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyAFtx7ulOAqI66kOl5F6bKd9GXvVTNqarbrSfuFiVValOLcLIciBwW3oY_4ZzmGViv/exec"
async function submitAllData() {
    const submitBtn = document.getElementById('submit-btn');
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الإرسال...';

        // التحقق من وجود التسجيل الصوتي
        if (!window.audioBlob || window.audioBlob.size === 0) {
            throw new Error('لم يتم العثور على تسجيل صوتي');
        }

        // جمع بيانات PHQ-9
        const phqAnswers = Array.from(document.querySelectorAll('.phq-answer')).map(select => parseInt(select.value));

        // تحويل الصوت إلى base64
        const audioBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = () => reject(new Error('فشل تحويل الصوت'));
            reader.readAsDataURL(window.audioBlob);
        });

        // إعداد بيانات الإرسال
        const formData = {
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value,
            phqAnswers: phqAnswers,
            totalScore: phqAnswers.reduce((sum, val) => sum + val, 0),
            audioBlob: audioBase64,
            timestamp: new Date().toISOString()
        };

        // إرسال البيانات
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('فشل إرسال البيانات');
        }

        const result = await response.json();
        if (result.status !== 'success') {
            throw new Error(result.message || 'خطأ في الخادم');
        }

        window.showThankYou();

    } catch (error) {
        console.error('Error:', error);
        alert(`حدث خطأ: ${error.message}\nالرجاء المحاولة مرة أخرى`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'إرسال الإجابات';
    }
}

// ربط حدث الإرسال
document.getElementById('submit-btn').addEventListener('click', submitAllData);

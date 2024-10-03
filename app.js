document.addEventListener('DOMContentLoaded', function () {
    const enterBtn = document.getElementById('enterBtn');
    const entryPage = document.getElementById('entryPage');
    const formPage = document.getElementById('formPage');
    const listPage = document.getElementById('listPage');
    const statusPage = document.getElementById('statusPage');
    const attendanceForm = document.getElementById('attendanceForm');
    const attendanceList = document.getElementById('attendanceList');
    const statusTable = document.getElementById('statusTable');
    const viewListBtn = document.getElementById('viewListBtn');
    const viewStatusBtn = document.getElementById('viewStatusBtn');
    const backToFormBtn = document.getElementById('backToFormBtn');

    let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];  // دریافت داده‌ها از localStorage

    // تابع برای ذخیره داده‌ها در localStorage
    function saveToLocalStorage() {
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    }

    // تابع تبدیل میلادی به شمسی
    function gregorianToJalali(gy, gm, gd) {
        const g_d_m = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let jy = (gy <= 1600) ? 0 : 979;
        gy -= (gy <= 1600) ? 621 : 1600;
        let gy2 = (gm > 2) ? (gy + 1) : gy;
        let days = (365 * gy) + parseInt((gy2 + 3) / 4) - parseInt((gy2 + 99) / 100) + parseInt((gy2 + 399) / 400) - 80 + gd;
        for (let i = 0; i < gm; ++i) days += g_d_m[i];
        jy += 33 * parseInt(days / 12053);
        days %= 12053;
        jy += 4 * parseInt(days / 1461);
        days %= 1461;
        if (days > 365) {
            jy += parseInt((days - 1) / 365);
            days = (days - 1) % 365;
        }
        const jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
        const jd = (days < 186) ? (1 + (days % 31)) : (1 + ((days - 186) % 30));
        return [jy, jm, jd];
    }

    // تابع برای دریافت تاریخ جاری شمسی
    function getCurrentJalaliDate() {
        const now = new Date();
        const gy = now.getFullYear();
        const gm = now.getMonth() + 1;
        const gd = now.getDate();
        const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);
        return `${jy}/${jm}/${jd}`;
    }

    // تغییر از صفحه ورود به فرم ثبت نام
    enterBtn.addEventListener('click', function() {
        entryPage.classList.remove('active');
        formPage.classList.add('active');
    });

    // ثبت نام و اضافه کردن به لیست
    attendanceForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const person = {
            name: fullName,
            status: null,  // وضعیت هنوز مشخص نشده است
            date: null     // تاریخ حضور یا غیاب
        };
        attendanceData.push(person);  // ذخیره نام در آرایه
        saveToLocalStorage();  // ذخیره در localStorage

        alert('نام با موفقیت ثبت شد!');
        attendanceForm.reset();  // پاک کردن فرم بعد از ثبت
    });

    // نمایش لیست ثبت‌شده‌ها
    viewListBtn.addEventListener('click', function() {
        formPage.classList.remove('active');
        listPage.classList.add('active');

        // پاک کردن لیست قدیمی
        attendanceList.innerHTML = '';

        // افزودن نام‌ها به لیست با دکمه‌های "حاضر" و "غایب"
        attendanceData.forEach(function(person, index) {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

            listItem.innerHTML = `
                ${person.name}
                <div>
                    <button class="btn btn-success btn-sm presentBtn" data-index="${index}">حاضر</button>
                    <button class="btn btn-danger btn-sm absentBtn" data-index="${index}">غایب</button>
                    <button class="btn btn-warning btn-sm deleteBtn" data-index="${index}">حذف</button>
                </div>
            `;

            attendanceList.appendChild(listItem);
        });

        // افزودن رویداد به دکمه‌های "حاضر"، "غایب" و "حذف"
        document.querySelectorAll('.presentBtn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                const currentDate = getCurrentJalaliDate(); // گرفتن تاریخ جاری شمسی
                attendanceData[index].status = 'حاضر';
                attendanceData[index].date = currentDate;
                saveToLocalStorage();  // ذخیره در localStorage
                alert(attendanceData[index].name + ' به عنوان "حاضر" در تاریخ ' + currentDate + ' ثبت شد');
            });
        });

        document.querySelectorAll('.absentBtn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                const currentDate = getCurrentJalaliDate(); // گرفتن تاریخ جاری شمسی
                attendanceData[index].status = 'غایب';
                attendanceData[index].date = currentDate;
                saveToLocalStorage();  // ذخیره در localStorage
                alert(attendanceData[index].name + ' به عنوان "غایب" در تاریخ ' + currentDate + ' ثبت شد');
            });
        });

        // افزودن رویداد به دکمه "حذف"
        document.querySelectorAll('.deleteBtn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                attendanceData.splice(index, 1);  // حذف آیتم از آرایه
                saveToLocalStorage();  // ذخیره در localStorage
                this.parentElement.parentElement.remove();  // حذف آیتم از لیست
            });
        });
    });

    // نمایش وضعیت افراد
    viewStatusBtn.addEventListener('click', function() {
        listPage.classList.remove('active');
        statusPage.classList.add('active');

        // پاک کردن جدول قدیمی
        statusTable.innerHTML = '';

        // افزودن نام‌ها، وضعیت‌ها و تاریخ‌ها به جدول
        attendanceData.forEach(function(person) {
            if (person.status) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${person.name}</td>
                    <td>${person.status}</td>
                    <td>${person.date}</td>
                `;
                statusTable.appendChild(row);
            }
        });
    });

    // بازگشت به فرم ثبت نام
    backToFormBtn.addEventListener('click', function() {
        statusPage.classList.remove('active');
        formPage.classList.add('active');
    });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('service-worker.js').then(function(registration) {
            console.log('ServiceWorker registered with scope:', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed:', err);
        });
    });
}
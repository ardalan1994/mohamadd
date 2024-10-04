document.addEventListener('DOMContentLoaded', function () {
    const enterBtn = document.getElementById('enterBtn');
    const entryPage = document.getElementById('entryPage');
    const formPage = document.getElementById('formPage');
    const listPage = document.getElementById('listPage');
    const statusPage = document.getElementById('statusPage');
    const gradesPage = document.getElementById('gradesPage');
    const attendanceForm = document.getElementById('attendanceForm');
    const attendanceList = document.getElementById('attendanceList');
    const statusTable = document.getElementById('statusTable');
    const gradesTable = document.getElementById('gradesTable');
    const viewListBtn = document.getElementById('viewListBtn');
    const viewStatusBtn = document.getElementById('viewStatusBtn');
    const addGradesBtn = document.getElementById('addGradesBtn');
    const backToFormBtn = document.getElementById('backToFormBtn');
    const backToListBtn = document.getElementById('backToListBtn');
    const submitGradesBtn = document.getElementById('submitGradesBtn');

    let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];  // دریافت داده‌ها از localStorage
    let gradesData = JSON.parse(localStorage.getItem('gradesData')) || []; // نمرات

    // تابع برای ذخیره داده‌ها در localStorage
    function saveToLocalStorage() {
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
        localStorage.setItem('gradesData', JSON.stringify(gradesData));
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
        const className = document.getElementById('class').value;
        const currentDateTime = new Date().toLocaleString('fa-IR'); // زمان ثبت

        const person = {
            name: fullName,
            class: className,
            status: null,  // وضعیت هنوز مشخص نشده است
            dateTime: currentDateTime // زمان حضور
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

        // افزودن نام‌ها به لیست
        attendanceData.forEach(function(person, index) {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

            listItem.innerHTML = `
                ${person.name} - ${person.class} - ثبت شده در ${person.dateTime}
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
                attendanceData[index].status = 'حاضر';
                saveToLocalStorage();  // ذخیره در localStorage
                alert(attendanceData[index].name + ' به عنوان "حاضر" ثبت شد');
            });
        });

        document.querySelectorAll('.absentBtn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                attendanceData[index].status = 'غایب';
                saveToLocalStorage();  // ذخیره در localStorage
                alert(attendanceData[index].name + ' به عنوان "غایب" ثبت شد');
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
                    <td>${person.class}</td>
                    <td>${person.status}</td>
                    <td>${person.dateTime}</td>
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

    // اضافه کردن نمرات
    addGradesBtn.addEventListener('click', function() {
        listPage.classList.remove('active');
        gradesPage.style.display = 'block'; // نمایش صفحه نمرات
        gradesTable.innerHTML = ''; // پاک کردن جدول نمرات

        // افزودن نمرات به جدول
        attendanceData.forEach(function(person) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${person.name}</td>
                <td>
                    <input type="number" class="form-control gradeInput" data-name="${person.name}">
                </td>
            `;
            gradesTable.appendChild(row);
        });
    });

    // ثبت نمرات
    submitGradesBtn.addEventListener('click', function() {
        gradesData = []; // آرایه نمرات جدید
        const gradeInputs = document.querySelectorAll('.gradeInput');

        gradeInputs.forEach(function(input) {
            const studentName = input.getAttribute('data-name');
            const gradeValue = input.value;

            if (gradeValue) {
                gradesData.push({
                    name: studentName,
                    grade: gradeValue
                });
            }
        });

        // ذخیره در localStorage
        localStorage.setItem('gradesData', JSON.stringify(gradesData));
        alert('نمرات با موفقیت ثبت شد!');
        displayGrades(); // نمایش نمرات در جدول
    });

    // نمایش نمرات
    function displayGrades() {
        gradesTable.innerHTML = ''; // پاک کردن جدول نمرات

        gradesData.forEach(function(grade) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${grade.name}</td>
                <td>${grade.grade}</td>
            `;
            gradesTable.appendChild(row);
        });
    }

    // بازگشت به لیست
    backToListBtn.addEventListener('click', function() {
        gradesPage.style.display = 'none'; // پنهان کردن صفحه نمرات
        listPage.classList.add('active'); // نمایش صفحه لیست
    });
});

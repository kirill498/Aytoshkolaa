// проверка формы записи на курсы (страница reagistration.html)

// сюда JS запишет правильный ответ капчи, когда сгенерирует числа
var correctAnswer = 0;

// генерируем два случайных числа для простой капчи "сколько будет X + Y"
function generateCaptcha() {
    var num1 = Math.floor(Math.random() * 9) + 1;
    var num2 = Math.floor(Math.random() * 9) + 1;

    document.getElementById("num1").innerHTML = num1;
    document.getElementById("num2").innerHTML = num2;

    correctAnswer = num1 + num2;

    // на всякий случай чистим старый ответ пользователя
    document.getElementById("captchaInput").value = "";
}

function checkForm() {
    // говорим браузеру не отправлять форму сразу
    event.preventDefault();

    var name = document.getElementById("userName").value;
    var phone = document.getElementById("userPhone").value;
    var captchaAnswer = document.getElementById("captchaInput").value;

    var nameError = document.getElementById("nameError");
    var phoneError = document.getElementById("phoneError");
    var captchaError = document.getElementById("captchaError");
    var successBlock = document.getElementById("successBlock");

    var isOk = true;

    // проверяем имя, должно быть хотя бы 2 буквы
    if (name.length < 2) {
        nameError.innerHTML = "Введите имя, пожалуйста";
        isOk = false;
    } else {
        nameError.innerHTML = "";
    }

    // убираем из телефона все символы кроме цифр и считаем сколько их
    var onlyNumbers = phone.replace(/[^0-9]/g, "");

    if (onlyNumbers.length < 10) {
        phoneError.innerHTML = "Проверьте номер телефона";
        isOk = false;
    } else {
        phoneError.innerHTML = "";
    }

    // проверяем капчу
    if (Number(captchaAnswer) !== correctAnswer) {
        captchaError.innerHTML = "Неправильный ответ, попробуйте ещё раз";
        isOk = false;
    } else {
        captchaError.innerHTML = "";
    }

    // если всё правильно, сохраняем заявку и показываем сообщение об успехе
    if (isOk == true) {

        // берём старый список заявок из localStorage (или пустой список, если его ещё нет)
        var zayavki = JSON.parse(localStorage.getItem("zayavki")) || [];

        var today = new Date();

        zayavki.push({
            name: name,
            phone: phone,
            date: today.toLocaleDateString()
        });

        // сохраняем обновлённый список обратно в localStorage
        localStorage.setItem("zayavki", JSON.stringify(zayavki));

        successBlock.style.display = "block";
        document.getElementById("regForm").reset();
    } else {
        successBlock.style.display = "none";
    }

    // после отправки (успешной или нет) генерируем новую капчу
    generateCaptcha();
}

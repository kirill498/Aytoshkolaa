// проверка формы записи на курсы и отправка заявки на сервер (страница /registration)

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

// async нужен, потому что мы ждём ответ от сервера
async function checkForm(event) {
    // говорим браузеру не отправлять форму сразу
    event.preventDefault();

    var name = document.getElementById("userName").value.trim();
    var phone = document.getElementById("userPhone").value.trim();
    var captchaAnswer = document.getElementById("captchaInput").value;

    var nameError = document.getElementById("nameError");
    var phoneError = document.getElementById("phoneError");
    var captchaError = document.getElementById("captchaError");
    var serverError = document.getElementById("serverError");
    var successBlock = document.getElementById("successBlock");

    var isOk = true;
    serverError.innerHTML = "";
    successBlock.style.display = "none";

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

    // если в форме есть ошибки, дальше не идём
    if (isOk == false) {
        generateCaptcha();
        return;
    }

    // всё правильно - отправляем заявку на сервер
    try {
        var response = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, phone: phone })
        });

        var result = await response.json();

        if (result.ok) {
            successBlock.style.display = "block";
            document.getElementById("regForm").reset();
        } else {
            serverError.innerHTML = result.error || "Не удалось отправить заявку";
        }
    } catch (error) {
        // сюда попадаем, если сервер не отвечает
        serverError.innerHTML = "Нет связи с сервером, попробуйте позже";
    }

    // после отправки генерируем новую капчу
    generateCaptcha();
}

// запускаем капчу, когда страница загрузилась
document.addEventListener("DOMContentLoaded", generateCaptcha);

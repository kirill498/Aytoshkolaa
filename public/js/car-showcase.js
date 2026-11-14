// Блок с автомобилем на главной: раскрытие карточки по тапу и всплывающее окно заявки

(function () {
    // --- находим нужные элементы страницы ---
    var card = document.getElementById("carCard");
    var openBtn = document.getElementById("openCarModal");
    var modal = document.getElementById("carModal");
    var closeBtn = document.getElementById("closeCarModal");
    var successClose = document.getElementById("successClose");

    var form = document.getElementById("carForm");
    var nameInput = document.getElementById("carName");
    var phoneInput = document.getElementById("carPhone");
    var emailInput = document.getElementById("carEmail");
    var submitBtn = document.getElementById("carSubmit");

    var robot = document.getElementById("robotCheck");
    var robotOk = false;     // прошёл ли человек проверку "Я не робот"
    var robotBusy = false;   // идёт ли проверка прямо сейчас

    var carName = openBtn.getAttribute("data-car");   // название машины из кнопки

    // ===== 1. Карточка машины на телефоне =====
    // На телефоне нет "наведения", поэтому раскрываем панель по нажатию.
    card.addEventListener("click", function () {
        var isTouch = window.matchMedia("(max-width: 600px), (hover: none)").matches;
        if (isTouch) {
            card.classList.toggle("is-open");
        }
    });

    // ===== 2. Открытие и закрытие окна =====
    function openModal() {
        resetModal();
        document.getElementById("modalCarName").textContent = carName;

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";   // страница под окном не прокручивается

        // ставим курсор в первое поле, когда окно доехало
        setTimeout(function () { nameInput.focus(); }, 350);
    }

    function closeModal() {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        openBtn.focus();
    }

    // возвращаем окно в чистое состояние (чтобы при повторном открытии не висели старые данные)
    function resetModal() {
        form.reset();
        form.style.display = "block";
        document.getElementById("carSuccess").style.display = "none";

        document.getElementById("carNameError").textContent = "";
        document.getElementById("carPhoneError").textContent = "";
        document.getElementById("carEmailError").textContent = "";
        document.getElementById("robotError").textContent = "";
        document.getElementById("carServerError").textContent = "";

        robot.classList.remove("loading", "checked");
        robot.setAttribute("aria-checked", "false");
        robotOk = false;
        robotBusy = false;
    }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    successClose.addEventListener("click", closeModal);

    // клик по тёмному фону вокруг окна закрывает его
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // клавиша Esc тоже закрывает
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("open")) {
            closeModal();
        }
    });

    // ===== 3. "Я не робот" =====
    function runRobotCheck() {
        if (robotOk || robotBusy) return;

        robotBusy = true;
        robot.classList.add("loading");          // показываем крутящееся колёсико

        // делаем вид, что "проверяем": 0,9 секунды, потом галочка
        setTimeout(function () {
            robot.classList.remove("loading");
            robot.classList.add("checked");
            robot.setAttribute("aria-checked", "true");
            robotOk = true;
            robotBusy = false;
            document.getElementById("robotError").textContent = "";
        }, 900);
    }

    robot.addEventListener("click", runRobotCheck);

    // чтобы работало и с клавиатуры (Пробел или Enter)
    robot.addEventListener("keydown", function (event) {
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            runRobotCheck();
        }
    });

    // ===== 4. Отправка заявки =====
    form.addEventListener("submit", async function (event) {
        event.preventDefault();   // не даём браузеру перезагрузить страницу

        var name = nameInput.value.trim();
        var phone = phoneInput.value.trim();
        var email = emailInput.value.trim();

        var nameError = document.getElementById("carNameError");
        var phoneError = document.getElementById("carPhoneError");
        var emailError = document.getElementById("carEmailError");
        var robotError = document.getElementById("robotError");
        var serverError = document.getElementById("carServerError");

        var isOk = true;
        serverError.textContent = "";

        if (name.length < 2) {
            nameError.textContent = "Введите имя, пожалуйста";
            isOk = false;
        } else {
            nameError.textContent = "";
        }

        // из телефона берём только цифры и считаем их
        var digits = phone.replace(/[^0-9]/g, "");
        if (digits.length < 10) {
            phoneError.textContent = "Проверьте номер телефона";
            isOk = false;
        } else {
            phoneError.textContent = "";
        }

        // простая проверка email: что-то@что-то.что-то
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailError.textContent = "Проверьте адрес почты";
            isOk = false;
        } else {
            emailError.textContent = "";
        }

        if (!robotOk) {
            robotError.textContent = "Подтвердите, что вы не робот";
            isOk = false;
        } else {
            robotError.textContent = "";
        }

        if (!isOk) return;

        // блокируем кнопку, чтобы заявку не отправили дважды
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправляем...";

        try {
            var response = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name, phone: phone, email: email, car: carName })
            });

            var result = await response.json();

            if (result.ok) {
                // прячем форму, показываем "Спасибо"
                document.getElementById("successName").textContent = name;
                form.style.display = "none";
                document.getElementById("carSuccess").style.display = "block";
            } else {
                serverError.textContent = result.error || "Не удалось отправить заявку";
            }
        } catch (error) {
            serverError.textContent = "Нет связи с сервером, попробуйте позже";
        }

        submitBtn.disabled = false;
        submitBtn.textContent = "Отправить заявку";
    });
})();

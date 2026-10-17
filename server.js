// Главный файл сайта. Запуск: npm start

const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;

// 1. Говорим Express, что страницы делаем через шаблоны EJS (папка views)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 1.1 Учим сервер читать данные, которые браузер присылает в формате JSON
app.use(express.json());

// 2. Всё из папки public (css, js, картинки) отдаём как есть
app.use(express.static(path.join(__dirname, "public")));

// 3. Адреса страниц.
// Когда браузер открывает адрес, сервер берёт шаблон из views и отправляет готовую страницу.
// title - заголовок вкладки, active - какой пункт меню подсветить,
// scripts - какие дополнительные js-файлы подключить на странице.

app.get("/", (req, res) => {
    res.render("index", { title: "АвтоСтарт - автошкола", active: "home", isHome: true });
});

app.get("/about", (req, res) => {
    res.render("about", { title: "О школе - АвтоСтарт", active: "about" });
});

app.get("/cars", (req, res) => {
    res.render("cars", { title: "Машины - АвтоСтарт", active: "cars" });
});

app.get("/instructors", (req, res) => {
    res.render("instructors", {
        title: "Инструкторы - АвтоСтарт",
        active: "instructors",
        scripts: ["/js/instructors.js"]
    });
});

app.get("/contacts", (req, res) => {
    res.render("contacts", { title: "Контакты - АвтоСтарт", active: "contacts" });
});

app.get("/registration", (req, res) => {
    res.render("registration", {
        title: "Записаться - АвтоСтарт",
        active: "registration",
        scripts: ["/js/registration.js"]
    });
});

app.get("/admin", (req, res) => {
    res.render("admin", {
        title: "Админ-панель - АвтоСтарт",
        active: "admin",
        scripts: ["/js/admin.js"]
    });
});

// 3.1 Приём заявки из формы записи.
// Браузер присылает имя и телефон, сервер проверяет их и записывает в базу.
app.post("/api/applications", async (req, res) => {
    const name = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const digits = phone.replace(/[^0-9]/g, ""); // только цифры из телефона

    // проверка на сервере (проверку в браузере легко обойти, поэтому проверяем ещё раз)
    if (name.length < 2 || name.length > 100) {
        return res.status(400).json({ ok: false, error: "Введите имя, пожалуйста" });
    }
    if (digits.length < 10 || digits.length > 15) {
        return res.status(400).json({ ok: false, error: "Проверьте номер телефона" });
    }

    try {
        // знаки вопроса - это "места для данных". MySQL подставляет name и phone сам
        // и защищает базу от вредных запросов (SQL-инъекций)
        await db.query("INSERT INTO applications (name, phone) VALUES (?, ?)", [name, phone]);
        res.json({ ok: true });
    } catch (err) {
        console.error("Ошибка при записи заявки:", err.message);
        res.status(500).json({ ok: false, error: "Ошибка сервера, попробуйте позже" });
    }
});

// 4. Если адрес не найден
app.use((req, res) => {
    res.status(404).send("Страница не найдена");
});

// 5. Запускаем сервер
app.listen(PORT, async () => {
    console.log("Сайт запущен: http://localhost:" + PORT);

    // сразу проверяем, что база доступна
    try {
        await db.query("SELECT 1");
        console.log("База данных подключена");
    } catch (err) {
        console.error("НЕ УДАЛОСЬ подключиться к базе:", err.message);
    }
});

// Главный файл сайта. Запуск: npm start

require("dotenv").config();

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;

// Секретная строка для подписи сессий. Без неё сайт не запустится.
if (!process.env.SESSION_SECRET) {
    console.error("В файле .env не задан SESSION_SECRET. Смотрите инструкцию.");
    process.exit(1);
}

// 1. Шаблоны EJS (папка views)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 1.1 Учим сервер читать данные из JSON (fetch) и из обычных HTML-форм
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 1.2 Сессии: сервер "помнит" вошедшего админа.
// Браузер получает cookie с номером сессии, а сами данные хранятся на сервере.
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,                 // JavaScript на странице не может прочитать cookie
        sameSite: "lax",                // защита от отправки форм с чужих сайтов
        maxAge: 2 * 60 * 60 * 1000      // сессия живёт 2 часа
    }
}));

// 2. Всё из папки public (css, js, картинки) отдаём как есть
app.use(express.static(path.join(__dirname, "public")));

// 3. Обычные страницы
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

// 3.1 Приём заявки из формы записи
app.post("/api/applications", async (req, res) => {
    const name = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const digits = phone.replace(/[^0-9]/g, "");

    if (name.length < 2 || name.length > 100) {
        return res.status(400).json({ ok: false, error: "Введите имя, пожалуйста" });
    }
    if (digits.length < 10 || digits.length > 15) {
        return res.status(400).json({ ok: false, error: "Проверьте номер телефона" });
    }

    try {
        await db.query("INSERT INTO applications (name, phone) VALUES (?, ?)", [name, phone]);
        res.json({ ok: true });
    } catch (err) {
        console.error("Ошибка при записи заявки:", err.message);
        res.status(500).json({ ok: false, error: "Ошибка сервера, попробуйте позже" });
    }
});

// ===== АДМИН-ПАНЕЛЬ =====

const ADMIN_TITLE = "Админ-панель - АвтоСтарт";

// Защита от подбора пароля: после 5 неудачных попыток с одного адреса
// вход блокируется на 10 минут. Хранится в памяти сервера.
const loginAttempts = {};
const BLOCK_TIME = 10 * 60 * 1000;

function tooManyAttempts(ip) {
    var a = loginAttempts[ip];
    if (!a) return false;
    if (Date.now() - a.first > BLOCK_TIME) {
        delete loginAttempts[ip];
        return false;
    }
    return a.count >= 5;
}

function registerFail(ip) {
    var a = loginAttempts[ip];
    if (!a || Date.now() - a.first > BLOCK_TIME) {
        loginAttempts[ip] = { count: 1, first: Date.now() };
    } else {
        a.count++;
    }
}

// "Охранник": пропускает дальше только тех, кто вошёл как админ
function requireAdmin(req, res, next) {
    if (!req.session.adminId) {
        return res.redirect("/admin");
    }
    next();
}

// Страница админки: если не вошли - форма входа, если вошли - таблица заявок
app.get("/admin", async (req, res) => {
    if (!req.session.adminId) {
        return res.render("admin", { title: ADMIN_TITLE, active: "admin", loggedIn: false, error: null, applications: [] });
    }

    try {
        const [rows] = await db.query(
            "SELECT id, name, phone, created_at FROM applications ORDER BY created_at DESC, id DESC"
        );
        res.render("admin", { title: ADMIN_TITLE, active: "admin", loggedIn: true, error: null, applications: rows });
    } catch (err) {
        console.error("Ошибка чтения заявок:", err.message);
        res.status(500).send("Ошибка сервера");
    }
});

// Вход
app.post("/admin/login", async (req, res) => {
    const ip = req.ip;
    const showError = function (code, text) {
        return res.status(code).render("admin", { title: ADMIN_TITLE, active: "admin", loggedIn: false, error: text, applications: [] });
    };

    if (tooManyAttempts(ip)) {
        return showError(429, "Слишком много попыток. Подождите 10 минут.");
    }

    const login = String(req.body.login || "").trim();
    const password = String(req.body.password || "");

    try {
        const [rows] = await db.query("SELECT id, password_hash FROM admins WHERE login = ?", [login]);

        // bcrypt.compare сам превращает введённый пароль в "кашу" и сравнивает с той, что в базе
        const ok = rows.length > 0 && await bcrypt.compare(password, rows[0].password_hash);

        if (!ok) {
            registerFail(ip);
            return showError(401, "Неверный логин или пароль");
        }

        delete loginAttempts[ip];

        // новая сессия после входа, затем запоминаем номер админа
        req.session.regenerate(function (err) {
            if (err) return res.status(500).send("Ошибка сервера");
            req.session.adminId = rows[0].id;
            req.session.save(function () {
                res.redirect("/admin");
            });
        });
    } catch (err) {
        console.error("Ошибка входа:", err.message);
        res.status(500).send("Ошибка сервера");
    }
});

// Выход
app.post("/admin/logout", (req, res) => {
    req.session.destroy(function () {
        res.redirect("/admin");
    });
});

// Удаление заявки (только для вошедшего админа)
app.post("/admin/applications/:id/delete", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).send("Неверный номер заявки");
    }

    try {
        await db.query("DELETE FROM applications WHERE id = ?", [id]);
        res.redirect("/admin");
    } catch (err) {
        console.error("Ошибка удаления заявки:", err.message);
        res.status(500).send("Ошибка сервера");
    }
});

// 4. Если адрес не найден
app.use((req, res) => {
    res.status(404).send("Страница не найдена");
});

// 5. Запускаем сервер
app.listen(PORT, async () => {
    console.log("Сайт запущен: http://localhost:" + PORT);

    try {
        await db.query("SELECT 1");
        console.log("База данных подключена");
    } catch (err) {
        console.error("НЕ УДАЛОСЬ подключиться к базе:", err.message);
    }
});

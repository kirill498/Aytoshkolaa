// Главный файл сайта. Запуск: npm start

const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// 1. Говорим Express, что страницы делаем через шаблоны EJS (папка views)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

// 4. Если адрес не найден
app.use((req, res) => {
    res.status(404).send("Страница не найдена");
});

// 5. Запускаем сервер
app.listen(PORT, () => {
    console.log("Сайт запущен: http://localhost:" + PORT);
});

// Страница "О школе": плашка "Сейчас открыто / закрыто"

(function () {
    var status = document.getElementById("openStatus");
    if (!status) return;

    var OPEN_HOUR = 9;     // во сколько открываемся
    var CLOSE_HOUR = 20;   // во сколько закрываемся

    // Берём текущий час по Москве, а не по часам посетителя:
    // школа в Москве, и у человека из другого города "сейчас открыто" должно считаться по-московски
    var hour = Number(new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Moscow",
        hour: "numeric",
        hourCycle: "h23"
    }).format(new Date()));

    if (hour >= OPEN_HOUR && hour < CLOSE_HOUR) {
        status.textContent = "Сейчас открыто · до " + CLOSE_HOUR + ":00";
        status.classList.add("is-open");
    } else {
        status.textContent = "Сейчас закрыто · откроемся в " + OPEN_HOUR + ":00";
        status.classList.add("is-closed");
    }
})();
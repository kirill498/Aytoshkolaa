// главный файл со скриптами, которые нужны почти на всех страницах

// открыть / закрыть меню на телефоне
function toggleMenu() {
    var menu = document.getElementById("menu");
    menu.classList.toggle("open");
}

// переключение вкладок в тарифах (Категория B / Сезонные предложения)
function showTab(tabName) {
    // сначала прячем все вкладки
    var allTabs = document.getElementsByClassName("tab-content");
    for (var i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove("active");
    }

    // убираем активную кнопку у всех кнопок
    var allButtons = document.getElementsByClassName("tab-btn");
    for (var j = 0; j < allButtons.length; j++) {
        allButtons[j].classList.remove("active");
    }

    // показываем нужную вкладку
    var tabToShow = document.getElementById(tabName);
    tabToShow.classList.add("active");

    // делаем активной кнопку, по которой кликнули
    event.target.classList.add("active");
}

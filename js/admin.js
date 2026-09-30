// скрипт для админ-панели (страница admin.html)

// логин и пароль для входа. простой вариант для учебного проекта
var ADMIN_LOGIN = "admin";
var ADMIN_PASSWORD = "1234";

function checkLogin() {
    event.preventDefault();

    var login = document.getElementById("adminLogin").value;
    var password = document.getElementById("adminPassword").value;
    var loginError = document.getElementById("loginError");

    if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
        loginError.innerHTML = "";
        document.getElementById("loginBlock").style.display = "none";
        document.getElementById("panelBlock").style.display = "block";
        showZayavki();
    } else {
        loginError.innerHTML = "Неверный логин или пароль";
    }
}

// выводим все заявки на экран в виде таблицы
function showZayavki() {
    var zayavki = JSON.parse(localStorage.getItem("zayavki")) || [];
    var place = document.getElementById("zayavkiPlace");

    if (zayavki.length === 0) {
        place.innerHTML = "<p>Заявок пока нет</p>";
        return;
    }

    var html = "<table class='admin-table'>";
    html += "<tr><th>№</th><th>Имя</th><th>Телефон</th><th>Дата</th><th></th></tr>";

    for (var i = 0; i < zayavki.length; i++) {
        html += "<tr>";
        html += "<td>" + (i + 1) + "</td>";
        html += "<td>" + zayavki[i].name + "</td>";
        html += "<td>" + zayavki[i].phone + "</td>";
        html += "<td>" + zayavki[i].date + "</td>";
        html += "<td><button class='btn btn-dark' onclick='deleteZayavka(" + i + ")'>Удалить</button></td>";
        html += "</tr>";
    }

    html += "</table>";
    place.innerHTML = html;
}

// удаляем одну заявку по её номеру в списке
function deleteZayavka(index) {
    var zayavki = JSON.parse(localStorage.getItem("zayavki")) || [];
    zayavki.splice(index, 1);
    localStorage.setItem("zayavki", JSON.stringify(zayavki));
    showZayavki();
}

// выход из админ-панели обратно на форму входа
function logoutAdmin() {
    document.getElementById("panelBlock").style.display = "none";
    document.getElementById("loginBlock").style.display = "block";
    document.getElementById("adminLogin").value = "";
    document.getElementById("adminPassword").value = "";
}

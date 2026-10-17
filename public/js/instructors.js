// скрипт для страницы инструкторов
// по кнопке "Подробнее" показываем или прячем текст про инструктора

function toggleInfo(infoId) {
    var block = document.getElementById(infoId);

    if (block.style.display === "block") {
        block.style.display = "none";
    } else {
        block.style.display = "block";
    }
}

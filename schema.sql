-- Создаём базу данных (если её ещё нет)
CREATE DATABASE IF NOT EXISTS autostart
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Говорим MySQL, что дальше работаем именно с этой базой
USE autostart;

-- Таблица заявок: каждая строка - одна заявка с сайта
CREATE TABLE IF NOT EXISTS applications (
    id         INT AUTO_INCREMENT PRIMARY KEY,           -- номер заявки, MySQL ставит сам
    name       VARCHAR(100) NOT NULL,                    -- имя
    phone      VARCHAR(30)  NOT NULL,                    -- телефон
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP  -- дата и время заявки
);

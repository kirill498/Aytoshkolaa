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

-- Таблица администраторов. Пароль хранится НЕ как есть, а в виде хеша
CREATE TABLE IF NOT EXISTS admins (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    login         VARCHAR(50)  NOT NULL UNIQUE,          -- UNIQUE: два одинаковых логина нельзя
    password_hash VARCHAR(255) NOT NULL                  -- "каша" из пароля
);

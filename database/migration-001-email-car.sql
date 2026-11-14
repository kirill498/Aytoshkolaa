-- Добавляем в уже существующую таблицу заявок две новые колонки.
-- Выполнить ОДИН раз. Если запустить повторно, MySQL скажет, что колонка уже есть.
USE autostart;

ALTER TABLE applications
    ADD COLUMN email VARCHAR(100) NULL AFTER phone,
    ADD COLUMN car   VARCHAR(100) NULL AFTER email;

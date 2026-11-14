// Скрипт для создания администратора. Запускается один раз вручную:
//   node create-admin.js ЛОГИН ПАРОЛЬ
// Пароль превращается в хеш и в базу попадает только хеш.

require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");

async function main() {
    const login = process.argv[2];
    const password = process.argv[3];

    if (!login || !password) {
        console.log("Использование: node create-admin.js ЛОГИН ПАРОЛЬ");
        process.exit(1);
    }
    if (password.length < 8) {
        console.log("Пароль слишком короткий, нужно минимум 8 символов");
        process.exit(1);
    }

    // делаем из пароля хеш ("каша"). Число 10 - сколько раз перемешивать, 10 - стандарт
    const hash = await bcrypt.hash(password, 10);

    // если такой логин уже есть, просто меняем ему пароль
    await db.query(
        "INSERT INTO admins (login, password_hash) VALUES (?, ?) " +
        "ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)",
        [login, hash]
    );

    console.log("Готово. Администратор '" + login + "' создан (или пароль обновлён).");
    await db.end();
}

main().catch(function (err) {
    console.error("Ошибка:", err.message);
    process.exit(1);
});

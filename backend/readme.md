## Інструкція з використання:

### Налаштування Sequelize CLI:
Встановіть sequelize-cli глобально: npm install -g sequelize-cli.
Створіть файл конфігурації config/config.json для підключення до MariaDB:
json

```
{
  "development": {
    "username": "username",
    "password": "password",
    "database": "sportswear_shop",
    "host": "localhost",
    "dialect": "mariadb"
  }
}
```

Створення структури проєкту:

Створіть папку migrations і розмістіть там файли міграцій з назвами, як у прикладі (2025042801-create-user.js тощо).

Створіть папку seeders для початкового заповнення даних (2025042804-seed-initial-data.js).

Виконання міграцій:
- Виконайте команду для створення таблиць: npx sequelize-cli db:migrate.
- Для заповнення початковими даними: npx sequelize-cli db:seed:all.

Відкат міграцій (якщо потрібно):
- Для видалення всіх таблиць: npx sequelize-cli db:migrate:undo:all.
- Для видалення початкових даних: npx sequelize-cli db:seed:undo:all.

Ця структура бази даних включає:

- Таблицю Users для зберігання даних користувачів (з ролями admin/user).
- Таблицю Categories для категорій товарів.
- Таблицю Products для товарів зі зв’язком до категорій.
- Початкові дані з адміністратором, двома категоріями та двома товарами.

Міграції забезпечують контрольоване створення та оновлення структури бази даних, а seed-файл додає початкові дані для тестування.
# Node.js Auth System
Простая система аутентификации и управления пользователями на Node.js с использованием JWT-токенов.

## Описание проекта
Этот проект представляет собой RESTful API для регистрации, аутентификации и управления пользователями. Система включает в себя:

Регистрацию и аутентификацию пользователей

JWT-токены для доступа и обновления

Управление пользователями (только для администраторов)

Систему логирования действий

Валидацию входных данных

Технологии
Node.js - среда выполнения

Express.js - веб-фреймворк

JWT - JSON Web Tokens для аутентификации

bcryptjs - хеширование паролей

Postman - тестирование API

Установка и запуск
Клонируйте репозиторий:

bash
git clone <ваш-репозиторий>
cd node-auth-system
Установите зависимости:

bash
npm install
Запустите сервер:

bash
npm run dev
Сервер будет запущен на порту 3000 (http://localhost:3000).

API Endpoints
Аутентификация
Регистрация пользователя
URL: POST /api/auth/register

Тело запроса:

json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123"
}
Ответ:

json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "testuser",
    "email": "test@example.com"
  }
}
Вход в систему
URL: POST /api/auth/login

Тело запроса:

json
{
  "email": "test@example.com",
  "password": "Password123"
}
Ответ: Аналогично ответу регистрации

Обновление токена
URL: POST /api/auth/refresh

Тело запроса:

json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Ответ:

json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Выход из системы
URL: POST /api/auth/logout

Тело запроса:

json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Получение данных текущего пользователя
URL: GET /api/auth/me

Заголовки: Authorization: Bearer <token>

Ответ:

json
{
  "user": {
    "id": 2,
    "username": "testuser",
    "email": "test@example.com"
  }
}
Управление пользователями (только для администраторов)
По умолчанию создается администратор с учетными данными:

Email: admin@example.com

Пароль: Admin123

Получение всех пользователей
URL: GET /api/users

Заголовки: Authorization: Bearer <admin_token>

Обновление пользователя
URL: PUT /api/users/:id

Заголовки: Authorization: Bearer <admin_token>

Тело запроса:

json
{
  "username": "updateduser",
  "email": "updated@example.com",
  "password": "NewPassword123",
  "isActive": true
}
Удаление пользователя
URL: DELETE /api/users/:id

Заголовки: Authorization: Bearer <admin_token>

Логи (только для администраторов)
Получение логов
URL: GET /api/admin/logs

Заголовки: Authorization: Bearer <admin_token>

Очистка логов
URL: DELETE /api/admin/logs

Заголовки: Authorization: Bearer <admin_token>

Валидация данных
Имя пользователя
Должно содержать от 3 до 20 символов

Может содержать только буквы и цифры

Email
Должен быть в правильном формате email

Пароль
Должен содержать минимум 6 символов

Должен содержать хотя бы одну цифру

Должен содержать хотя бы одну букву

Тестирование
Для тестирования API используется Postman. В папке TESTS находятся скриншоты с примерами запросов и ответов.

Последовательность тестирования
Зарегистрируйте нового пользователя через /api/auth/register

Войдите в систему через /api/auth/login

Используйте полученный токен для доступа к защищенным ресурсам

Для тестирования административных функций войдите как администратор

Проверьте работу всех эндпоинтов

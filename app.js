const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

const JWT_SECRET = 'your-secret-key'
let users = []
let refreshTokens = []
let logs = []

// Валидационные функции
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const isValidPassword = (password) => password.length >= 6 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password)
const isValidUsername = (username) => username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9]+$/.test(username)

// Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Токен отсутствует' })

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(403).json({ error: 'Недействительный токен' })
  }
}

const isAdmin = (req, res, next) => {
  if (req.user.id !== 1) return res.status(403).json({ error: 'Требуются права администратора' })
  next()
}

// Логирование
const logAction = (action, details = {}) => {
  const log = { timestamp: new Date().toISOString(), action, ...details }
  logs.push(log)
  console.log(log)
};

// Функция для создания администратора
async function createAdminUser() {
  try {
    const adminPassword = await bcrypt.hash("Admin123", 10)
    users.push({
      id: 1,
      username: "admin",
      email: "admin@example.com",
      password: adminPassword,
      isActive: true
    });
    console.log("Admin user created: admin@example.com / Admin123")
  } catch (error) {
    console.error("Error creating admin user:", error)
  }
}

// Маршруты аутентификации
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body

  if (!isValidUsername(username) || !isValidEmail(email) || !isValidPassword(password)) {
    return res.status(400).json({ error: 'Неверные данные' })
  }

  if (users.find(u => u.email === email || u.username === username)) {
    return res.status(400).json({ error: 'Пользователь уже существует' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = {
    id: users.length + 1,
    username,
    email,
    password: hashedPassword,
    isActive: true
  }

  users.push(user)
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' })
  refreshTokens.push(refreshToken)

  logAction('REGISTER', { userId: user.id })
  res.status(201).json({ token, refreshToken, user: { id: user.id, username, email } })
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  const user = users.find(u => u.email === email && u.isActive)

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Неверные учетные данные' })
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' })
  refreshTokens.push(refreshToken)

  logAction('LOGIN', { userId: user.id })
  res.json({ token, refreshToken, user: { id: user.id, username: user.username, email: user.email } })
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: 'Недействительный токен' })
  }

  try {
    const userData = jwt.verify(refreshToken, JWT_SECRET)
    const user = users.find(u => u.id === userData.id)
    const newToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' })
    res.json({ token: newToken })
  } catch {
    res.status(403).json({ error: 'Недействительный токен' })
  }
});

app.post('/api/auth/logout', (req, res) => {
  const { refreshToken } = req.body
  if (refreshToken) {
    refreshTokens = refreshTokens.filter(token => token !== refreshToken)
  }
  res.json({ message: 'Выход выполнен' })
});

// Маршруты пользователя
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' })
  }
  res.json({ user: { id: user.id, username: user.username, email: user.email } })
})

// Админские маршруты
app.get('/api/users', authenticateToken, isAdmin, (req, res) => {
  res.json(users.map(({ password, ...user }) => user))
})

app.put('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id))
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' })

  Object.assign(user, req.body)
  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10)
  }

  logAction('USER_UPDATE', { userId: user.id })
  res.json(user);
});

app.delete('/api/users/:id', authenticateToken, isAdmin, (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id))
  if (userIndex === -1) return res.status(404).json({ error: 'Пользователь не найден' })

  users.splice(userIndex, 1)
  logAction('USER_DELETE', { userId: parseInt(req.params.id) })
  res.json({ message: 'Пользователь удален' })
})

// Логи
app.get('/api/admin/logs', authenticateToken, isAdmin, (req, res) => {
  res.json(logs.slice(-100))
})

app.delete('/api/admin/logs', authenticateToken, isAdmin, (req, res) => {
  logs = []
  res.json({ message: 'Логи очищены' })
})

// Создаем администратора при запуске сервера
createAdminUser().then(() => {
  app.listen(3000, () => console.log('Сервер запущен на порту 3000'))
})
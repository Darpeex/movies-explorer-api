// const path = require('path'); // модуль - используем для разрешения доступа к папкам
const helmet = require('helmet'); // модуль для обеспечения безопасности приложения Express
const express = require('express'); // фреймворк для создания веб-приложений на Node.js
const mongoose = require('mongoose'); // модуль для работы с базой данных MongoDB
const { errors } = require('celebrate'); // мидлвэр для ошибок валидации полей
const dotenv = require('dotenv'); // модуль для получения данных из .env
const cookieParser = require('cookie-parser'); // модуль чтения cookie
const cors = require('cors'); // модуль для защиты запросов к api

const NotFoundError = require('./errors/not-found-err'); // экземпляр класса с ошибкой 404
const { requestLogger, errorLogger } = require('./middlewares/logger'); // логгер
const errorHandler = require('./middlewares/error-handler'); // мидлвар для централизованной обработки ошибок

// контроллеры для создания пользователя, аутентификации, авторизации и выхода
const { createUser, login } = require('./controllers/users');
const { logout } = require('./middlewares/logout');
const auth = require('./middlewares/auth');

// маршруты для пользователей и карточек:
const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');

// валидаторы для роутов
const { signupValidator } = require('./validators/signup-validator');
const { signinValidator } = require('./validators/signin-validator');

dotenv.config(); // для получения данных из .env. Можно короче "require('dotenv').config();"
const { PORT = 3000, BD_URL = 'mongodb://localhost:27017/bitfilmsdb' } = process.env; // порт и ссылка на БД

const app = express(); // cоздаём объект приложения

const whitelist = [ // список разрешенных доменов
  'https://diploma.darpeex.nomoredomainsrocks.ru',
  'https://diploma.darpeex.nomoredomainsrocks.ru',
  'https://localhost:3001',
  'http://localhost:3001',
  'https://praktikum.tk',
  'http://praktikum.tk',
];

const corsOptions = {
  origin: whitelist, // источник домена (откуда запрос)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // методы
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization', // заголовки
  credentials: true, // обмен учетными данными (cookies)
};

app.use(cors(corsOptions)); // доступ для других доменов
app.use(cookieParser()); // парсер для чтения cookie
app.use(helmet()); // использование модуля безопасности
app.use(express.json()); // для сборки JSON-формата
app.use(express.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

mongoose.connect(BD_URL, { // подключение к mongodb
  useNewUrlParser: true, // обеспечивает совместимость с будущими версиями MongoDB
}).then(() => console.log('Подключились к БД'));

// логгер запросов
app.use(requestLogger);

// роуты, не требующие авторизации
app.post('/signup', signupValidator, createUser); // регистрируемся
app.post('/signin', signinValidator, login); // заходим под пользователя

// авторизация
app.use(auth);

// роуты, которым авторизация нужна
app.use(userRouter);
app.use(movieRouter);
app.post('/signout', logout); // выходим из под пользователя

app.use((req, res, next) => { // предупреждаем переход по отсутсвующему пути
  next(new NotFoundError('Путь не найден'));
});

// логгер ошибок
app.use(errorLogger);

// обработчик ошибок celebrate от валидации joi
app.use(errors());

// централизованный обработчик
app.use(errorHandler);

// app.use(express.static(path.join(__dirname, 'public'))); // делаем папку общедоступной
app.listen(PORT, () => {
  console.log(`Порт приложения: ${PORT}`);
});

const bcrypt = require('bcrypt'); // импортируем bcrypt
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken (jwt)
const User = require('../models/user'); // импортируем модель пользователя

// классы с ответами об ошибках
const RequestError = require('../errors/req-err'); // 400
const AuthorizationError = require('../errors/auth-err'); // 401
const NotFoundError = require('../errors/not-found-err'); // 404
const EmailExistenceError = require('../errors/email-err'); // 409

// создаёт пользователя
module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body; // обязательные поля
  const emailLowerCase = email.toLowerCase(); // приводим email к нижнему регистру

  bcrypt.hash(password, 10, (error, hash) => { // хешируем пароль
    if (error) {
      return next(error); // Обработка ошибки хеширования пароля
    }

    User.create({ name, email: emailLowerCase, password: hash }) // создаём в БД
      .then(() => {
        res
          .status(201)
          .send({ name, email: emailLowerCase }); // отправляем ответ
      })
      .catch((err) => {
        if (err.code === 11000) {
          return next(new EmailExistenceError('Пользователь с данным email уже существует'));
        }
        return next(err); // переходим в центролизованный обработчик
      });
  });
};

// получение информации о пользователе
module.exports.getUserInfo = (req, res, next) => {
  const id = req.user._id;

  return User.findById(id)
    .then((user) => {
      if (user === null) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') { // если тип ошибки совпадает с 'CastError'
        return next(new RequestError('Некорректный Id пользователя'));
      }
      return next(err); // переходим в центролизованный обработчик
    });
};

// обновляет профиль
module.exports.updateUserInfo = (req, res, next) => {
  const id = req.user._id; // извлекаем id пользователя из объекта req.user
  // runValidators проверяет поля перед сохранением в БД, new - возвращает обновленный документ
  const options = { runValidators: true, new: true }; // включена валидация и сразу обновление
  // req.body содержит обновленные данные профиля пользователя
  const updatedInfo = { name: req.body.name };

  return User.findByIdAndUpdate(id, updatedInfo, options) // передаём id и новые данные
    .then((user) => { // если обновление профиля выполнено успешно, выполнится след. блок
      if (user === null) { // если возвращенное значение user пустое, ошибка
        throw new NotFoundError('Пользователь не найден');
      } // иначе отправим клиенту новые данные
      return res.status(200).send(user);
    }).catch((err) => { // если введённые данные некорректны, возвращается ошибка с кодом '400'
      if (err.name === 'ValidationError') {
        next(new RequestError('Переданы некорректные данные пользователя'));
      } else { // иначе, по-умолчанию, ошибка с кодом '500'
        return next(err); // переходим в центролизованный обработчик приложения
      }
    });
};

// проверка данных пользователя
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const { NODE_ENV, JWT_SECRET } = process.env;
      const token = jwt.sign( // создадим токен
        { _id: user._id }, // в строке ниже используем JWT_SECRET, если находимся в среде production
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', // а значение 'dev-secret', если находимся в другой среде (например, development)
        { expiresIn: '7d' }, // JWT создаётся сроком на неделю
      );
      res
        .cookie('jwt', token, { // сохраняем токен в куки с названием 'jwt'
          maxAge: 3600000 * 24 * 7, // время жизни - неделя
          httpOnly: true, // запрещает доступ к кукам из JavaScript
        })
        .send({ message: 'Успешная аутентификация' }) // отправляем ответ об успешной аутентификации
        .end(); // если у ответа нет тела, можно использовать метод end
    })
    .catch(() => { // ошибка аутентификации (присланный токен некорректен)
      throw new AuthorizationError('Ошибка аутентификации');
    })
    .catch(next); // переходим в центролизованный обработчик
};

const { celebrate, Joi } = require('celebrate'); // библиотека для валидации данных
const router = require('express').Router(); // создание нового экземпляра маршрутизатора вместо app
const { getUserInfo, updateUserInfo } = require('../controllers/users'); // контроллеры

router.get('/users/me', getUserInfo); // возвращает информацию о пользователе (email и имя)

router.patch( // обновляет информацию о пользователе (email и имя)
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().email(),
    }).options({ abortEarly: false }), // проверяет все поля, даже если есть ошибка в одном из них
  }),
  updateUserInfo,
);

module.exports = router;

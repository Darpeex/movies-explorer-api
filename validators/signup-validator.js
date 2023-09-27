const { celebrate, Joi } = require('celebrate'); // библиотека для валидации данных

const signupValidator = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().min(2).max(30).required()
      .email(), // проверка на соответствие email
    password: Joi.string().required(),
  }),
});

module.exports = { signupValidator };

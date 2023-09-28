const { celebrate, Joi } = require('celebrate'); // библиотека для валидации данных

const signoutValidator = celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(),
});

module.exports = { signoutValidator };

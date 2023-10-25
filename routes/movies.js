const { celebrate, Joi } = require('celebrate'); // библиотека для валидации данных
const router = require('express').Router(); // создание нового экземпляра маршрутизатора вместо app
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies'); // контроллеры

const RegExp = /^(http|https):\/\/(www\.)?[a-zA-Z0-9\--._~:/?#[\]@!$&'()*+,;=]+#?$/;

router.get('/movies', getMovies); // возвращает все сохранённые пользователем фильмы
router.post('/movies', celebrate({ // создаёт фильм
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().pattern(RegExp).required(),
    trailerLink: Joi.string().pattern(RegExp).required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().pattern(RegExp).required(),
    movieId: Joi.number().integer().required(),
  }),
}), createMovie);
router.delete('/movies/:movieId', celebrate({ // удаляет фильм по идентификатору
  params: Joi.object().keys({ // проверяет req.params на соответсвие
    movieId: Joi.string().length(24).hex().required(), // hex() - от 0 до 9 и букв от A до F
  }),
}), deleteMovie);

module.exports = router;

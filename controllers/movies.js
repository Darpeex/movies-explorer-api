const Movie = require('../models/movie'); // импортируем модель

// классы с ответами об ошибках
const RequestError = require('../errors/req-err'); // 400
const OwnerMovieError = require('../errors/owner-err'); // 403
const NotFoundError = require('../errors/not-found-err'); // 404

// возвращает все фильмы
module.exports.getMovies = (req, res, next) => {
  Movie.find({}) // status(200) добавляется по дефолту
    .then((movies) => res.send(movies.reverse())) // успешно - возвращаем фильмы
    .catch(next); // переходим в центролизованный обработчик
};

// создаёт фильм
module.exports.createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailer, nameRU, nameEN, thumbnail, movieId,
  } = req.body; // данные из тела запроса
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => { // если введённые данные некорректны, передаём сообщение об ошибке и код '400'
      if (err.name === 'ValidationError') {
        return next(new RequestError('Переданы некорректные данные фильма'));
      }
      return next(err); // иначе, передаём ошибку в централизованный обработчик
    });
};

// удаляет фильм по идентификатору
module.exports.deleteMovie = (req, res, next) => {
  // req.params содержит параметры маршрута, которые передаются в URL
  const { movieId } = req.params; // извлекаем значение movieId из объекта req.params
  return Movie.findById({ _id: movieId })
    .orFail(new Error('movieNotFound'))
    .then((movie) => {
      const userId = req.user._id; // строчный тип - далее сравниваем
      const movieUserId = movie.owner.toString(); // привели к строчному типу

      if (userId !== movieUserId) {
        throw new OwnerMovieError('Вы можете удалить только свой фильм');
      }
      return Movie.deleteOne(movie)
        .then(() => res.status(200).send({ message: 'Фильм успешно удален' }));
    })
    .catch((err) => {
      if (err.message === 'movieNotFound') {
        return next(new NotFoundError('Фильм не найден'));
      }
      if (err.name === 'CastError') {
        return next(new RequestError('Некорректный Id фильма'));
      }
      return next(err); // передаём ошибку в централизованный обработчик
    });
};

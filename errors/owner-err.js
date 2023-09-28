// экземпляр класса - ошибка фильм не ваш
class OwnerCardError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}

module.exports = OwnerCardError;

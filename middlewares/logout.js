// удаление JWT из куков пользователя при выходе
module.exports.logout = (req, res, next) => {
  try {
    res
      .clearCookie('jwt', { path: '/' })
      .send({ message: 'Выполнен выход из системы' });
  } catch (err) {
    next(err);
  }
};

/*
* для упрощения не добавлял NODE_ENV
* вообще всегда использую dotenv и проверку наличия необходимых переменных в process.env перед запуском
* */
module.exports = {
  redis: {
    port: 6379,
    host: 'localhost'
  }
}

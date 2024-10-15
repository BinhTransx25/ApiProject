// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Cấu hình Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Express API with Swagger',
    },
    servers: [
      {
        url: 'https://apiproject-1dk4.onrender.com/', // Thay đổi URL nếu cần
      },
    ],
  },
  apis: ['./routes/*.js'], // Đường dẫn tới các tệp API
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Xuất swaggerUi và swaggerDocs để sử dụng trong app.js
module.exports = {
  swaggerUi,
  swaggerDocs,
};

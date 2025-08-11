const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const swaggerDefinition = {
  openapi: '3.0.0', 
  info: {
    title: 'IMS API Documentation', 
    version: '1.0.0',
    description: 'This is the API documentation for IMS business project',
  },
  servers: [
    {
      url: process.env.BACKEND_SERVER || 'http://localhost:5000', 
      description: 'Development server',
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], 
};


const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
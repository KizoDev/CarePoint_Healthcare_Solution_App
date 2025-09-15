import  swaggerJsdoc  from "swagger-jsdoc";
import   swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Service API",
      version: "1.0.0",
      description: "API That Tracks Staff Task and Service Rendered",
    },
    servers: [
      {
         url: process.env.CLIENT_URL || "http://localhost:5000", // Replace with your server URL
        //url: "http://localhost:5000", 
      
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API docs
};

const PORT = process.env.PORT || 5000;
const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, client_url) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger docs available at ${client_url}/api-docs`);
}

export default swaggerDocs;

// const swaggerDefinition = {
//   openapi: '3.0.0', 
//   info: {
//     title: 'IMS API Documentation', 
//     version: '1.0.0',
//     description: 'This is the API documentation for IMS business project',
//   },
//   servers: [
//     {
//       url: process.env.BACKEND_SERVER || 'http://localhost:5000', 
//       description: 'Development server',
//     },
//   ],
// };

// // Options for the swagger docs
// const options = {
//   swaggerDefinition,
//   apis: ['./routes/*.js'], 
// };


// const swaggerSpec = swaggerJsdoc(options);

// module.exports = {
//   swaggerUi,
//   swaggerSpec,
// };
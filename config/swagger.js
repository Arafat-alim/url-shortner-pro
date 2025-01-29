const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "URL Shortener API",
    version: "1.0.0",
    description: "Production-grade API documentation for URL Shortener Service",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 5000}`,
      description: "Development Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      googleOAuth: {
        type: "oauth2",
        flows: {
          authorizationCode: {
            authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
            tokenUrl: "https://oauth2.googleapis.com/token",
            scopes: {
              profile: "Access profile information",
              email: "Access email address",
            },
          },
        },
      },
    },
    schemas: {
      ShortUrl: {
        type: "object",
        properties: {
          longUrl: { type: "string", example: "https://example.com" },
          shortUrl: { type: "string", example: "abc123" },
          customAlias: { type: "string", example: "mycustomalias" },
          topic: { type: "string", example: "tech" },
          clicks: { type: "integer", example: 0 },
          visitedHistory: {
            type: "array",
            items: {
              type: "object",
              properties: {
                ipAddress: { type: "string", example: "192.168.1.1" },
                country: { type: "string", example: "US" },
                timestamps: { type: "string", example: "2023-01-01T12:00:00Z" },
              },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerUiOptions = {
  swaggerOptions: {
    oauth2RedirectUrl: `http://localhost:${process.env.PORT}/api-docs/oauth2-redirect.html`,
    oauth: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      scopes: ["profile", "email"],
    },
  },
};

module.exports = { swaggerUi, swaggerSpec, swaggerUiOptions };

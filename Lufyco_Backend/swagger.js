const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lufyco API Documentation',
      version: '1.0.0',
      description: 'API documentation for Lufyco backend',
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Local server',
      },
    ],
    components: {
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              example: 'Nihinsa Bandara',
            },
            phone: {
              type: 'string',
              example: '0771234567',
            },
            email: {
              type: 'string',
              example: 'nihinsa@gmail.com',
            },
            password: {
              type: 'string',
              example: '123456',
            },
          },
        },

        VerifyEmailRequest: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: {
              type: 'string',
              example: 'nihinsa@gmail.com',
            },
            otp: {
              type: 'string',
              example: '123456',
            },
          },
        },

        ResendOtpRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              example: 'nihinsa@gmail.com',
            },
          },
        },

        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              example: 'nihinsa@gmail.com',
            },
            password: {
              type: 'string',
              example: '123456',
            },
          },
        },

        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              example: 'nihinsa@gmail.com',
            },
          },
        },

        VerifyResetOtpRequest: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: {
              type: 'string',
              example: 'nihinsa@gmail.com',
            },
            otp: {
              type: 'string',
              example: '123456',
            },
          },
        },

        ResetPasswordRequest: {
          type: 'object',
          required: ['email', 'otp', 'newPassword'],
          properties: {
            email: {
              type: 'string',
              example: 'nihinsa@gmail.com',
            },
            otp: {
              type: 'string',
              example: '123456',
            },
            newPassword: {
              type: 'string',
              example: 'newpassword123',
            },
          },
        },

        RegisterSuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Registration successful! A verification code has been sent to your email.',
            },
            requiresVerification: {
              type: 'boolean',
              example: true,
            },
            email: {
              type: 'string',
              example: 'nihinsa@gmail.com',
            },
          },
        },

        VerifyEmailSuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Email verified successfully! You can now login.',
            },
            verified: {
              type: 'boolean',
              example: true,
            },
          },
        },

        LoginSuccessResponse: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '65f8b7c1234567890abc1234',
            },
            name: {
              type: 'string',
              example: 'Nihinsa Bandara',
            },
            email: {
              type: 'string',
              example: 'nihinsa@gmail.com',
            },
            isAdmin: {
              type: 'boolean',
              example: false,
            },
          },
        },

        NotificationItem: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '65f8b7c1234567890abc1234',
            },
            title: {
              type: 'string',
              example: 'New Offer Available',
            },
            message: {
              type: 'string',
              example: 'Check out the latest discount offers.',
            },
            date: {
              type: 'string',
              example: '2026-03-28T10:00:00.000Z',
            },
          },
        },

        NotificationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            count: {
              type: 'number',
              example: 2,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/NotificationItem',
              },
            },
          },
        },

        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Something went wrong',
            },
          },
        },
      },
    },
  },
  apis: [
    './routes/*.js',
    './ai_extract_details/node/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
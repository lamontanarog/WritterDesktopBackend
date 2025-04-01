import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';


const PORT = process.env.PORT || 5000;

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Api plataforma de escritura TESIS',
            version: '1.0.0',
            description: 'Documentacion de Api escritura'
        },
        components:{
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: "Servidor de desarrollo"
            }
        ]
    },
    apis: [
        './src/routes/*.ts',
        './src/controllers/*.ts',
        './src/controllers/*.js'],

};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
    // console.log(JSON.stringify(swaggerSpec, null, 2));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

const Hapi = require('@hapi/hapi');

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: '127.0.0.1',
        routes: {
            cors: {
                origin: ['*'] // Allows Angular to communicate during local development
            }
        }
    });

    // Test API route
    server.route({
        method: 'GET',
        path: '/api/hello',
        handler: (request, h) => {
            return { message: 'Hello from the Hapi API!' };
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
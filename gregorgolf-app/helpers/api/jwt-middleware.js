import { expressjwt } from 'express-jwt';
import util from 'util';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();
const secret = process.env.SECRET || serverRuntimeConfig.secret;

export { jwtMiddleware };

function jwtMiddleware(req, res) {
    const middleware = expressjwt({ secret: secret, algorithms: ['HS256'] }).unless({
        path: [
            // public routes that don't require authentication
            '/api/users/register',
            '/api/users/authenticate',
            /^\/api\/users\/password\/.*/,
            /^\/api\/users\/id\/.*/,
            /^\/api\/users\/.*/
        ]
    });

    return util.promisify(middleware)(req, res);
}
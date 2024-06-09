import { expressjwt } from 'express-jwt';
import util from 'util';

const secret = process.env.NEXT_PUBLIC_SECRET;

export { jwtMiddleware };

function jwtMiddleware(req, res) {
    const middleware = expressjwt({ secret: secret, algorithms: ['HS256'] }).unless({
        path: [
            // public routes that don't require authentication
            '/api/users/register',
            '/api/users/authenticate',
            /^\/api\/users\/password\/.*/,
            /^\/api\/users\/id\/.*/,
            /^\/api\/users\/.*/,
            /^\/api\/subscriptions\/.*/,
        ]
    });

    return util.promisify(middleware)(req, res);
}
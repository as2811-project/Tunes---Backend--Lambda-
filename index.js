const registerService = require('./service/register');
const loginService = require('./service/login');
const queryService = require('./service/query');
const subscriptionService = require('./service/subscription');
const dashboardService = require('./service/dashboard');
const util = require('./utils/util');

const registerPath = '/register';
const loginPath = '/login';
const queryPath = '/query';
const subPath = '/subservice';
const dashPath = '/dashboard';

exports.handler = async (event) => {
    console.log('Request Event: ', event);
    let response;
    switch (true) {
        case event.httpMethod === 'POST' && event.path === registerPath:
            const registerBody = JSON.parse(event.body);
            response = await registerService.register(registerBody);
            break;
        case event.httpMethod === 'POST' && event.path === loginPath:
            const loginBody = JSON.parse(event.body);
            response = await loginService.login(loginBody);
            break;
        case event.httpMethod === 'POST' && event.path === queryPath:
            const queryBody = JSON.parse(event.body);
            response = await queryService.searchTunes(queryBody);
            break;
        case event.httpMethod === 'PATCH' && event.path === subPath:
            const subBody = JSON.parse(event.body);
            response = await subscriptionService.updateSubscription(subBody.email, subBody.songId, subBody.action);
            break;
        case event.httpMethod === 'POST' && event.path === dashPath:
            const dashBody = JSON.parse(event.body);
            response = await dashboardService.getUserSubscriptions(dashBody);
            break;
        default:
            response = util.buildResponse(404, '404 Not Found');
    }
    return response;
};

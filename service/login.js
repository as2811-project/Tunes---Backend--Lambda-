// Code adapted from Felix Yu YouTube Tutorial
// https://github.com/felixyu9/complete-register-login-system-backend

const AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-1'
})
const util = require('../utils/util');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'login';

async function login(user) {
  const email = user.email;
  const password = user.password;
  if (!user || !email || !password) {
    return util.buildResponse(401, {
      message: 'Email and Password are required'
    })
  }

  const dynamoUser = await getUser(email);
  if (!dynamoUser || !dynamoUser.email) {
    return util.buildResponse(403, { message: 'Email or Password is invalid' });
  }

  const passwordsMatch = password == dynamoUser.password;
  if (!passwordsMatch) {
    console.log(dynamoUser.password)
    return util.buildResponse(403, { message: 'Email or Password is invalid' });
  }
  const userInfo = {
    username: dynamoUser.user_name,
    email: dynamoUser.email
  }
  const response = {
    user: userInfo
  }
  return util.buildResponse(200, response);
}

async function getUser(email) {
  const params = {
    TableName: userTable,
    Key: {
      email: email
    }
  }

  return await dynamodb.get(params).promise().then(response => {
    return response.Item;
  }, error => {
    console.error('There is an error getting user: ', error);
  })
}

module.exports.login = login;
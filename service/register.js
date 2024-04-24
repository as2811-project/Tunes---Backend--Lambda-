// Setting up AWS region
AWS.config.update({
  region: 'us-east-1'
})

// Importing utility functions
const util = require('../utils/util');

// Creating a DynamoDB DocumentClient instance
const dynamodb = new AWS.DynamoDB.DocumentClient();
// Defining the name of the DynamoDB table
const user_table = 'login';

// Function for registering a user
async function register(userInfo) {
  // Extracting user information
  const username = userInfo.user_name;
  const useremail = userInfo.email;
  const password = userInfo.password;

  // Checking if email and password are provided
  if (!useremail || !password) {
    return util.buildResponse(401, {
      message: 'All fields are required'
    })
  }

  // Checking if the user already exists in the database
  const dynamoUser = await getUser(useremail);
  if (dynamoUser && dynamoUser.useremail) {
    return util.buildResponse(401, {
      message: 'The email already exists.'
    })
  }

  // Creating a user object
  const user = {
    user_name: username,
    email: useremail,
    password: password
  }

  // Saving the user information
  const addUserResponse = await addUser(user);
  if (!addUserResponse) {
    return util.buildResponse(503, { message: 'Error. Please try again later.' });
  }

  // Returning a successful response
  return util.buildResponse(200, { email: useremail });
}

// Function to get user information from the database
async function getUser(useremail) {
  // Setting up parameters for querying the database
  const params = {
    TableName: user_table,
    Key: {
      email: useremail
    }
  }

  // Getting user information from the database
  return await dynamodb.get(params).promise().then(response => {
    return response.Item;
  }, error => {
    console.error('Error: ', error);
  })
}

// Function to save user information to the database
async function addUser(user) {
  // Setting up parameters for saving user information
  const params = {
    TableName: user_table,
    Item: user
  }

  // Saving user information to the database
  return await dynamodb.put(params).promise().then(() => {
    return true;
  }, error => {
    console.error('There is an error adding user: ', error)
  });
}

// Exporting the register function
module.exports.register = register;

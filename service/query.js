const AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-1'
});
const util = require('../utils/util');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tunesTable = 'music'; 

async function searchTunes(queryParams) {
  const title = queryParams.title;
  const artist = queryParams.artist;
  const year = queryParams.year;

  // Validate input parameters
  if (!title && !artist && !year) {
    return util.buildResponse(400, { message: 'At least one search parameter is required' });
  }

  // Construct the DynamoDB query based on provided parameters
  const FilterExpression = [];
  const ExpressionAttributeValues = {};
  const ExpressionAttributeNames = {};
  
  if (title) {
    FilterExpression.push('contains(title, :title)');
    ExpressionAttributeValues[':title'] = title;
  }

  if (artist) {
    FilterExpression.push('contains(artist, :artist)');
    ExpressionAttributeValues[':artist'] = artist;
  }

  if (year) {
    FilterExpression.push('#yr = :year');
    ExpressionAttributeValues[':year'] = year;
    ExpressionAttributeNames['#yr'] = 'year';
  }
  
  const FilterExpressionStr = FilterExpression.join(' AND ');
  
  const params = {
    TableName: tunesTable,
    FilterExpression: FilterExpressionStr,
    ExpressionAttributeValues: ExpressionAttributeValues,
    ExpressionAttributeNames: Object.keys(ExpressionAttributeNames).length > 0 ? ExpressionAttributeNames : undefined
  };

  try {
    const response = await dynamodb.scan(params).promise();
    console.log(params.FilterExpression);
    return util.buildResponse(200, { items: response.Items });
  } catch (error) {
    console.error('Error searching tunes:', error);
    console.log(params.FilterExpression);
    return util.buildResponse(500, { message: 'Error searching tunes' });
  }
}

module.exports.searchTunes = searchTunes;
const AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-1'
});
const util = require('../utils/util');
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getUserSubscriptions(user) {
    const email = user.email;
    const params = {
        TableName: 'subscription-table', 
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
            ':email': email
        }
    };

    try {
        const response = await dynamodb.query(params).promise();
        const items = response.Items || [];
        
        const songIds = items.map(item => item.songId);

        const songDetailsWithIndex = await Promise.all(
            songIds.map(async (songId, index) => {
                const songDetails = await fetchSongDetails(songId);
                return { ...songDetails, index }; 
            })
        );

        return util.buildResponse(200, songDetailsWithIndex); 
    } catch (error) {
        console.error('Error getting subscriptions:', error);
        return util.buildResponse(500, { message: 'Error getting subscriptions' });
    }
}

async function fetchSongDetails(songId) {
    const params = {
        TableName: 'music', 
        Key: {
            songId: songId
        }
    };

    try {
        const response = await dynamodb.get(params).promise();
        return response.Item; 
    } catch (error) {
        console.error('Error fetching song details:', error);
        return {}; 
    }
}

module.exports.getUserSubscriptions = getUserSubscriptions;

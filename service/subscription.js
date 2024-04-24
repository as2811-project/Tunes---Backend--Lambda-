// Setting up AWS region
AWS.config.update({
    region: 'us-east-1'
});

// Importing utility functions
const util = require('../utils/util');

// Creating a DynamoDB DocumentClient instance
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Function to update user subscription
async function updateSubscription(email, songId, action) {
    // Checking the action to be performed
    if (action === 'add') {
        // Adding a subscription
        const params = {
            TableName: 'subscription-table',
            Item: {
                songId: songId,
                email: email
            },
            ConditionExpression: 'attribute_not_exists(songId)'
        };

        try {
            // Attempting to add subscription
            await dynamodb.put(params).promise();
            return util.buildResponse(200, { message: 'Subscription added successfully' });
        } catch (error) {
            console.error('Subscription Error:', error);
            // Handling errors
            if (error.code === 'ConditionalCheckFailedException') {
                // If the song has already been subscribed
                return util.buildResponse(409, { message: 'Song already subscribed' });
            }
            return util.buildResponse(500, { message: 'Error adding subscription' });
        }
    } else if (action === 'remove') {
        // Removing a subscription
        const params = {
            TableName: 'subscription-table',
            Key: {
                songId: songId,
                email: email
            }
        };

        try {
            // Attempting to remove subscription
            await dynamodb.delete(params).promise();
            return util.buildResponse(200, { message: 'Subscription removed successfully' });
        } catch (error) {
            console.error('Unsubscribe Error:', error);
            return util.buildResponse(500, { message: 'Error removing subscription' });
        }
    } else {
        // Handling invalid action
        return util.buildResponse(400, { message: 'Invalid action provided' });
    }
}

// Exporting the updateSubscription function
module.exports.updateSubscription = updateSubscription;

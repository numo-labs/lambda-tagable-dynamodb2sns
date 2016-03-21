var AwsHelper = require('aws-lambda-helper');
var handler = require('./lib/index').handler;

exports.handler = function (event, context) {
  // Initialise the AwsHelper
  AwsHelper.init(context);

  // Process the event when records are provided.
  // Spilts all the records in single records and creates SNS messages for each of them
  if (!event.Records) return context.fail(new Error('no records provided'));
  handler.processRecords(event.Records, function (err, result) {
    if (err) return context.fail(err);
    context.succeed(err);
  });
};

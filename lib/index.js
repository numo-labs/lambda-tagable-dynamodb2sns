// var services = require('./services.js')
var _ = require('lodash');
var async = require('async');
var AwsHelper = require('aws-lambda-helper');

// Config
var RECORD_INSERTED_TOPIC = 'tagable-document-modified';
var RECORD_MODIFIED_TOPIC = 'tagable-document-modified';
var RECORD_REMOVED_TOPIC = 'tagable-document-removed';

var handler = {};

// Handle an array of dynamoDB records
handler.processRecords = function (records, cb) {
  if (!Array.isArray(records)) return cb(new Error('no array of records provided'));

  var result = {
    errors: [],
    processed: []
  };

  // Process each record (limit to 10 at the same time)
  async.eachLimit(records, 10,
    function (record, callback) {
      handler._processRecord(record, function (err, response) {
        if (err) {
          // We don't return an error, an keep processing all records
          // we push the error instead to an error array
          result.errors.push({record: record, error: err});
          return callback();
        }
        result.processed.push(response);
        return callback();
      });
    },
    function (err) {
      cb(err, result);
    });
};

// Process a single record
handler._processRecord = function processRecord (record, cb) {
  // Simplify record and create a document concluding old and new values
  var doc = handler._getDoc(record);

  // Calculate difference
  doc.diff = handler._getDiff(doc);

  handler._publishDoc(doc, cb);
};

handler._publishDoc = function (doc, cb) {
  // Do an action based on the eventName
  switch (doc.eventName) {
    case 'INSERT':
      handler._pubishDocToSns(RECORD_INSERTED_TOPIC, doc, cb);
      break;
    case 'MODIFY':
      handler._pubishDocToSns(RECORD_MODIFIED_TOPIC, doc, cb);
      break;
    case 'REMOVE':
      handler._pubishDocToSns(RECORD_REMOVED_TOPIC, doc, cb);
      break;
    default:
      cb(new Error('unkonow eventName : ' + doc.eventName));
  }
};

handler._pubishDocToSns = function (topic, doc, cb) {
  var params = {
    Message: doc,
    MessageStructure: 'json',
    Subject: '', // only used for eMail end-points
    TargetArn: topic,
    TopicArn: topic
  };
  AwsHelper.SNS.publish(params, function (err, data) {
    cb(err, data);
  });
};

handler._getDiff = function (doc) {
  var newTags = _.result(doc, 'newValues.tags', null);
  var oldTags = _.result(doc, 'oldValues.tags', null);
  var newChanged = null;
  var oldChanged = null;

  // Compare both arrays and look for changes, from old and new viewpoint
  if (oldTags && newTags) {
    newChanged = _.differenceWith(newTags, oldTags, _.isEqual);
    oldChanged = _.differenceWith(oldTags, newTags, _.isEqual);
  } else {
    newChanged = newTags || [];
    oldChanged = oldTags || [];
  }

  return {
    tags: {
      modified: newChanged,
      removed: _.differenceBy(oldChanged, newChanged, 'tagId')
    }
  };
};

handler._getDoc = function (dynamoDbRecord) {
  var doc = {};
  doc.key = dynamoDbRecord.dynamodb.Keys._id.S;
  doc.eventID = dynamoDbRecord.eventID;
  doc.eventName = dynamoDbRecord.eventName;
  doc.eventVersion = dynamoDbRecord.eventVersion;
  doc.eventSource = dynamoDbRecord.eventSource;
  doc.awsRegion = dynamoDbRecord.awsRegion;

  doc.oldValues = JSON.parse(_.result(dynamoDbRecord, 'dynamodb.OldImage.doc.S', null));
  doc.newValues = JSON.parse(_.result(dynamoDbRecord, 'dynamodb.NewImage.doc.S', null));
  return doc;
};

exports.handler = handler;

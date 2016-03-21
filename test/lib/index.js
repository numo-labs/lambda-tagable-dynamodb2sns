'use strict';

var assert = require('assert');
var handler = require('./../../lib/index').handler;
var simple = require('simple-mock');
var fixtures = require('./../fixtures/fixtures');
var AwsHelper = require('aws-lambda-helper');

describe('lambda-tagable-dynamodb2sns', function () {
  afterEach(function () {
    simple.restore();
  });

  describe('_processRecords - process a array of dynamodb records', function () {
    it('should fail if no array of dynamodb records is provided', function (done) {
      var mockDoc = {};
      handler.processRecords(mockDoc, function (err) {
        assert.equal(err.message, 'no array of records provided');
        done();
      });
    });

    it('should process a list of given records', function (done) {
      // Fake document, only used to test the processRecords loop
      var mockDoc = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

      simple.mock(handler, '_processRecord').callFn(function (doc, cb) {
        assert(doc > 0);
        return cb(null, doc);
      });

      handler.processRecords(mockDoc, function (err, result) {
        if (err) return done(err);
        assert.deepEqual({errors: [], processed: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ]}, result);
        done();
      });
    });

    it('should process a list of given records, and handle single failed one correctly', function (done) {
      // Fake document, only used to test the processRecords loop
      var mockDoc = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

      simple.mock(handler, '_processRecord').callFn(function (doc, cb) {
        assert(doc > 0);
        if (doc === 2) return cb('fake_error');
        return cb(null, doc);
      });

      handler.processRecords(mockDoc, function (err, result) {
        if (err) return done(err);
        assert.deepEqual({errors: [{
          'error': 'fake_error',
          'record': 2
        }], processed: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}, result);
        done();
      });
    });
  });

  describe('_getDoc - convert a dynamodb record in a tagable document', function () {
    it('should be able to map a dynamodb record to a document with old and new values', function (done) {
      var mockRecord = fixtures.getDynamoDBRecords();
      var doc = handler._getDoc(mockRecord.Records[0]);
      assert.equal(doc.key, 'fFTkLGQLO.hrm:letoh');
      assert.equal(doc.eventName, 'MODIFY');
      assert(doc.oldValues != null);
      assert(doc.newValues != null);
      done();
    });
  });

  describe('_getDiff - get the difference between old and new values', function () {
    it('should be able to get the diffences between old and new', function (done) {
      var doc = handler._getDiff(fixtures.getDoc());
      // console.log(JSON.stringify(doc));
      var expectedResult = {
        'tags': {
          'modified': [
            {
              'tagId': 'geography:geonames.126',
              'tagType': 'geography',
              'source': 'tag:source.user.12236',
              'active': true
            },
            {
              'tagId': 'geography:geonames.125',
              'tagType': 'geography',
              'source': 'tag:source.user.12235',
              'active': false
            }
          ],
          'removed': [
            {
              'tagId': 'geography:geonames.1',
              'tagType': 'geography',
              'source': 'tag:source.user.1',
              'active': true
            }
          ]
        }
      };

      assert.deepEqual(doc, expectedResult);

      done();
    });
  });

  describe('_processRecord - process a single dynamodb record', function () {
    it('should be possible to process a single record', function (done) {
      var mockRecord = fixtures.getDynamoDBRecords();

      // stub the SNS.publish function
      simple.mock(handler, '_publishDoc').callFn(function (doc, cb) {
        assert(doc != null);
        return cb(null, 'mock_ok');
      });

      handler._processRecord(mockRecord.Records[0], function (err, data) {
        assert(err === null);
        assert.equal(data, 'mock_ok');
        done();
      });
    });

    it('should be possible to process a single record, no oldValue', function (done) {
      var mockRecord = fixtures.getDynamoDBRecordInsert();

      // stub the SNS.publish function
      simple.mock(handler, '_publishDoc').callFn(function (doc, cb) {
        var expectedDiff = {
          tags: {
            'modified': [
              {
                'tagId': 'geography:geonames.123',
                'tagType': 'geography',
                'source': 'tag:source.user.12234',
                'active': true
              },
              {
                'tagId': 'geography:geonames.125',
                'tagType': 'geography',
                'source': 'tag:source.user.12235',
                'active': false
              }
            ],
            removed: []
          }
        };
        assert.deepEqual(doc.diff, expectedDiff);
        // console.log(JSON.stringify(doc, null, 2));
        return cb(null, 'mock_ok');
      });

      handler._processRecord(mockRecord, function (err, data) {
        assert(err === null);
        assert.equal(data, 'mock_ok');
        done();
      });
    });

    it('should be possible to process a single record (error)', function (done) {
      var mockRecord = fixtures.getDynamoDBRecords();

      simple.mock(handler, '_publishDoc').callFn(function (doc, cb) {
        assert(doc != null);
        return cb(new Error('fake error'));
      });

      handler._processRecord(mockRecord.Records[0], function (err, data) {
        assert(err.message === 'fake error');
        done();
      });
    });
  });

  describe('_publishDoc - publish a tagable doc (insert, update, delete)', function () {
    it('should be possible to publish a document (insert)', function (done) {
      simple.mock(handler, '_pubishDocToSns').callFn(function (topic, doc, cb) {
        assert(topic != null);
        assert.equal(doc.eventName, 'INSERT');
        return cb(null, 'mock_ok');
      });

      handler._publishDoc({eventName: 'INSERT'}, function (err, doc) {
        if (err) return done(err);
        assert.equal(doc, 'mock_ok');
        done();
      });
    });

    it('should be possible to publish a document (update)', function (done) {
      simple.mock(handler, '_pubishDocToSns').callFn(function (topic, doc, cb) {
        assert(topic != null);
        assert.equal(doc.eventName, 'MODIFY');
        return cb(null, 'mock_ok');
      });

      handler._publishDoc({eventName: 'MODIFY'}, function (err, doc) {
        if (err) return done(err);
        assert.equal(doc, 'mock_ok');
        done();
      });
    });

    it('should be possible to publish a document (deleted)', function (done) {
      simple.mock(handler, '_pubishDocToSns').callFn(function (topic, doc, cb) {
        assert(topic != null);
        assert.equal(doc.eventName, 'REMOVE');
        return cb(null, 'mock_ok');
      });

      handler._publishDoc({eventName: 'REMOVE'}, function (err, doc) {
        if (err) return done(err);
        assert.equal(doc, 'mock_ok');
        done();
      });
    });

    it('should be possible to publish a document (error)', function (done) {
      handler._publishDoc({eventName: 'FOO'}, function (err) {
        assert.equal(err.message, 'unkonow eventName : ' + 'FOO');
        done();
      });
    });

    it('should be possible to process a list of products', function (done) {
      handler._publishDoc({eventName: 'FOO'}, function (err) {
        assert.equal(err.message, 'unkonow eventName : ' + 'FOO');
        done();
      });
    });
  });

  describe('_pubishDocToSns - publish dynamodb docs to an SNS endpoint', function () {
    it('should be possible to publish a document to an sns topic', function (done) {
      var doc = fixtures.getDocToPublish();
      var topic = 'sns-docinserted-topic'; // fake topic

      var context = {
        'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:prod'
      };
      AwsHelper.init(context);
      AwsHelper._SNS = new AwsHelper._AWS.SNS();

      // stub the SNS.publish function
      simple.mock(AwsHelper._SNS, 'publish').callFn(function (params, cb) {
        assert.deepEqual(params.Message, doc);
        assert.equal(params.MessageStructure, 'json');
        assert.equal(params.TargetArn, 'sns-docinserted-topic');
        assert.equal(params.TopicArn, 'arn:aws:sns:eu-west-1:123456789:sns-docinserted-topic-prod');
        cb(null, {MessageId: 'mock-message-id'});
      });

      handler._pubishDocToSns(topic, doc, function (err, result) {
        if (err) return done(err);
        assert.equal(result.MessageId, 'mock-message-id');
        done();
      });
    });
  });
});

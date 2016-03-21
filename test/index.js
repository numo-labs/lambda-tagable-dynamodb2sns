'use strict';

// var assert = require('assert');
var index = require('./../index');
var simple = require('simple-mock');
// var fixtures = require('./../fixtures/fixtures');
// var AwsHelper = require('aws-lambda-helper');

describe('lambda-tagable-dynamodb2sns', function () {
  afterEach(function () {
    simple.restore();
  });

  describe('index.handler, function (event, context)', function () {
    it('should be able to call the index.handler (called by the lamda invoction)', function (done) {
      var context = {
        'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:prod',
        fail: function (err) {
          console.log(err);
          done();
        },
        succeed: function (data) {
          console.log(data);
          done();
        }
      };
      var event = {'Records': []};
      index.handler(event, context);
    });
  });

  // describe('index.handler, should return an error when an invalid record is given', function () {
  //   it('should be able to call the index.handler (called by the lamda invoction)', function (done) {
  //     var context = {
  //       'invokedFunctionArn': 'arn:aws:lambda:eu-west-1:123456789:function:aws-canary-lambda:prod',
  //       fail: function (err) {
  //         console.log(err.message);
  //         assert.equal(err.messsage, 'no records provided');
  //         done(err);
  //       }
  //     };
  //     var event = {};
  //     index.handler(event, context);
  //   });
  // });
});

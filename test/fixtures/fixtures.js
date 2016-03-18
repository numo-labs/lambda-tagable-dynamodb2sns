var _ = require('lodash');

// http://docs.aws.amazon.com/dynamodbstreams/latest/APIReference/API_Record.html

exports.getDynamoDBRecords = function () {
  return {
    'Records': [
      {
        'eventID': '89cfa3408f86e1542a29c8ee27984f6d',
        'eventName': 'MODIFY',
        'eventVersion': '1.0',
        'eventSource': 'aws:dynamodb',
        'awsRegion': 'eu-west-1',
        'dynamodb': {
          'Keys': {
            '_id': {
              'S': 'fFTkLGQLO.hrm:letoh'
            }
          },
          'NewImage': {
            '_id': {
              'S': 'fFTkLGQLO.hrm:letoh'
            },
            'displayName': {
              'S': 'foo-display-name'
            },
            'activeTags': {
              'SS': ['geography:geonames.123']
            },
            'disabledTags': {
              'SS': ['geography:geonames.125']
            },
            'doc': {
              'S': '{"_id":"hotel:mrh.OLQGLkTFf","displayName":"foo-display-name","tags":[{"tagId":"geography:geonames.123","tagType":"geography","source":"tag:source.user.12234","active":true},{"tagId":"geography:geonames.125","tagType":"geography","source":"tag:source.user.12235","active":false}],"content":[{"key":"label:en","values":["Hotel ABC"]},{"key":"search:en","values":["Hotel ABC"]}]}'
            }
          },
          'OldImage': {
            '_id': {
              'S': 'fFTkLGQLO.hrm:letoh'
            },
            'displayName': {
              'S': 'foo-display-name'
            },
            'activeTags': {
              'SS': ['geography:geonames.123', 'geography:geonames.125']
            },
            'disabledTags': {
              'SS': []
            },
            'doc': {
              'S': '{"_id":"hotel:mrh.OLQGLkTFf","displayName":"foo-display-name","tags":[{"tagId":"geography:geonames.123","tagType":"geography","source":"tag:source.user.12234","active":true},{"tagId":"geography:geonames.125","tagType":"geography","source":"tag:source.user.12235","active":true}],"content":[{"key":"label:en","values":["Hotel ABC"]},{"key":"search:en","values":["Hotel ABC"]}]}'
            }
          },
          'SequenceNumber': '3069800000000002582709950',
          'SizeBytes': 71,
          'StreamViewType': 'NEW_AND_OLD_IMAGES'
        },
        'eventSourceARN': 'arn:aws:dynamodb:eu-west-1:847002989232:table/numo-tagable/stream/2016-03-02T10:55:50.195'
      }
    ]
  };
};

exports.getDynamoDBRecordInsert = function () {
  var doc = exports.getDynamoDBRecords().Records[0];
  doc.dynamodb = _.omit(doc.dynamodb, 'OldImage');
  doc.eventName = 'INSERT';
  return doc;
};

exports.getDoc = function () {
  return {
    'key': 'fFTkLGQLO.hrm:letoh',
    '_id': 'hotel:mrh.OLQGLkTFf',
    'eventName': 'INSERT',
    'newValues': {
      '_id': 'hotel:mrh.OLQGLkTFf',
      'displayName': 'foo-display-name',
      'tags': [
        { // Equal
          'tagId': 'geography:geonames.123',
          'tagType': 'geography',
          'source': 'tag:source.user.12234',
          'active': true
        },
        { // Equal
          'tagId': 'geography:geonames.124',
          'tagType': 'geography',
          'source': 'tag:source.user.122344',
          'active': true
        },
        { // ** added
          'tagId': 'geography:geonames.126',
          'tagType': 'geography',
          'source': 'tag:source.user.12236',
          'active': true
        },
        { // ** de-activated
          'tagId': 'geography:geonames.125',
          'tagType': 'geography',
          'source': 'tag:source.user.12235',
          'active': false
        }
      ],
      'content': [
        {
          'key': 'label:en',
          'values': [
            'Hotel ABC'
          ]
        },
        {
          'key': 'search:en',
          'values': [
            'Hotel ABC'
          ]
        }
      ]
    },
    'oldValues': {
      '_id': 'hotel:mrh.OLQGLkTFf',
      'displayName': 'foo-display-name',
      'tags': [
        { // ** Removed
          'tagId': 'geography:geonames.1',
          'tagType': 'geography',
          'source': 'tag:source.user.1',
          'active': true
        },
        { // Equal
          'tagId': 'geography:geonames.123',
          'tagType': 'geography',
          'source': 'tag:source.user.12234',
          'active': true
        },
        { // Equal
          'tagId': 'geography:geonames.124',
          'tagType': 'geography',
          'source': 'tag:source.user.122344',
          'active': true
        },
        { // de-activated
          'tagId': 'geography:geonames.125',
          'tagType': 'geography',
          'source': 'tag:source.user.12235',
          'active': true
        }
      ],
      'content': [
        {
          'key': 'label:en',
          'values': [
            'Hotel ABC'
          ]
        },
        {
          'key': 'search:en',
          'values': [
            'Hotel ABC'
          ]
        }
      ]
    }
  };
};

exports.getDocToPublish = function () {
  return {
    'key': 'fFTkLGQLO.hrm:letoh',
    'eventID': '89cfa3408f86e1542a29c8ee27984f6d',
    'eventName': 'INSERT',
    'eventVersion': '1.0',
    'eventSource': 'aws:dynamodb',
    'awsRegion': 'eu-west-1',
    'oldValues': null,
    'newValues': {
      '_id': 'hotel:mrh.OLQGLkTFf',
      'displayName': 'foo-display-name',
      'tags': [
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
      'content': [
        {
          'key': 'label:en',
          'values': [
            'Hotel ABC'
          ]
        },
        {
          'key': 'search:en',
          'values': [
            'Hotel ABC'
          ]
        }
      ]
    },
    'diff': {
      'tags': {
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
        'removed': []
      }
    }
  };
};

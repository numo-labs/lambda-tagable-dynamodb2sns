# lambda-tagable-dynamodb2sns

Lambda function triggered by dynamoDB for tagable project. 

Tagable project is a project which allows tag management of document and link them together. 
The project contains indexers and classifiers who listen to SNS messages produced by this lambda. 

## Details and usage

### Input 

A list of records to be processed 


### SNS topics

Publishes document to the following SNS queues:  
 * tagable-tags-changed, tags have been changed in the new doc
 * tagable-document-modified-{env}, a document was inserted or updated in the tagable dynamoDB table 
 * tagable-document-removed-{env}, a new document was deleted from the tagable dynamoDB table 

### Document structure

```
  var doc = {
    _id : "hotel:mhid.abc" //the id of the document 
    displayName : "Hotel ABC",
    tags : [    
        {
            tagId: "geography:geonames.123",
            tagType: "geography",
            source: "tag:source.user.12234",
            active: true
        },
        {
            tagId: "geography:geonames.123",
            tagType: "geography",
            source: "tag:source.user.12234",
            active: false
        }
    ],
    "content": [
        {
            key: "label:en",
            values: ["Hotel ABC"]
        },
        {
            key: "search:en",
            values: ["Hotel ABC"]
        }
    ]
  }
```

### DynamoDB structure

_id: String 
displayName: String
activeTags: StringSet // extracted for querying
disabledTags: StringSet // extracted for querying 
doc: String // full document in json format 
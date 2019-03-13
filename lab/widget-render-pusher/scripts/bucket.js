'use strict';

AWS.config.region = 'eu-west-1';

var s3 = new AWS.S3();

function unauthenticatedRequest(operation, params, callback) {
    var request = s3[operation](params);
    request.removeListener('validate', AWS.EventListeners.Core.VALIDATE_CREDENTIALS);
    request.removeListener('sign', AWS.EventListeners.Core.SIGN);
    return request.send(callback);
}

function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

const put = function(id, data) {
    var params = {
        Bucket: 'backbase-renderconf',
        Key: id + '/' + makeid(),
        ACL: 'public-read',
        Body: data
    };
    return new Promise(function(resolve, reject) {
      unauthenticatedRequest('putObject', params, function(err, data) {
          if (err) reject(err);
          else resolve(data); // successful response
      });
    });
}

const list = function(id) {
    var params = {
        Bucket: 'backbase-renderconf',
        Prefix: id + '/'
    };

    return new Promise(function(resolve, reject) {
        unauthenticatedRequest('listObjects', params, function(err, data) {
            if (err) {
                reject(err);
            }
            var results = data.Contents.map(function(item) {
                return 'https://s3-eu-west-1.amazonaws.com/backbase-renderconf/' + item.Key;
            });
            resolve(results);
        });
    });
};

module.exports = {
    put: put,
    list: list,
    makeid: makeid
}

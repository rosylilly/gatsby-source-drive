const { GoogleToken } = require('gtoken');
const request = require('request');

const getToken = (key, email) => {
  return new Promise((resolve, reject) => {
    const gtoken = new GoogleToken({
      key,
      email,
      scope: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    gtoken.getToken((err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

const getFolder = (folderId, token) => {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: `https://www.googleapis.com/drive/v3/files`,
        auth: {
          bearer: token,
        },
        qs: {
          q: `'${folderId}' in parents`,
        },
      },
      (err, res, body) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(body).files);
        }
      }
    );
  });
};

const getFile = (fileId, token) => {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: `https://www.googleapis.com/drive/v3/files/${fileId}?fields=webContentLink%2C%20createdTime`,
        auth: {
          bearer: token,
        },
        contentType: 'application/json'
      },
      (err, res, body) => {
        if (err) {
          reject(err);
        } else {
          resolve(body);
        }
      }
    );
  });
};

module.exports = {
  getToken,
  getFolder,
  getFile,
};

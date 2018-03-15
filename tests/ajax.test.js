
const Ajax = require('../src/utils/ajax.js');

global.fetch = window.fetch = require('jest-fetch-mock');

const mockResponse = (status, statusText, response) => {
  return new window.Response(response, {
    status: status,
    statusText: statusText,
    headers: {
      'Content-type': 'application/json'
    }
  });
};

// module definition 

test('Ajax functions are defined', () => {
  expect(Ajax.post).not.toBeUndefined();
  expect(Ajax.get).not.toBeUndefined();
});

test('Ajax POST completes', () => {


  fetch.mockResponse(JSON.stringify({access_token: '12345' }), {status:200});

  Ajax.post('http://test.com', 'token', {s: 'one'}).then(function(data){
    expect(data).not.toBeUndefined();
    expect(data).toMatchObject({access_token: "12345" });
  });
});

test('Ajax Get completes', () => {

  var args = {s: 'one'};

  fetch.mockResponse(JSON.stringify({access_token: '12345' }), {status:200});

  Ajax.get('http://test.com', 'token', args).then(function(data){
    expect(data).not.toBeUndefined();
    expect(data).toMatchObject({access_token: "12345" });
  });
});


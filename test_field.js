const http = require('http');

const postData = JSON.stringify({
  fieldName: 'Test Field',
  cropType: 'Corn',
  area: 10.5,
  location: 'Test Location',
  plantingDate: '2024-01-01',
  expectedHarvestDate: '2024-06-01',
  status: 'planning'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/fields',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.write(postData);
req.end();
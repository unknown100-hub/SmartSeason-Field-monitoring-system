const http = require('http');

const fieldData = {
  id: 'test-field-001',
  name: 'Test Field',
  cropType: 'Maize',
  location: 'Test Location',
  hectares: 10.5,
  soilType: 'Loam',
  irrigationType: 'Drip',
  plantingDate: '2024-01-01',
  harvestDate: '2024-06-01',
  assigneeId: 'u-002',
  stage: 'Planted',
  risk: 'Moderate',
  moisture: 56,
  ndvi: 0.6,
  completion: 12,
  status: 'Active',
  lastUpdate: new Date().toISOString()
};

const postData = JSON.stringify(fieldData);

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

console.log('Sending data:', fieldData);

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
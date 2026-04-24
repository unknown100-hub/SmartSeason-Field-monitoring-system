const http = require('http');
const data = JSON.stringify({
  id: 'fld-test-02',
  name: 'Test Field 2',
  cropType: 'Maize',
  location: 'Test Farm',
  hectares: 12.34,
  soilType: 'Loam',
  irrigationType: 'Drip',
  plantingDate: '2026-06-01',
  harvestDate: '2026-10-01',
  assigneeId: 'u-002',
  stage: 'Planted',
  moisture: 56,
  ndvi: 0.6,
  completion: 12,
  status: 'Active',
  lastUpdate: new Date().toISOString(),
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/fields',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});

req.on('error', (err) => {
  console.error('REQUEST ERROR:', err.message);
});

req.write(data);
req.end();
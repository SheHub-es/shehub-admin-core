// mock-server.js - Simple mock server for testing
const http = require('http');
const url = require('url');

const PORT = 8080;

// Mock data
const mockApplicants = [
  {
    id: 1,
    name: "María García",
    email: "maria.garcia@email.com",
    phone: "+34 600 123 456",
    language: "ES",
    location: "Madrid, España",
    mentor: true,
    createdAt: "2024-01-15T10:30:00Z",
    userId: "user_001"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 555 234 567",
    language: "EN",
    location: "New York, USA",
    mentor: false,
    createdAt: "2024-02-20T14:15:00Z",
    userId: null
  },
  {
    id: 3,
    name: "Fatima Al-Zahra",
    email: "fatima.alzahra@email.com",
    phone: "+971 50 345 678",
    language: "AR",
    location: "Dubai, UAE",
    mentor: true,
    createdAt: "2024-03-10T09:45:00Z",
    userId: "user_003"
  }
];

const mockStats = {
  total: mockApplicants.length,
  mentors: mockApplicants.filter(a => a.mentor).length,
  pending: mockApplicants.filter(a => !a.userId).length,
  converted: mockApplicants.filter(a => a.userId).length
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse Authorization header
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Authentication required' }));
    return;
  }

  console.log(`${method} ${path}`);

  // Routes
  if (path === '/actuator/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'UP', 
      timestamp: new Date().toISOString(),
      components: {
        db: { status: 'UP' },
        ping: { status: 'UP' }
      }
    }));
  }
  else if (path === '/api/applicants' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockApplicants));
  }
  else if (path === '/api/applicants/stats' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockStats));
  }
  else if (path === '/api/applicants/count' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ count: mockApplicants.length }));
  }
  else if (path === '/api/applicants/count/mentor' && method === 'GET') {
    const isMentor = parsedUrl.query.mentor === 'true';
    const count = mockApplicants.filter(a => a.mentor === isMentor).length;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ count }));
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Endpoint not found', path }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Mock API Server running at http://localhost:${PORT}`);
  console.log('📊 Available endpoints:');
  console.log('  GET /actuator/health');
  console.log('  GET /api/applicants');
  console.log('  GET /api/applicants/stats');
  console.log('  GET /api/applicants/count');
  console.log('  GET /api/applicants/count/mentor?mentor=true|false');
  console.log('\n💡 Use Basic Auth with any credentials for testing');
  console.log('   Example: admin@shehub.com:admin123');
});

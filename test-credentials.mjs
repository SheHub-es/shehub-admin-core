// test-credentials.js - Script to test different credential combinations

const credentialsCombinations = [
  { user: 'admin@shehub.com', pass: 'admin123' },
  { user: 'admin', pass: 'admin' },
  { user: 'admin', pass: 'password' },
  { user: 'admin', pass: 'admin123' },
  { user: 'user', pass: 'password' },
  { user: 'admin@example.com', pass: 'password' },
  { user: 'test', pass: 'test' },
  { user: 'shehub', pass: 'shehub123' }
];

async function testCredentials(user, pass) {
  const auth = Buffer.from(`${user}:${pass}`).toString('base64');
  
  try {
    const response = await fetch('http://localhost:8080/api/applicants', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data: data?.length || 'Response received' };
    } else {
      return { success: false, status: response.status, statusText: response.statusText };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function findWorkingCredentials() {
  console.log('🔍 Testing credentials against Spring Boot server...\n');
  
  for (const creds of credentialsCombinations) {
    process.stdout.write(`Testing ${creds.user}:${creds.pass}... `);
    
    const result = await testCredentials(creds.user, creds.pass);
    
    if (result.success) {
      console.log(`✅ SUCCESS!`);
      console.log(`📊 Response: ${result.data}`);
      console.log(`\n🎉 WORKING CREDENTIALS FOUND!`);
      console.log(`   Username: ${creds.user}`);
      console.log(`   Password: ${creds.pass}`);
      console.log(`\n💡 Update your login with these credentials.`);
      return;
    } else {
      if (result.status === 401) {
        console.log(`❌ Unauthorized`);
      } else if (result.status) {
        console.log(`❌ HTTP ${result.status}: ${result.statusText}`);
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
    }
  }
  
  console.log(`\n❌ None of the tested credentials worked.`);
  console.log(`💡 Check your Spring Boot configuration for the correct credentials.`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  findWorkingCredentials();
}

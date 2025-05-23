const autocannon = require('autocannon');
const app = require('../../server');


const config = {
  url: 'http://localhost:4000',
  connections: 100,
  duration: 10, 
  pipelining: 1,
  timeout: 10, 
};


const scenarios = [
  {
    name: 'GET /books - List Books',
    method: 'GET',
    path: '/books',
  },
  {
    name: 'GET /auth/verify - Verify Token',
    method: 'GET',
    path: '/auth/verify',
    headers: {
      'Authorization': 'Bearer test-token'
    }
  },
  {
    name: 'POST /auth/login - Login',
    method: 'POST',
    path: '/auth/login',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword'
    })
  }
];


async function runTest(scenario) {
  console.log(`\nRunning test: ${scenario.name}`);
  
  const test = autocannon({
    ...config,
    url: `${config.url}${scenario.path}`,
    method: scenario.method,
    headers: scenario.headers,
    body: scenario.body
  });

  autocannon.track(test, { renderProgressBar: true });

  return new Promise((resolve) => {
    test.on('done', (results) => {
      console.log('\nResults:');
      console.log(`Average Latency: ${results.latency.average}ms`);
      console.log(`Requests/sec: ${results.requests.average}`);
      console.log(`2xx responses: ${results['2xx']}`);
      console.log(`Non 2xx responses: ${results.non2xx}`);
      console.log(`Errors: ${results.errors}`);
      resolve(results);
    });
  });
}

// Main function to run all tests
async function runAllTests() {
  console.log('Starting performance tests...');
  console.log('Configuration:', config);

  for (const scenario of scenarios) {
    await runTest(scenario);
  }
}

// Run the tests
runAllTests().catch(console.error);
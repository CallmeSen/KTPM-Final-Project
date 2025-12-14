import autocannon from 'autocannon';

async function loginPerformanceTest() {
  console.log('🚀 Start Login Performance Test...');

  const result = await autocannon({
    url: 'http://localhost:8000/auth/login',
    method: 'POST',
    connections: 100,     // 100 user đồng thời
    duration: 30,         // chạy 30 giây
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@gmail.com',
      password: '123456',
    }),
  });

  console.log('📊 Performance Test Result');
  console.log('--------------------------');
  console.log('Requests/sec:', result.requests.average);
  console.log('Latency avg (ms):', result.latency.average);
  console.log('Errors:', result.errors);
}

loginPerformanceTest().catch(console.error);

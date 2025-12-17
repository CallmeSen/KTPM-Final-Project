// performance/login.performance.ts
import autocannon from 'autocannon';

async function runLoginPerformanceTest() {
    console.log('Login Performance Test');

    const result = await autocannon({
        url: 'http://localhost:8000/auth/login',
        method: 'POST',
        connections: 100,   // 100 user đồng thời
        duration: 30,       // 30 giây
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: 'test@gmail.com',
            password: '123456',
        }),
    });

    console.log('📊 Result');
    console.log({
        requestsPerSecond: result.requests.average,
        latencyAvg: result.latency.average,
        errors: result.errors,
    });
}

runLoginPerformanceTest();

// performance/system.performance.ts
import autocannon from 'autocannon';

async function runSystemPerformanceTest() {
    console.log('🚀 SYSTEM PERFORMANCE TEST');

    const result = await autocannon({
        url: 'http://localhost:8000',
        connections: 200,     // tổng user đồng thời
        duration: 30,

        headers: {
            'Content-Type': 'application/json',
        },

        requests: [
            // 🔹 GET PRODUCTS (50%)
            {
                method: 'GET',
                path: '/products',
              
            },

            // 🔹 LOGIN (20%)
            {
                method: 'POST',
                path: '/auth/login',
               
                body: JSON.stringify({
                    email: 'test@gmail.com',
                    password: '123456',
                }),
            },

            // 🔹 REGISTER (10%)
            {
                method: 'POST',
                path: '/auth/register',
              
                body: JSON.stringify({
                    email: `user_${Date.now()}@gmail.com`,
                    password: '123456',
                    name: 'Test User',
                }),
            },

            // 🔹 CREATE ORDER (20%)
            {
                method: 'POST',
                path: '/orders',
               
                body: JSON.stringify({
                    productId: 1,
                    quantity: 1,
                }),
            },
        ],
    });

    console.log('\n📊 PERFORMANCE RESULT');
    console.log('='.repeat(50));

    console.log({
        // 🔹 Requests
        requests: {
            total: result.requests.total,
            avgPerSec: result.requests.average,
        },

        // 🔹 Latency
        latency: {
            avg: result.latency.average,
            p90: result.latency.p90,
            p99: result.latency.p99,
        },

        // 🔹 Throughput
        throughput: {
            avg: result.throughput.average,
        },

        // 🔹 Errors
        errors: {
            totalErrors: result.errors,
            non2xx: result.non2xx,
            timeouts: result.timeouts,
        },
    });

    console.log('='.repeat(50));
}

runSystemPerformanceTest();

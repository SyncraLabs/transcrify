const axios = require('axios');

async function testUrl(url) {
    console.log(`Testing ${url}...`);
    try {
        const response = await axios.post('http://localhost:3000/api/transcribe', { url });
        console.log('Success:', response.data.title);
    } catch (error) {
        if (error.response) {
            console.log('Failed Status: ' + error.response.status);
            console.log('Error Data: ' + JSON.stringify(error.response.data));
        } else {
            console.log('Error Message: ' + error.message);
        }
    }
}

async function run() {
    await testUrl('https://vm.tiktok.com/ZNRy23QsE/');
    await testUrl('https://www.youtube.com/watch?v=E-LZv1FRplk');
}

run();

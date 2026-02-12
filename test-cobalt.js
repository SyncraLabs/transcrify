const axios = require('axios');

const instances = [
    'https://api.cobalt.tools',
    'https://cobalt.api.red',
    'https://api.wuk.sh'
];

const testPayload = {
    url: 'https://www.youtube.com/watch?v=E-LZv1FRplk',
    isAudioOnly: true,
    filenamePattern: 'classic',
    aFormat: 'mp3'
};

async function testInstance(baseUrl) {
    console.log(`Testing ${baseUrl}...`);
    try {
        const response = await axios.post(`${baseUrl}/api/json`, testPayload, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10s timeout
        });

        console.log(`[PASS] ${baseUrl}`);
        console.log('Status:', response.data.status);
        if (response.data.url) console.log('URL:', response.data.url);
        if (response.data.text) console.log('Text:', response.data.text);
    } catch (error) {
        console.log(`[FAIL] ${baseUrl}`);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data));
        } else {
            console.log('Error:', error.message);
        }
    }
    console.log('---');
}

async function run() {
    for (const instance of instances) {
        await testInstance(instance);
    }
}

run();

import axios from 'axios';

async function testApi() {
    const url = 'https://www.youtube.com/watch?v=E-LZv1FRpIk';
    console.log(`Testing API locally for URL: ${url}`);
    try {
        const response = await axios.post('http://localhost:3000/api/transcribe', { url });
        console.log('Success:', response.data.title);
    } catch (error) {
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
        } else {
            console.error('Error message:', error.message);
        }
    }
}

testApi();

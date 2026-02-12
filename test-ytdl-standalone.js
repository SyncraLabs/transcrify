const ytdl = require('@distube/ytdl-core');

async function testYtdl(url) {
    console.log(`\n--- Testing ytdl-core for URL: ${url} ---`);
    try {
        const isValid = ytdl.validateURL(url);
        console.log('URL is valid:', isValid);

        if (!isValid) {
            console.error('ytdl.validateURL says the URL is invalid!');
            return;
        }

        const info = await ytdl.getBasicInfo(url);
        console.log('Video title:', info.videoDetails.title);
        console.log('Success (Basic Info)!');

        console.log('Attempting to download video + audio stream...');
        const stream = ytdl(url, {
            filter: 'videoandaudio',
            quality: 'lowest',
        });

        await new Promise((resolve, reject) => {
            stream.on('data', (chunk) => {
                console.log(`Received chunk of size: ${chunk.length}`);
                stream.destroy(); // Just want to see if it starts
                resolve();
            });
            stream.on('error', (err) => {
                console.error('Download error:', err.message);
                reject(err);
            });
            // Timeout if no data
            setTimeout(() => reject(new Error('Download timeout')), 10000);
        });
        console.log('Success (Download Started)!');
    } catch (error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.stack) {
            console.error('Stack trace snippet:', error.stack.split('\n').slice(0, 5).join('\n'));
        }
    }
}

async function runTests() {
    await testYtdl('https://www.youtube.com/watch?v=E-LZv1FRpIk'); // User's URL
    await testYtdl('https://www.youtube.com/watch?v=aqz-KE-bpKQ'); // Big Buck Bunny
}

runTests();

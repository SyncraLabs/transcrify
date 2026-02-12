import ytdl from '@distube/ytdl-core';

async function testYtdl(url) {
    console.log(`\n--- Testing ytdl-core (ESM) for URL: ${url} ---`);
    try {
        const info = await ytdl.getBasicInfo(url);
        console.log('Video title:', info.videoDetails.title);

        console.log('Attempting to download video + audio stream...');
        const stream = ytdl(url, {
            filter: 'videoandaudio',
            quality: 'lowest',
        });

        await new Promise((resolve, reject) => {
            stream.on('data', (chunk) => {
                console.log(`Received chunk of size: ${chunk.length}`);
                stream.destroy();
                resolve();
            });
            stream.on('error', (err) => {
                console.error('Download error:', err.message);
                reject(err);
            });
            setTimeout(() => reject(new Error('Download timeout')), 10000);
        });
        console.log('Success!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testYtdl('https://www.youtube.com/watch?v=E-LZv1FRpIk');

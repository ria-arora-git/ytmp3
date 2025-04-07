const express = require('express');
const { spawn } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());

app.get('/download', async (req, res) => {
  let url = req.query.url;

  if (!url) {
    return res.status(400).send('Missing URL');
  }

  // Convert short youtu.be links to full YouTube links
  url = url.replace('youtu.be/', 'www.youtube.com/watch?v=');

  console.log(`🔗 Download request: ${url}`);
  console.log(`🎵 Starting conversion`);

  const ytdlp = spawn('yt-dlp', [
    '-f', '140', // m4a format
    '--no-check-certificate',
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:114.0) Gecko/20100101 Firefox/114.0',
    '--referer', 'https://www.youtube.com',
    '--add-header', 'Accept-Language: en-US,en;q=0.9',
    '-o', '-', // output to stdout
    url
  ]);

  let responseSent = false;

  ytdlp.stderr.on('data', (data) => {
    const error = data.toString();
    console.error('yt-dlp error:', error);
    if (error.includes('ERROR:')) {
      if (!responseSent) {
        res.status(500).send('yt-dlp failed to download video');
        responseSent = true;
        ytdlp.kill();
      }
    }
  });

  const command = ffmpeg(ytdlp.stdout)
    .audioCodec('libmp3lame')
    .format('mp3')
    .on('error', (err) => {
      console.error('ffmpeg error:', err.message);
      if (!responseSent) {
        res.status(500).send('Conversion failed');
        responseSent = true;
      }
    })
    .on('end', () => {
      console.log('✅ Conversion finished');
      responseSent = true;
    });

  res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
  res.setHeader('Content-Type', 'audio/mpeg');

  command.pipe(res, { end: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});








// const express = require('express');
// const { spawn } = require('child_process');
// const ytdlp = require('yt-dlp-exec');
// const ffmpegPath = require('ffmpeg-static');
// const cors = require('cors');

// const app = express();
// app.use(cors());

// app.get('/download', async (req, res) => {
//   const videoUrl = req.query.url;
//   if (!videoUrl) return res.status(400).send('Missing URL');

//   try {
//     const ytdlpProcess = ytdlp.exec(videoUrl, {
//       format: 'bestaudio',
//       output: '-',
//       quiet: true,
//       stdio: ['ignore', 'pipe', 'pipe'],
//     });

//     const ffmpegProcess = spawn(ffmpegPath, [
//       '-i', 'pipe:0',
//       '-f', 'mp3',
//       '-ab', '192000',
//       '-vn',
//       'pipe:1',
//     ]);

//     res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
//     res.setHeader('Content-Type', 'audio/mpeg');

//     ytdlpProcess.stdout.pipe(ffmpegProcess.stdin);
//     ffmpegProcess.stdout.pipe(res);

//     ytdlpProcess.stderr.on('data', (data) =>
//       console.error('yt-dlp stderr:', data.toString())
//     );
//     ffmpegProcess.stderr.on('data', (data) =>
//       console.error('ffmpeg stderr:', data.toString())
//     );

//     ytdlpProcess.on('exit', (code) => console.log('yt-dlp exited with', code));
//     ffmpegProcess.on('exit', (code) => console.log('ffmpeg exited with', code));
//   } catch (err) {
//     console.error('ERROR:', err);
//     if (!res.headersSent) res.status(500).send('Server Error');
//   }
// });

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`✅ Server running at http://localhost:${PORT}`);
// });

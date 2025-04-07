const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.get('/download', (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing YouTube URL');
  }

  // Clean YouTube URL: remove tracking parameters like "?si=..."
  const cleanUrl = url.split('?')[0];

  console.log('🔗 Download request:', cleanUrl);

  // yt-dlp command to get best audio format
  const ytdlp = spawn('yt-dlp', [
    '-f', 'bestaudio',
    '-o', '-', // output to stdout
    cleanUrl,
  ]);

  // ffmpeg command to convert to MP3
  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',           // input from stdin
    '-f', 'mp3',              // output format
    '-ab', '192000',          // audio bitrate
    '-vn',                   // no video
    'pipe:1'                 // output to stdout
  ]);

  // Set headers for download
  res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
  res.setHeader('Content-Type', 'audio/mpeg');

  // Pipe yt-dlp output into ffmpeg, and ffmpeg output into response
  ytdlp.stdout.pipe(ffmpeg.stdin);
  ffmpeg.stdout.pipe(res);

  // Error handling for yt-dlp
  ytdlp.stderr.on('data', (data) => {
    console.error('yt-dlp error:', data.toString());
  });

  // Error handling for ffmpeg
  ffmpeg.stderr.on('data', (data) => {
    console.error('ffmpeg error:', data.toString());
  });

  // yt-dlp exit
  ytdlp.on('exit', (code) => {
    if (code !== 0) {
      console.error(`yt-dlp exited with code ${code}`);
    }
  });

  // ffmpeg exit
  ffmpeg.on('exit', (code) => {
    if (code !== 0) {
      console.error(`ffmpeg exited with code ${code}`);
      res.status(500).send('ffmpeg error');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
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

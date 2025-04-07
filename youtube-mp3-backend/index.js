const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('Missing YouTube URL');

  console.log('🔗 Download request:', videoUrl);

  try {
    const ytdlp = spawn('yt-dlp', [
      '-f', 'bestaudio',
      '-g', videoUrl,
    ]);

    let audioUrl = '';
    for await (const chunk of ytdlp.stdout) {
      audioUrl += chunk.toString();
    }

    ytdlp.stderr.on('data', (data) => {
      console.error('yt-dlp error:', data.toString());
    });

    ytdlp.on('close', (code) => {
      if (code !== 0) {
        console.error(`yt-dlp exited with code ${code}`);
        return res.status(500).send('Failed to get audio URL');
      }

      audioUrl = audioUrl.trim();
      console.log('🎧 Streaming audio from:', audioUrl);

      res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
      res.setHeader('Content-Type', 'audio/mpeg');

      const ffmpeg = spawn('ffmpeg', [
        '-i', audioUrl,
        '-f', 'mp3',
        '-ab', '192000',
        '-vn',
        'pipe:1',
      ]);

      ffmpeg.stdout.pipe(res);

      ffmpeg.stderr.on('data', (data) => {
        console.error('ffmpeg error:', data.toString());
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          console.error(`ffmpeg exited with code ${code}`);
        } else {
          console.log('✅ Stream finished');
        }
      });
    });

  } catch (err) {
    console.error('Download error:', err);
    res.status(500).send('Error occurred during download');
  }
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

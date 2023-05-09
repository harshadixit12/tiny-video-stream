const express = require('express');
const fs = require('fs');
const videoList = require('./video-list');

const app = express();

app.get('/', (req, res) => {
  res.json(videoList);
});

app.get('videos/:id/metadata', (req,res)=> {
  const id = parseInt(req.params.id, 10)
  res.json(videoList[id])
});

app.get('/videos/:id/', (req,res)=> {
  const id = parseInt(req.params.id, 10);
  const videoPath = `./assets/${videoList[id-1].path}`;
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;

  const videoRange = req.headers.range;

  if (videoRange) {
    const parts = videoRange.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
    const chunksize = (end-start) + 1;

    const file = fs.createReadStream(videoPath, {start, end});

    const header = {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': 'video/mp4',
    };

    res.writeHead(206, header);

    console.log(header, '\n\n', res);

    file.pipe(res);
  }
  else {
    const header = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
      
    console.log(header, '\n\n', res);
    res.writeHead(200, header);
    
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.listen(8000, function(){
  console.log("info",'Server is running at port : ' + 8000);
});
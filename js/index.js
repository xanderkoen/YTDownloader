const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();

const port = 8000

app.use(cors())


app.listen(port, () => {
    console.log(`Server is running on port ${port} at http://localhost:${port}`);
});

//validate route
app.get('/validate', (req, res) => {
    const link = req.query.URL

    if(ytdl.validateURL(link) === true) {
        console.log("link valid");
        res.status(200).send("Geldige YouTube-link.");
    }else{
        console.log("link not valid");
        res.status(400).send("Ongeldige YouTube-link.");
    }
})

app.get('/info', async (req, res) => {
    let link = req.query.URL

    try {
        const info = await ytdl.getInfo(link);

        res.status(200).json(info);
    } catch (error) {
        res.status(500).send(error.message)
    }
});

app.get('/audio', async (req, res) => {
    let link = req.query.URL

    console.log(link);

    try {
        const videoInfo = await ytdl.getInfo(link);
        const audio = await ytdl.downloadFromInfo(videoInfo, { filter: 'audioonly', quality: 'highestaudio' });
        const fileName = `${videoInfo.videoDetails.title}.mp3`;

        res.set('Content-Disposition', `attachment; filename="${fileName}"`);

        audio.pipe(res);
    } catch (error) {
        console.log("An error occured while downloading the Audio : ", error);
        res.status(500).send("An error occured while downloading the Audio : " + error.message)
    }
})

app.get('/video', async (req, res) => {
    let link = req.query.URL


    console.log("link : " + link);

    try {

        const videoInfo = await ytdl.getInfo(link);

        // Haal de stream op voor het gekozen formaat
        const video = ytdl.downloadFromInfo(videoInfo, { filter: "videoandaudio",});
        const fileName = `${videoInfo.videoDetails.title}.mp4`;

        res.set('Content-Disposition', `attachment; filename="${fileName}"`);

        video.pipe(res);
    } catch (error) {
        console.log("An error occured while processing the video : ", error);
        res.status(500).send("An error occured while processing the video : " + error.message)
    }
})


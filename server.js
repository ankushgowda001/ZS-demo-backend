const express = require('express');
const cors = require('cors');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

app.post('/ask', async (req, res) => {
    const { question } = req.body;
    try {
        const response = await axios.post('https://zs-demo-faiss-service.onrender.com/search', { query: question });
        const context = response.data.context.join('\n');
        console.log({ context });
        res.json({ answer: context });
    } catch (error) {
        console.error('FAISS context fetch failed:', error);
        return '';
    }
});

app.post('/upload', async (req, res) => {
    try {
        const { fileName, fileType, fileContentBase64 } = req.body;

        if (!fileName || !fileType || !fileContentBase64) {
            return res.status(400).json({ error: 'Missing file data' });
        }

        const buffer = Buffer.from(fileContentBase64, 'base64');
        const key = `uploads/${Date.now()}_${fileName}`;

        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: fileType,
        };

        await s3.send(new PutObjectCommand(uploadParams));

        // Send file content to Python FAISS server
        const fileText = buffer.toString('utf-8');

        const ingestRes = await axios.post('https://zs-demo-faiss-service.onrender.com/ingest', {
            text: fileText
        });

        console.log({ firsttttt: ingestRes.data });

        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

        res.json({
            message: 'Uploaded and ingested successfully',
            url: fileUrl,
            faissResult: ingestRes.data
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload or FAISS ingestion failed' });
    }
});

app.listen(3002, () => {
    console.log('Server is running on http://localhost:3002');
});

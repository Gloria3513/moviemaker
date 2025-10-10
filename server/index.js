const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, '../uploads');
const outputDir = path.join(__dirname, '../output');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wmv/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images and Videos Only!');
        }
    },
    limits: { fileSize: 100 * 1024 * 1024 }
});

app.get('/', (req, res) => {
    res.json({ message: 'Movie Maker API Server' });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        res.json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                path: req.file.path
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

app.get('/api/files', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);
        const fileList = files.map(filename => {
            const filePath = path.join(uploadDir, filename);
            const stats = fs.statSync(filePath);
            return {
                filename,
                size: stats.size,
                uploadedAt: stats.ctime
            };
        });
        res.json(fileList);
    } catch (error) {
        console.error('Error reading files:', error);
        res.status(500).json({ error: 'Failed to read files' });
    }
});

app.delete('/api/files/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ message: 'File deleted successfully' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

app.use('/uploads', express.static(uploadDir));
app.use('/output', express.static(outputDir));

// 영상 편집 API들

// 영상 정보 가져오기
app.get('/api/video/info/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                console.error('Error getting video info:', err);
                return res.status(500).json({ error: 'Failed to get video information' });
            }

            const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
            const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');

            const info = {
                duration: metadata.format.duration,
                size: metadata.format.size,
                bitRate: metadata.format.bit_rate,
                format: metadata.format.format_name,
                video: videoStream ? {
                    codec: videoStream.codec_name,
                    width: videoStream.width,
                    height: videoStream.height,
                    frameRate: eval(videoStream.r_frame_rate),
                    pixelFormat: videoStream.pix_fmt
                } : null,
                audio: audioStream ? {
                    codec: audioStream.codec_name,
                    sampleRate: audioStream.sample_rate,
                    channels: audioStream.channels
                } : null
            };

            res.json(info);
        });
    } catch (error) {
        console.error('Error processing video info request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 영상 자르기 (트림)
app.post('/api/video/trim', (req, res) => {
    try {
        const { filename, startTime, endTime } = req.body;
        
        if (!filename || startTime === undefined || endTime === undefined) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const inputPath = path.join(uploadDir, filename);
        const outputFilename = `trimmed-${Date.now()}-${filename}`;
        const outputPath = path.join(outputDir, outputFilename);

        if (!fs.existsSync(inputPath)) {
            return res.status(404).json({ error: 'Input file not found' });
        }

        ffmpeg(inputPath)
            .seekInput(startTime)
            .duration(endTime - startTime)
            .output(outputPath)
            .on('end', () => {
                res.json({
                    message: 'Video trimmed successfully',
                    outputFile: outputFilename,
                    outputPath: `/output/${outputFilename}`
                });
            })
            .on('error', (err) => {
                console.error('Error trimming video:', err);
                res.status(500).json({ error: 'Failed to trim video' });
            })
            .run();
    } catch (error) {
        console.error('Error processing trim request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 영상 합치기
app.post('/api/video/concat', (req, res) => {
    try {
        const { filenames } = req.body;
        
        if (!filenames || !Array.isArray(filenames) || filenames.length < 2) {
            return res.status(400).json({ error: 'At least 2 files are required' });
        }

        const outputFilename = `concat-${Date.now()}.mp4`;
        const outputPath = path.join(outputDir, outputFilename);
        
        // 모든 입력 파일이 존재하는지 확인
        for (const filename of filenames) {
            const inputPath = path.join(uploadDir, filename);
            if (!fs.existsSync(inputPath)) {
                return res.status(404).json({ error: `File not found: ${filename}` });
            }
        }

        const command = ffmpeg();
        
        // 모든 입력 파일 추가
        filenames.forEach(filename => {
            const inputPath = path.join(uploadDir, filename);
            command.input(inputPath);
        });

        command
            .on('end', () => {
                res.json({
                    message: 'Videos concatenated successfully',
                    outputFile: outputFilename,
                    outputPath: `/output/${outputFilename}`
                });
            })
            .on('error', (err) => {
                console.error('Error concatenating videos:', err);
                res.status(500).json({ error: 'Failed to concatenate videos' });
            })
            .mergeToFile(outputPath);
    } catch (error) {
        console.error('Error processing concat request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 포맷 변환
app.post('/api/video/convert', (req, res) => {
    try {
        const { filename, format, quality } = req.body;
        
        if (!filename || !format) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const inputPath = path.join(uploadDir, filename);
        const outputFilename = `converted-${Date.now()}.${format}`;
        const outputPath = path.join(outputDir, outputFilename);

        if (!fs.existsSync(inputPath)) {
            return res.status(404).json({ error: 'Input file not found' });
        }

        const command = ffmpeg(inputPath)
            .output(outputPath)
            .format(format);

        // 품질 설정
        if (quality) {
            switch (quality) {
                case 'high':
                    command.videoBitrate('2000k').audioBitrate('128k');
                    break;
                case 'medium':
                    command.videoBitrate('1000k').audioBitrate('128k');
                    break;
                case 'low':
                    command.videoBitrate('500k').audioBitrate('64k');
                    break;
            }
        }

        command
            .on('end', () => {
                res.json({
                    message: 'Video converted successfully',
                    outputFile: outputFilename,
                    outputPath: `/output/${outputFilename}`
                });
            })
            .on('error', (err) => {
                console.error('Error converting video:', err);
                res.status(500).json({ error: 'Failed to convert video' });
            })
            .run();
    } catch (error) {
        console.error('Error processing convert request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 영상 필터 적용 (밝기, 대비 등)
app.post('/api/video/filter', (req, res) => {
    try {
        const { filename, brightness, contrast, saturation } = req.body;
        
        if (!filename) {
            return res.status(400).json({ error: 'Missing filename parameter' });
        }

        const inputPath = path.join(uploadDir, filename);
        const outputFilename = `filtered-${Date.now()}-${filename}`;
        const outputPath = path.join(outputDir, outputFilename);

        if (!fs.existsSync(inputPath)) {
            return res.status(404).json({ error: 'Input file not found' });
        }

        let filterString = '';
        const filters = [];

        if (brightness !== undefined) {
            filters.push(`brightness=${brightness}`);
        }
        if (contrast !== undefined) {
            filters.push(`contrast=${contrast}`);
        }
        if (saturation !== undefined) {
            filters.push(`saturation=${saturation}`);
        }

        if (filters.length > 0) {
            filterString = `eq=${filters.join(':')}`;
        }

        const command = ffmpeg(inputPath)
            .output(outputPath);

        if (filterString) {
            command.videoFilters(filterString);
        }

        command
            .on('end', () => {
                res.json({
                    message: 'Video filter applied successfully',
                    outputFile: outputFilename,
                    outputPath: `/output/${outputFilename}`
                });
            })
            .on('error', (err) => {
                console.error('Error applying video filter:', err);
                res.status(500).json({ error: 'Failed to apply video filter' });
            })
            .run();
    } catch (error) {
        console.error('Error processing filter request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 처리된 파일 목록 조회
app.get('/api/output', (req, res) => {
    try {
        const files = fs.readdirSync(outputDir);
        const fileList = files.map(filename => {
            const filePath = path.join(outputDir, filename);
            const stats = fs.statSync(filePath);
            return {
                filename,
                size: stats.size,
                createdAt: stats.ctime
            };
        });
        res.json(fileList);
    } catch (error) {
        console.error('Error reading output files:', error);
        res.status(500).json({ error: 'Failed to read output files' });
    }
});

// 처리된 파일 삭제
app.delete('/api/output/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(outputDir, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ message: 'File deleted successfully' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
import { Router } from 'express';
import multer from 'multer';
import pdf from 'pdf-parse';
import { parseDenialLetter, parseDenialLetterFromImage } from '../services/claudeService.js';

export const parseFileRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_, file, cb) {
    const ok = /^(image\/(jpeg|png|gif|webp)|application\/pdf)$/.test(file.mimetype);
    cb(ok ? null : new Error('Only images and PDFs are supported.'), ok);
  },
});

parseFileRouter.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  const { mimetype, buffer } = req.file;

  try {
    let result;

    if (mimetype === 'application/pdf') {
      const { text } = await pdf(buffer);
      if (!text || text.trim().length < 20)
        return res.status(422).json({ error: 'Could not extract text from PDF.' });
      result = await parseDenialLetter(text);
    } else {
      const base64 = buffer.toString('base64');
      result = await parseDenialLetterFromImage(base64, mimetype);
    }

    if (!result) return res.status(422).json({ error: 'Could not extract denial information.' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

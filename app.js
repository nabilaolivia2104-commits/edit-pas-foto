const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const archiver = require('archiver');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use('/output', express.static(path.join(__dirname, 'output')));

if (!fs.existsSync('input')) fs.mkdirSync('input');
if (!fs.existsSync('output')) fs.mkdirSync('output');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'input/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_msicode${ext}`);
  },
});

const upload = multer({ storage });

// ====================== ROUTE UPLOAD ======================
app.get('/', (req, res) => {
  const outputFiles = fs.readdirSync(path.join(__dirname, 'output'));
  const hasOutput = outputFiles.length > 0;
  res.render('upload', { hasOutput });
});

app.get('/preview', (req, res) => {
  const outputPath = path.join(__dirname, 'output');
  const files = fs.readdirSync(outputPath);

  if (files.length === 0) {
    return res.redirect('/');
  }

  res.render('preview', {
    files,
    hasOutput: true,
  });
});

app.get('/tentang', (req, res) => {
  const outputFiles = fs.readdirSync(path.join(__dirname, 'output'));
  const hasOutput = outputFiles.length > 0; // true/false
  res.render('tentang', { hasOutput });
});

app.get('/kontak', (req, res) => {
  const outputFiles = fs.readdirSync(path.join(__dirname, 'output'));
  const hasOutput = outputFiles.length > 0; // true/false
  res.render('kontak', { hasOutput });
});

app.post('/upload', upload.array('photos'), (req, res) => {
  exec('python -X utf8 CETAKFOTO.py', (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      return res.send('❌ Python gagal jalan');
    }

    // Ambil daftar file di folder output
    const files = fs.readdirSync('output');

    // Render preview
    const outputFiles = fs.readdirSync(path.join(__dirname, 'output'));
    const hasOutput = outputFiles.length > 0;
    res.render('preview', { files, hasOutput });
  });
});

// ====================== ROUTE DOWNLOAD ======================
app.get('/download', (req, res) => {
  const files = fs.readdirSync('output');

  if (files.length === 0) {
    return res.redirect('/');
  }

  if (files.length === 1) {
    // Jika hanya 1 file, langsung download
    const filePath = path.join(__dirname, 'output', files[0]);
    res.download(filePath, files[0], (err) => {
      if (!err) clearFolders(); // hapus folder setelah download berhasil
    });
  } else {
    // Jika lebih dari 1 file, buat zip
    const archiveName = 'output.zip';
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${archiveName}`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    files.forEach((file) => {
      const filePath = path.join(__dirname, 'output', file);
      archive.file(filePath, { name: file });
    });

    archive.finalize();

    // Hapus folder setelah zip selesai
    archive.on('end', () => {
      clearFolders();
    });
  }
});

// ====================== FUNCTION HAPUS FOLDER ======================
function clearFolders() {
  // Hapus semua file di input
  fs.readdirSync('input').forEach((file) => {
    fs.unlinkSync(path.join('input', file));
  });

  // Hapus semua file di output
  fs.readdirSync('output').forEach((file) => {
    fs.unlinkSync(path.join('output', file));
  });

  console.log('🗑️ Folder input & output dibersihkan!');
}

app.listen(PORT, () => {
  console.log(`🚀 Server jalan: http://localhost:${PORT}`);
});

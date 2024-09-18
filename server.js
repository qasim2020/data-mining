// server.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const dfd = require('danfojs-node');
const fs = require('fs');

const app = express();
const PORT = 2006;

// Set up storage for file uploads (Multer)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve static files (HTML, JS, CSS)
app.use(express.static('public'));

// Upload route: Process the uploaded CSV
app.post('/upload', upload.single('csvfile'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    
    // Read CSV file and preprocess it
    const df = await dfd.readCSV(filePath);
    df.dropNa({ axis: 0, inplace: true }); // Drop rows with NaN values
    df['normalized_feature'] = df['feature'].apply(val => (val - df['feature'].mean()) / df['feature'].std());

    // Save preprocessed data for use in visualization
    const outputPath = path.join(__dirname, 'uploads', 'processed_data.json');
    await df.toJSON(outputPath);

    // Redirect to the visualization page
    res.redirect('/visualization');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing the file.");
  }
});

// Visualization page: Serve the page and processed data
app.get('/visualization', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'visualization.html'));
});

app.get('/processed-data', (req, res) => {
  const outputPath = path.join(__dirname, 'uploads', 'processed_data.json');
  fs.readFile(outputPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send("Error loading processed data.");
    }
    res.json(JSON.parse(data));
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

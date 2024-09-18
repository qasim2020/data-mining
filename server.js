const express = require('express');
const multer = require('multer');
const path = require('path');
const dfd = require('danfojs-node');
const fs = require('fs').promises;
const Papa = require('papaparse');

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
    
    const csvData = await fs.readFile(filePath, 'utf-8');
    
    const parsedData = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });

    // Create DataFrame from parsed data
    const df = new dfd.DataFrame(parsedData.data);

    console.log("DataFrame columns:", df.columns);
    console.log("DataFrame shape:", df.shape);

    // Convert 'Hours_Studied' to float32
    if (df.columns.includes('Hours_Studied')) {
      df['Hours_Studied'] = df['Hours_Studied'].asType('float32');
    } else {
      throw new Error("'Hours_Studied' column not found in the CSV file");
    }

    // Manually drop rows with NaN values
    const cleanedData = df.values.filter(row => !row.includes(NaN));
    const cleanedDf = new dfd.DataFrame(cleanedData, { columns: df.columns });
    
    if (cleanedDf.shape[0] === 0) {
      throw new Error("No data left after dropping NaN values");
    }

    console.log("Cleaned DataFrame shape:", cleanedDf.shape);

    // Calculate mean, standard deviation, and variance
    const mean = cleanedDf['Hours_Studied'].mean();
    const std = cleanedDf['Hours_Studied'].std();
    const variance = Math.pow(std, 2);

    console.log('Mean:', mean);
    console.log('Standard Deviation:', std);
    console.log('Variance:', variance);

    // Normalize 'Hours_Studied' column
    const normalizedSeries = cleanedDf['Hours_Studied'].sub(mean).div(std);

    // Add the normalized column to the DataFrame
    cleanedDf.addColumn('normalized_Hours_Studied', normalizedSeries.values, {inplace: true});

    // Convert DataFrame to JSON
    const jsonData = cleanedDf.toJSON();

    // Save preprocessed data
    const outputPath = path.join(__dirname, 'uploads', 'processed_data.json');
    await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2));

    // Redirect to the visualization page
    res.redirect('/visualization');
  } catch (error) {
    console.error("Error processing the file:", error);
    res.status(500).send("Error processing the file: " + error.message);
  }
});

// Visualization page: Serve the page and processed data
app.get('/visualization', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'visualization.html'));
});

app.get('/processed-data', async (req, res) => {
  const outputPath = path.join(__dirname, 'uploads', 'processed_data.json');
  const data = await fs.readFile(outputPath, 'utf8');
  res.status(200).send(data);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

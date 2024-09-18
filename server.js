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
    
    // Read the CSV file as a string
    const csvData = await fs.readFile(filePath, 'utf-8');
    
    const parsedData = Papa.parse(csvData, {
      header: true,  // Parse the first row as headers
      skipEmptyLines: true
    });

    // Ensure the parsed data is an array before creating DataFrame
    const df = new dfd.DataFrame(parsedData.data);

    // Convert 'Hours_Studied' to numeric values
    df['Hours_Studied'] = df['Hours_Studied'].apply(val => parseFloat(val));

    // Drop rows with NaN values
    df.dropna({ axis: 0, inplace: true });

    // Calculate mean, variance, and standard deviation
    const mean = df['Hours_Studied'].mean();
    const variance = df['Hours_Studied'].apply(val => Math.pow(val - mean, 2)).mean();
    const std = Math.sqrt(variance);

    console.log('Mean:', mean);
    console.log('Standard Deviation:', std);
    console.log('Variance:', variance);

    // Normalize 'Hours_Studied' column
    const normalizedValues = df['Hours_Studied'].values.map(val => {
      if (isNaN(mean) || isNaN(std) || std === 0) {
        return NaN;  // Handle cases where std is zero or mean/std is NaN
      }
      return (val - mean) / std;
    });

    if (normalizedValues.some(isNaN)) {
      throw new Error("Normalized values contain NaN.");
    }

    // Create a new Series for the normalized values
    const normalizedSeries = new dfd.Series(normalizedValues, { name: 'normalized_Hours_Studied' });

    // Add the normalized column to the DataFrame
    df.addColumn('normalized_Hours_Studied', normalizedSeries);
    // df['normalized_Hours_Studied'] = normalizedSeries;

    // console.log(df['normalized_Hours_Studied']);

    // Manually construct JSON data
    const columns = df.columns;
    const data = df.values;

    const jsonData = data.map(row => {
      let obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });

    // Save preprocessed data for use in visualization
    const outputPath = path.join(__dirname, 'uploads', 'processed_data.json');
    await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2));


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

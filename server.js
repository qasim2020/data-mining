// server.js

const express = require('express');
const dfd = require('danfojs-node');

const app = express();
const PORT = 2006;

// Serve static files for frontend (e.g., HTML, CSS, JS)
app.use(express.static('public'));

// Data preprocessing route
app.get('/preprocess', async (req, res) => {
  // Example: Read CSV and preprocess it
  const df = await dfd.readCSV('path/to/your/data.csv');

  // Example: Drop NaN values and normalize
  df.dropNa({ axis: 0, inplace: true });
  df['normalized_feature'] = df['feature'].apply(val => (val - df['feature'].mean()) / df['feature'].std());

  // Return processed data to frontend
  res.json(df.values);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

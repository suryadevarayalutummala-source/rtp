import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure directories exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicPredictionsDir = path.join(rootDir, 'public', 'predictions');
const pdfDir = path.join(publicPredictionsDir, 'pdf');
const dataDir = path.join(rootDir, 'server', 'data');
const historyFile = path.join(dataDir, 'prediction_history.json');

if (!fs.existsSync(publicPredictionsDir)) {
  fs.mkdirSync(publicPredictionsDir, { recursive: true });
}
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(historyFile)) {
  fs.writeFileSync(historyFile, JSON.stringify([]));
}

// Helper to load/save history
const loadHistory = (): any[] => {
  try {
    return JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
  } catch {
    return [];
  }
};

const saveHistory = (history: any[]) => {
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
};

app.post('/api/predict', (req, res) => {
  const { ticker, modelType } = req.body;

  if (!ticker || !modelType) {
    return res.status(400).json({ error: 'Ticker and modelType are required' });
  }

  let scriptPath = '';
  let outputFilename = `${ticker.replace('.', '_')}_${modelType}_${Date.now()}.png`;
  let outputPath = path.join(publicPredictionsDir, outputFilename);

  switch (modelType) {
    case 'baseline':
      scriptPath = path.join(rootDir, 'model', 'BL.PY');
      break;
    case 'lstm_price':
      scriptPath = path.join(rootDir, 'model', 'lstm_price.py');
      break;
    case 'lstm_sentiment':
      scriptPath = path.join(rootDir, 'model', 'lstm_sentiment.py');
      break;
    default:
      return res.status(400).json({ error: 'Invalid model type' });
  }

  console.log(`Running model: ${modelType} for ${ticker}`);

  const pythonProcess = spawn('python', [
    scriptPath,
    '--ticker', ticker,
    '--output', outputPath
  ]);

  let stdoutData = '';
  let stderrData = '';

  pythonProcess.stdout.on('data', (data) => {
    stdoutData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    stderrData += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python script error: ${stderrData}`);
      return res.status(500).json({ error: 'Model execution failed', details: stderrData });
    }

    try {
      // Find the last line of stdout which should be our JSON result
      const lines = stdoutData.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const result = JSON.parse(lastLine);

      // Add the public URL for the image
      result.imageUrl = `/predictions/${outputFilename}`;

      // Generate PDF filename
      const pdfFilename = `${ticker.replace('.', '_')}_${modelType}_${Date.now()}.pdf`;
      const pdfPath = path.join(pdfDir, pdfFilename);

      // Spawn PDF generation process
      const pdfScriptPath = path.join(rootDir, 'model', 'generate_pdf.py');
      const pdfProcess = spawn('python', [
        pdfScriptPath,
        '--ticker', ticker,
        '--model', modelType,
        '--mape', String(result.mape),
        '--image', result.output_path,
        '--output', pdfPath,
        '--future', JSON.stringify(result.future_predictions || []),
        '--dates', JSON.stringify(result.future_dates || []),
        '--confidence-upper', JSON.stringify(result.confidence_upper || []),
        '--confidence-lower', JSON.stringify(result.confidence_lower || []),
      ]);

      pdfProcess.on('close', (pdfCode) => {
        if (pdfCode !== 0) {
          console.error('PDF generation failed:', stderrData);
        }

        // Save to history
        const history = loadHistory();
        const predictionRecord = {
          id: `${Date.now()}`,
          ticker,
          modelType,
          mape: result.mape,
          imageUrl: result.imageUrl,
          pdfUrl: `/predictions/pdf/${pdfFilename}`,
          pdfPath,
          timestamp: new Date().toISOString(),
          futurePredictions: result.future_predictions || [],
          futureDates: result.future_dates || [],
          confidenceUpper: result.confidence_upper || [],
          confidenceLower: result.confidence_lower || [],
          trainingDays: result.training_days || 0,
          testSamples: result.test_samples || 0,
          featuresUsed: result.features_used || 0,
        };

        history.unshift(predictionRecord); // Add to beginning
        saveHistory(history.slice(0, 100)); // Keep last 100 predictions

        // Return result with future predictions
        res.json({
          ticker: result.ticker,
          mape: result.mape,
          imageUrl: result.imageUrl,
          futurePredictions: result.future_predictions || [],
          futureDates: result.future_dates || [],
          confidenceUpper: result.confidence_upper || [],
          confidenceLower: result.confidence_lower || [],
          pdfUrl: `/predictions/pdf/${pdfFilename}`,
        });
      });
    } catch (e) {
      console.error('Failed to parse model output:', stdoutData);
      res.status(500).json({ error: 'Failed to parse model output', raw: stdoutData });
    }
  });
});

// Get prediction history
app.get('/api/predictions/history', (req, res) => {
  const history = loadHistory();
  res.json(history);
});

// Download PDF
app.get('/api/predictions/:id/pdf', (req, res) => {
  const history = loadHistory();
  const record = history.find(h => h.id === req.params.id);

  if (!record || !record.pdfPath) {
    return res.status(404).json({ error: 'PDF not found' });
  }

  if (!fs.existsSync(record.pdfPath)) {
    return res.status(404).json({ error: 'PDF file not found on disk' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${path.basename(record.pdfPath)}"`);
  res.sendFile(record.pdfPath);
});

// Delete prediction from history
app.delete('/api/predictions/:id', (req, res) => {
  let history = loadHistory();
  const record = history.find(h => h.id === req.params.id);

  if (!record) {
    return res.status(404).json({ error: 'Prediction not found' });
  }

  // Optionally delete files
  if (record.pdfPath && fs.existsSync(record.pdfPath)) {
    fs.unlinkSync(record.pdfPath);
  }

  history = history.filter(h => h.id !== req.params.id);
  saveHistory(history);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Prediction Server running on port ${PORT}`);
});

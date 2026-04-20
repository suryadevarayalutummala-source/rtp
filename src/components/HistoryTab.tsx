import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, Trash2, TrendingUp, Clock, FileText, AlertCircle } from 'lucide-react';

interface PredictionRecord {
  id: string;
  ticker: string;
  modelType: string;
  mape: number;
  imageUrl: string;
  pdfUrl: string;
  timestamp: string;
  futurePredictions: number[];
}

export const HistoryTab: React.FC = () => {
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<PredictionRecord | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/predictions/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const downloadPdf = async (id: string, filename: string) => {
    try {
      const res = await fetch(`/api/predictions/${id}/pdf`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Delete this prediction?')) return;
    try {
      await fetch(`/api/predictions/${id}`, { method: 'DELETE' });
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const getModelName = (type: string) => {
    return {
      baseline: 'Ridge Regression',
      lstm_price: 'LSTM Quantitative',
      lstm_sentiment: 'LSTM Sentiment+'
    }[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant text-sm">Loading prediction history...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-surface-low rounded-2xl border border-outline-variant/10">
        <FileText className="text-on-surface-variant/30 mb-4" size={48} />
        <h3 className="text-xl font-headline font-bold text-on-surface mb-2">No Predictions Yet</h3>
        <p className="text-on-surface-variant text-sm">Run your first prediction to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-on-surface">Prediction History</h1>
          <p className="text-on-surface-variant text-xs uppercase tracking-widest mt-1">{history.length} records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((record) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-low rounded-2xl border border-outline-variant/10 overflow-hidden hover:border-primary/30 transition-all"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">{record.ticker.split('.')[0]}</h3>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{getModelName(record.modelType)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${record.mape < 3 ? 'bg-secondary/20 text-secondary' : record.mape < 5 ? 'bg-primary/20 text-primary' : 'bg-tertiary/20 text-tertiary'}`}>
                  MAPE: {record.mape}%
                </div>
              </div>

              <img src={record.imageUrl} alt="Prediction" className="w-full h-32 object-cover rounded-xl mb-4 bg-surface-container" />

              <div className="flex items-center gap-2 text-[10px] text-on-surface-variant mb-4">
                <Clock size={12} />
                {new Date(record.timestamp).toLocaleString()}
              </div>

              {record.futurePredictions && record.futurePredictions.length > 0 && (
                <div className="mb-4 p-3 bg-surface-container rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={12} className="text-primary" />
                    <span className="text-[9px] text-on-surface-variant uppercase font-bold">5-Day Forecast</span>
                  </div>
                  <div className="flex justify-between">
                    {record.futurePredictions.slice(0, 5).map((price, i) => (
                      <div key={i} className="text-center">
                        <div className="text-[8px] text-on-surface-variant/60">D{i + 1}</div>
                        <div className="text-[9px] font-bold text-primary">₹{price.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => downloadPdf(record.id, `${record.ticker}_${record.modelType}_report.pdf`)}
                  className="flex-1 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/20 transition-all"
                >
                  <Download size={14} />
                  PDF Report
                </button>
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="px-3 py-2 bg-surface-container text-on-surface rounded-xl text-xs font-bold hover:bg-surface-highest transition-all"
                >
                  View
                </button>
                <button
                  onClick={() => deleteRecord(record.id)}
                  className="px-3 py-2 bg-tertiary/10 text-tertiary rounded-xl text-xs font-bold hover:bg-tertiary/20 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRecord(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface-low rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-headline font-bold text-on-surface">{selectedRecord.ticker.split('.')[0]}</h2>
                <p className="text-on-surface-variant text-xs">{getModelName(selectedRecord.modelType)}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-on-surface-variant hover:text-on-surface text-2xl">×</button>
            </div>

            <img src={selectedRecord.imageUrl} alt="Prediction" className="w-full rounded-2xl mb-6" />

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-surface-container rounded-xl">
                <div className="text-[10px] text-on-surface-variant uppercase mb-1">MAPE</div>
                <div className={`text-2xl font-bold ${selectedRecord.mape < 3 ? 'text-secondary' : 'text-primary'}`}>{selectedRecord.mape}%</div>
              </div>
              <div className="p-4 bg-surface-container rounded-xl">
                <div className="text-[10px] text-on-surface-variant uppercase mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-primary">{(100 - selectedRecord.mape).toFixed(1)}%</div>
              </div>
            </div>

            {selectedRecord.futurePredictions && selectedRecord.futurePredictions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-headline font-bold text-on-surface mb-3">Future Predictions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {selectedRecord.futurePredictions.map((price, i) => (
                    <div key={i} className="p-3 bg-surface-container rounded-xl text-center">
                      <div className="text-[8px] text-on-surface-variant uppercase">Day {i + 1}</div>
                      <div className="text-sm font-bold text-primary">₹{price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => downloadPdf(selectedRecord.id, `${selectedRecord.ticker}_${selectedRecord.modelType}_report.pdf`)}
                className="flex-1 py-3 bg-primary text-on-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download PDF Report
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

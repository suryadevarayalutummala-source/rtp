import yfinance as yf
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_percentage_error
import matplotlib.pyplot as plt
import argparse
import json
import sys
import os

class StockLSTMSentiment(nn.Module):
    def __init__(self, input_size=2, hidden_size=128, num_layers=2):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.3
        )
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Linear(64, 1)
        )

    def forward(self, x):
        out, _ = self.lstm(x)
        out = out[:, -1, :]
        out = self.fc(out)
        return out

def run_lstm_sentiment(ticker='SBIN.NS', output_path='lstm_sentiment_result.png', start_date='2020-01-01', end_date='2026-01-01'):
    try:
        df = yf.download(ticker, start='2020-01-01', end=end_date)
        if df.empty:
            print(json.dumps({"error": f"No data found for {ticker}"}))
            return

        # Real-world Sentiment Proxy: Market Volatility (Price Momentum)
        df['Volatility'] = df['Close'].rolling(window=5).std()
        df.dropna(inplace=True)

        price_scaler = MinMaxScaler()
        vol_scaler = MinMaxScaler()

        prices_scaled = price_scaler.fit_transform(df[['Close']])
        vol_scaled = vol_scaler.fit_transform(df[['Volatility']])

        combined = np.hstack([prices_scaled, vol_scaled])

        def create_sequences(data, targets, window=30):
            X, y = [], []
            for i in range(len(data) - window):
                X.append(data[i : i + window])
                y.append(targets[i + window])
            return np.array(X), np.array(y)

        X, y = create_sequences(combined, prices_scaled, window=30)
        split = int(0.85 * len(X))
        X_train, X_test = X[:split], X[split:]
        y_train, y_test = y[:split], y[split:]

        X_train_t = torch.tensor(X_train, dtype=torch.float32)
        X_test_t = torch.tensor(X_test, dtype=torch.float32)
        y_train_t = torch.tensor(y_train, dtype=torch.float32)
        y_test_t = torch.tensor(y_test, dtype=torch.float32)

        model = StockLSTMSentiment(input_size=2)
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        loss_fn = nn.HuberLoss()
        epochs = 100

        for epoch in range(epochs):
            model.train()
            optimizer.zero_grad()
            predictions = model(X_train_t)
            loss = loss_fn(predictions, y_train_t)
            loss.backward()
            optimizer.step()

        model.eval()
        with torch.no_grad():
            preds_scaled = model(X_test_t).numpy()

        actual = df['Close'].values[split+30:].reshape(-1, 1)
        predicted = price_scaler.inverse_transform(preds_scaled)
        
        # Alignment check
        min_len = min(len(actual), len(predicted))
        actual = actual[:min_len]
        predicted = predicted[:min_len]

        mape = mean_absolute_percentage_error(actual, predicted) * 100

        # Aesthetic Styling
        plt.style.use('dark_background')
        fig, ax = plt.subplots(figsize=(12, 6))
        fig.patch.set_facecolor('#131313')
        ax.set_facecolor('#131313')
        
        ax.plot(actual, label='Actual Price', color='#88d982', linewidth=2.5, alpha=0.9)
        ax.plot(predicted, label='Volatility-Aware LSTM', color='#bdc2ff', linestyle='-', linewidth=2)
        
        ax.set_title(f'{ticker} - Risk-Adjusted Sentiment Forecast', fontsize=16, fontweight='bold', pad=20, color='#FFFFFF')
        ax.set_xlabel('Trading Days (Test Set)', fontsize=12, color='#A0A0A0')
        ax.set_ylabel('Price (INR)', fontsize=12, color='#A0A0A0')
        
        ax.grid(True, linestyle=':', alpha=0.15, color='#FFFFFF')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        
        legend = ax.legend(frameon=True, facecolor='#1A1A1A', edgecolor='#333333', fontsize=10)
        for text in legend.get_texts():
            text.set_color('#FFFFFF')

        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches='tight')
        plt.close()

        print(json.dumps({
            "ticker": ticker,
            "mape": round(float(mape), 2),
            "output_path": output_path
        }))

    except Exception as e:
        import traceback
        print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--ticker', type=str, default='SBIN.NS')
    parser.add_argument('--output', type=str, default='lstm_sentiment_result.png')
    parser.add_argument('--start', type=str, default='2022-01-01')
    parser.add_argument('--end', type=str, default='2026-01-01')
    args = parser.parse_args()

    run_lstm_sentiment(args.ticker, args.output, args.start, args.end)
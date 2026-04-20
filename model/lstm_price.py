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
from datetime import datetime, timedelta

class LSTM_price(nn.Module):
    def __init__(self, input_size=8, hidden_size=256, nlayer=3, dropout=0.2):
        super().__init__()
        self.lstm = nn.LSTM(input_size=input_size, hidden_size=hidden_size, num_layers=nlayer, batch_first=True, dropout=dropout)
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1)
        )

    def forward(self, x):
        out, _ = self.lstm(x)
        out = out[:, -1, :]
        out = self.fc(out)
        return out

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_macd(series, fast=12, slow=26, signal=9):
    exp1 = series.ewm(span=fast, adjust=False).mean()
    exp2 = series.ewm(span=slow, adjust=False).mean()
    macd = exp1 - exp2
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    macd_hist = macd - signal_line
    return macd, signal_line, macd_hist

def calculate_bollinger_bands(series, window=20, num_std=2):
    sma = series.rolling(window=window).mean()
    std = series.rolling(window=window).std()
    upper = sma + (std * num_std)
    lower = sma - (std * num_std)
    return upper, lower

def calculate_ema(series, period):
    return series.ewm(span=period, adjust=False).mean()

def run_lstm_price(ticker='SBIN.NS', output_path='lstm_price_result.png', start_date='2020-01-01', end_date='2026-01-01', predict_days=15):
    try:
        # Use a balanced history (2020+) to keep calculation fast but accurate
        df = yf.download(ticker, start='2020-01-01', end=end_date)
        if df.empty:
            print(json.dumps({"error": f"No data found for {ticker}"}))
            return

        # Feature Engineering - Enhanced with user-requested indicators
        df['RSI'] = calculate_rsi(df['Close'])
        df['SMA20'] = df['Close'].rolling(window=20).mean()
        df['SMA50'] = df['Close'].rolling(window=50).mean()
        df['EMA12'] = calculate_ema(df['Close'], 12)
        df['EMA26'] = calculate_ema(df['Close'], 26)

        # MACD
        macd, signal, macd_hist = calculate_macd(df['Close'])
        df['MACD'] = macd
        df['MACD_Signal'] = signal
        df['MACD_Hist'] = macd_hist

        # Bollinger Bands
        bb_upper, bb_lower = calculate_bollinger_bands(df['Close'])
        df['BB_Upper'] = bb_upper
        df['BB_Lower'] = bb_lower
        df['BB_Width'] = (bb_upper - bb_lower) / df['Close']

        # Volatility
        df['Volatility'] = df['Close'].pct_change().rolling(window=20).std()
        df['Volume_SMA'] = df['Volume'].rolling(window=20).mean()

        df.dropna(inplace=True)

        # Quantitative selection
        features = ['Close', 'RSI', 'MACD', 'BB_Width', 'Volatility', 'EMA12', 'EMA26', 'Volume_SMA']
        data = df[features].values

        scaler = MinMaxScaler()
        data_scaled = scaler.fit_transform(data)
        target_scaled = data_scaled[:, 0].reshape(-1, 1)

        window = 60 # Set to 60 for faster inference while maintaining context
        def create_sequences(data, targets, window=60):
            X, y = [], []
            for i in range(len(data) - window):
                X.append(data[i : i + window])
                y.append(targets[i + window])
            return np.array(X), np.array(y)

        X, y = create_sequences(data_scaled, target_scaled, window=window)

        # Train/Test Split
        split = int(0.85 * len(X))
        X_train, X_test = X[:split], X[split:]
        y_train, y_test = y[:split], y[split:]

        X_train_t = torch.tensor(X_train, dtype=torch.float32)
        X_test_t = torch.tensor(X_test, dtype=torch.float32)
        y_train_t = torch.tensor(y_train, dtype=torch.float32)
        y_test_t = torch.tensor(y_test, dtype=torch.float32)

        # Balanced architecture for web inference speed
        model = LSTM_price(input_size=len(features), hidden_size=128, nlayer=2, dropout=0.2)
        optimizer = torch.optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)
        loss_fn = nn.HuberLoss()

        epochs = 60 # Optimized for responsiveness (prevent server timeouts)
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

        # Inverse scaling logic
        test_start_idx = split + window
        actual = df['Close'].values[test_start_idx:].reshape(-1, 1)

        dummy = np.zeros((len(preds_scaled), len(features)))
        dummy[:, 0] = preds_scaled.flatten()
        predicted = scaler.inverse_transform(dummy)[:, 0].reshape(-1, 1)
        
        min_len = min(len(actual), len(predicted))
        actual = actual[:min_len]
        predicted = predicted[:min_len]

        mape = mean_absolute_percentage_error(actual, predicted) * 100

        # ============ RECURSIVE FUTURE PROJECTION ============
        future_predictions = []
        future_dates = []
        last_date = pd.to_datetime(df.index[-1])

        last_window = data_scaled[-window:].copy()
        last_window_tensor = torch.tensor(last_window[np.newaxis, :, :], dtype=torch.float32)

        with torch.no_grad():
            for i in range(predict_days):
                pred_scaled = model(last_window_tensor).numpy()[0, 0]
                
                dummy_future = np.zeros((1, len(features)))
                dummy_future[0, 0] = pred_scaled
                pred_price = scaler.inverse_transform(dummy_future)[0, 0]

                future_predictions.append(float(pred_price))
                future_dates.append((last_date + timedelta(days=i+1)).strftime('%Y-%m-%d'))

                new_row = last_window[-1].copy()
                new_row[0] = pred_scaled
                last_window = np.vstack([last_window[1:], new_row])
                last_window_tensor = torch.tensor(last_window[np.newaxis, :, :], dtype=torch.float32)

        recent_volatility = df['Close'].pct_change().std()
        confidence_upper = [p * (1 + (recent_volatility * (i+1)**0.5)) for i, p in enumerate(future_predictions)]
        confidence_lower = [p * (1 - (recent_volatility * (i+1)**0.5)) for i, p in enumerate(future_predictions)]

        # Aesthetic Visualization
        plt.style.use('dark_background')
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), gridspec_kw={'height_ratios': [2, 1]})
        fig.patch.set_facecolor('#131313')
        ax1.set_facecolor('#131313')
        ax2.set_facecolor('#131313')

        ax1.plot(actual, label='Actual Price', color='#88d982', linewidth=2.5, alpha=0.9)
        ax1.plot(predicted, label='LSTM Backtest', color='#bdc2ff', linestyle='-', linewidth=2)

        hist_len = len(actual)
        future_x = range(hist_len, hist_len + len(future_predictions))
        ax1.plot(future_x, future_predictions, label='Recursive Projection', color='#ffab40', linestyle='--', linewidth=2.5)

        ax1.fill_between(future_x, confidence_lower, confidence_upper, alpha=0.15, color='#ffab40', label='Projected Volatility')

        ax1.set_title(f'{ticker} - Sovereignty Advanced Neural Forecast', fontsize=16, fontweight='bold', pad=20, color='#FFFFFF')
        ax1.set_ylabel('Institutional Value (INR)', fontsize=12, color='#A0A0A0')
        ax1.grid(True, linestyle=':', alpha=0.1, color='#FFFFFF')
        ax1.legend(frameon=True, facecolor='#1A1A1A', edgecolor='#333333', fontsize=10)

        error = (predicted.flatten() - actual.flatten()) / actual.flatten() * 100
        ax2.bar(range(len(error[-30:])), error[-30:], color='#bdc2ff', alpha=0.5, label='Residual Error %')
        ax2.set_title('Inference Residuals (Last 30 Days)', fontsize=12, color='#A0A0A0')
        ax2.grid(True, linestyle=':', alpha=0.1, color='#FFFFFF')
        ax2.legend(frameon=True, facecolor='#1A1A1A', edgecolor='#333333', fontsize=9)

        plt.tight_layout()
        plt.savefig(output_path, dpi=130, bbox_inches='tight')
        plt.close()

        print(json.dumps({
            "ticker": ticker,
            "mape": round(float(mape), 2),
            "output_path": output_path,
            "future_predictions": future_predictions
        }))

    except Exception as e:
        import traceback
        print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--ticker', type=str, default='SBIN.NS')
    parser.add_argument('--output', type=str, default='lstm_price_result.png')
    parser.add_argument('--start', type=str, default='2019-01-01')
    parser.add_argument('--end', type=str, default='2026-01-01')
    parser.add_argument('--predict-days', type=int, default=20)
    args = parser.parse_args()

    run_lstm_price(args.ticker, args.output, args.start, args.end, args.predict_days)
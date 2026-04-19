import yfinance as yf
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_percentage_error
import matplotlib.pyplot as plt

# Download price data
df = yf.download('AAPL', start='2022-01-01', end='2024-01-01')
df = df[['Close']].copy()

# ── Simulated sentiment (replace this with Person A's column later) ──
# When Person A gives you the CSV, do this instead:
# df = pd.read_csv('data/aapl_merged.csv', parse_dates=['Date'], index_col='Date')
# df = df[['Close_Price', 'Daily_Sentiment']].rename(columns={'Close_Price':'Close', 'Daily_Sentiment':'Sentiment'})
np.random.seed(42)
df['Sentiment'] = np.random.uniform(-1, 1, len(df))

print(df.head())
print(f"Shape: {df.shape}")  # (rows, 2) — price + sentiment
price_scaler     = MinMaxScaler()
sentiment_scaler = MinMaxScaler()

prices_scaled    = price_scaler.fit_transform(df[['Close']])
sentiment_scaled = sentiment_scaler.fit_transform(df[['Sentiment']])

# Stack into one array: shape (rows, 2)
combined = np.hstack([prices_scaled, sentiment_scaled])
print(f"Combined shape: {combined.shape}")  # e.g. (503, 2)
def create_sequences(data, targets, window=10):
    X, y = [], []
    for i in range(len(data) - window):
        X.append(data[i : i + window])      # shape: (10, 2)
        y.append(targets[i + window])        # shape: (1,) — price only
    return np.array(X), np.array(y)

# Target is price only — we're predicting price, not sentiment
X, y = create_sequences(combined, prices_scaled, window=10)

# Temporal split
split = int(0.8 * len(X))
X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

# Convert to tensors
X_train_t = torch.tensor(X_train, dtype=torch.float32)
X_test_t  = torch.tensor(X_test,  dtype=torch.float32)
y_train_t = torch.tensor(y_train, dtype=torch.float32)
y_test_t  = torch.tensor(y_test,  dtype=torch.float32)

print(f"X_train shape: {X_train_t.shape}")  # (samples, 10, 2)  <-- 2 not 1
print(f"y_train shape: {y_train_t.shape}")  # (samples, 1)
class StockLSTMSentiment(nn.Module):
    def __init__(self, input_size=2, hidden_size=64, num_layers=2):
        #                ↑
        # Only change: input_size is now 2 (price + sentiment)
        # Everything else is identical to Model 2
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2
        )
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = out[:, -1, :]
        out = self.fc(out)
        return out

model = StockLSTMSentiment(input_size=2)
print(model)
optimizer    = torch.optim.Adam(model.parameters(), lr=0.001)
loss_fn      = nn.MSELoss()
epochs       = 100
train_losses = []

for epoch in range(epochs):
    model.train()
    optimizer.zero_grad()

    predictions = model(X_train_t)
    loss        = loss_fn(predictions, y_train_t)

    loss.backward()
    optimizer.step()
    train_losses.append(loss.item())

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1}/{epochs}  Loss: {loss.item():.6f}")

model.eval()
with torch.no_grad():
    preds_scaled = model(X_test_t).numpy()

# Inverse transform to real prices
actual    = price_scaler.inverse_transform(y_test)
predicted = price_scaler.inverse_transform(preds_scaled)

lstm_sentiment_mape = mean_absolute_percentage_error(actual, predicted) * 100
print(f"\nLSTM + sentiment MAPE: {lstm_sentiment_mape:.2f}%")

# ── Final comparison table ──
print("\n" + "="*45)
print(f"{'Model':<30} {'MAPE':>10}")
print("="*45)
print(f"{'LSTM — price + sentiment':<30} {lstm_sentiment_mape:>9.2f}%")
print("="*45)
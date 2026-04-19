import yfinance as yf
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_percentage_error
import matplotlib.pyplot as plt

df = yf.download('SBIN.NS', start='2022-01-01', end='2026-01-01')
prices = df['Close'].values.reshape(-1, 1)

scaler = MinMaxScaler()
prices_scaled = scaler.fit_transform(prices)

def create_sequences(data, window=10):
    X, y = [], []
    for i in range(len(data) - window):
        X.append(data[i : i + window])   # shape: (10, 1)
        y.append(data[i + window])
    return np.array(X), np.array(y)

X, y = create_sequences(prices_scaled, window=10)

# Temporal split — same rule as baseline
split = int(0.8 * len(X))
X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

# Convert to PyTorch tensors — this is NEW vs baseline
X_train_t = torch.tensor(X_train, dtype=torch.float32)
X_test_t  = torch.tensor(X_test,  dtype=torch.float32)
y_train_t = torch.tensor(y_train, dtype=torch.float32)
y_test_t  = torch.tensor(y_test,  dtype=torch.float32)

print(f"X_train shape: {X_train_t.shape}")  # (samples, 10, 1)
print(f"y_train shape: {y_train_t.shape}")  # (samples, 1)


class LSTM_price(nn.Module):
    def __init__(self, input_size = 1 , hidden_size = 64 , nlayer = 2 ):
        super().__init__()
        self.lstm = nn.LSTM(input_size=input_size , hidden_size=hidden_size , num_layers=nlayer , batch_first=True , dropout=0.3)
        self.fc = nn.Linear(hidden_size,1)

    def forward(self,x):
        out , _ = self.lstm(x)
        out = out[:,-1,:]
        out = self.fc(out)
        return out
    
model = LSTM_price()
print(model)


optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
loss_fn   = nn.MSELoss()
epochs    = 100

train_losses = []

for epoch in range(epochs):
    model.train()
    optimizer.zero_grad()

    predictions = model(X_train_t)
    loss = loss_fn(predictions, y_train_t)

    loss.backward()
    optimizer.step()

    train_losses.append(loss.item())

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1}/{epochs}  Loss: {loss.item():.6f}")

    model.eval()
    with torch.no_grad():
        preds_scaled = model(X_test_t).numpy()

    actual    = scaler.inverse_transform(y_test)
    predicted = scaler.inverse_transform(preds_scaled)

    mape = mean_absolute_percentage_error(actual, predicted) * 100
    print(f"\nLSTM (price only) MAPE: {mape:.2f}%")

plt.figure(figsize=(12, 5))
plt.plot(actual,    label='Actual price',         color='Red')
plt.plot(predicted, label='LSTM prediction',      color='Blue', linestyle='--')
plt.title('SBI — LSTM Price-Only Model')
plt.xlabel('Days')
plt.ylabel('Price (INR)')
plt.legend()
plt.tight_layout()
plt.savefig('lstm_price_result.png')
plt.show()

# Print both results side by side
print(f"LSTM MAPE     : {mape:.2f}%")
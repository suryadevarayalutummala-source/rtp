import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_percentage_error
from sklearn.preprocessing import MinMaxScaler

stock  = yf.download('SBIN.NS',start='2022-01-01', end='2026-01-01')
prices = stock['Close'].values.reshape(-1,1)
print(f"total days of data {len(prices)}")
scaler = MinMaxScaler()
scaled_prices = scaler.fit_transform(prices)

def sequence(data , window=10):
    x,y = [] , []
    for i in range(len(data)-window):
        x.append(data[i :i+window].flatten())
        y.append(data[i+window].flatten())
    return np.array(x),np.array(y)
x,y = sequence(scaled_prices,window=10)
print(f" x shape {x.shape}")
print(f"y shape {y.shape}")


split = int(0.8*len(x))

x_train , x_test = x[:split] , x[split:]
y_train , y_test = y[:split] , y[split:]

print(f" trainign sample : {len(x_train)}")
print(f"testing sample  : {len(x_train)}")


model  = LinearRegression()
model.fit(x_train,y_train)

print("Model trained")

predictions = model.predict(x_test)
bs_mape = mean_absolute_percentage_error(y_test,predictions)*100
print(f"Baseline MAPE : {bs_mape:.3f}%")


actual = scaler.inverse_transform(y_test)
predicted = scaler.inverse_transform(predictions)

plt.figure(figsize=(12,5))
plt.plot(actual, label= 'Actual price' , color = 'Red')
plt.plot(predicted , label='Predicted price', color='Blue', linestyle='--')
plt.title('SBI - Baseline')
plt.xlabel('Days')
plt.ylabel('Price(INR)')
plt.legend()
plt.tight_layout()
plt.savefig("baseline.png")
plt.show()

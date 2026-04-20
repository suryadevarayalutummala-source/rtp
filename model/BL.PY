import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures, MinMaxScaler
from sklearn.metrics import mean_absolute_percentage_error
import argparse
import json
import sys
import os
from datetime import datetime, timedelta

def run_baseline(ticker='SBIN.NS', output_path='baseline.png', start_date='2019-01-01', end_date='2026-01-01', predict_days=20):
    try:
        # Extended history for better training
        stock = yf.download(ticker, start=start_date, end=end_date)
        if stock.empty:
            print(json.dumps({"error": f"No data found for {ticker}"}))
            return

        prices = stock['Close'].values.reshape(-1, 1)
        scaler = MinMaxScaler()
        scaled_prices = scaler.fit_transform(prices)

        def sequence(data, window=20):  # Extended window from 10 to 20
            x, y = [], []
            for i in range(len(data) - window):
                x.append(data[i : i + window].flatten())
                y.append(data[i + window].flatten())
            return np.array(x), np.array(y)

        x, y = sequence(scaled_prices, window=20)

        # Walk-forward validation: 80% train, 10% validation, 10% test
        split = int(0.80 * len(x))
        val_split = int(0.90 * len(x))
        x_train, x_val, x_test = x[:split], x[split:val_split], x[val_split:]
        y_train, y_val, y_test = y[:split], y[split:val_split], y[val_split:]

        # Add polynomial features (degree=2) for non-linear patterns
        poly = PolynomialFeatures(degree=2, include_bias=False)
        x_train_poly = poly.fit_transform(x_train)
        x_val_poly = poly.transform(x_val)
        x_test_poly = poly.transform(x_test)

        # Use Ridge regression for regularization (better generalization)
        model = Ridge(alpha=1.0)
        model.fit(x_train_poly, y_train)

        # Validate and check for early stopping
        val_preds = model.predict(x_val_poly)
        val_mape = mean_absolute_percentage_error(y_val, val_preds) * 100

        # Test predictions
        predictions = model.predict(x_test_poly)
        bs_mape = mean_absolute_percentage_error(y_test, predictions) * 100

        actual = scaler.inverse_transform(y_test)
        predicted = scaler.inverse_transform(predictions)

        # ============ FUTURE PRICE PREDICTION ============
        future_predictions = []
        future_dates = []
        last_date = pd.to_datetime(stock.index[-1])

        # Get last window for prediction
        last_window = scaled_prices[-20:].reshape(1, -1)
        last_window_poly = poly.transform(last_window)

        with np.errstate(over='ignore'):
            for i in range(predict_days):
                pred_scaled = model.predict(last_window_poly)[0, 0]

                # Inverse transform
                pred_price = scaler.inverse_transform([[pred_scaled]])[0, 0]
                future_predictions.append(float(pred_price))
                future_dates.append((last_date + timedelta(days=i+1)).strftime('%Y-%m-%d'))

                # Update window: remove first, add new prediction
                last_window = np.vstack([last_window[0, 1:].reshape(1, -1), [[pred_scaled]]])
                last_window = last_window.reshape(1, -1)
                last_window_poly = poly.transform(last_window)

        # Calculate confidence intervals
        recent_volatility = stock['Close'].pct_change().std()
        confidence_upper = [p * (1 + recent_volatility) for p in future_predictions]
        confidence_lower = [p * (1 - recent_volatility) for p in future_predictions]

        # Aesthetic Styling - Enhanced with future predictions
        plt.style.use('dark_background')
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), gridspec_kw={'height_ratios': [2, 1]})
        fig.patch.set_facecolor('#131313')
        ax1.set_facecolor('#131313')
        ax2.set_facecolor('#131313')

        # Top plot: Historical + Test predictions + Future
        ax1.plot(actual, label='Actual Price', color='#88d982', linewidth=2.5, alpha=0.9)
        ax1.plot(predicted, label='Ridge Regression Forecast', color='#bdc2ff', linestyle='-', linewidth=2)

        # Extend plot to show future predictions
        hist_len = len(actual)
        future_x = range(hist_len, hist_len + len(future_predictions))
        ax1.plot(future_x, future_predictions, label='Future Prediction', color='#ffab40', linestyle='--', linewidth=2.5)

        # Confidence interval shading
        ax1.fill_between(
            future_x,
            confidence_lower,
            confidence_upper,
            alpha=0.3,
            color='#ffab40',
            label='Confidence Interval'
        )

        ax1.set_title(f'{ticker} - Ridge Regression Forecast + {predict_days}-Day Projection', fontsize=16, fontweight='bold', pad=20, color='#FFFFFF')
        ax1.set_xlabel('Trading Days', fontsize=12, color='#A0A0A0')
        ax1.set_ylabel('Price (INR)', fontsize=12, color='#A0A0A0')

        ax1.grid(True, linestyle=':', alpha=0.15, color='#FFFFFF')
        ax1.spines['top'].set_visible(False)
        ax1.spines['right'].set_visible(False)

        legend = ax1.legend(frameon=True, facecolor='#1A1A1A', edgecolor='#333333', fontsize=10)
        for text in legend.get_texts():
            text.set_color('#FFFFFF')

        # Bottom plot: Prediction zoom
        ax2.plot(predicted[-30:], label='Predicted (Last 30)', color='#bdc2ff', linewidth=2, alpha=0.8)
        ax2.plot(actual[-30:], label='Actual (Last 30)', color='#88d982', linewidth=2, alpha=0.8)
        ax2.set_title('Prediction Accuracy (Last 30 Days)', fontsize=12, color='#A0A0A0')
        ax2.grid(True, linestyle=':', alpha=0.15, color='#FFFFFF')
        ax2.legend(frameon=True, facecolor='#1A1A1A', edgecolor='#333333', fontsize=9)

        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches='tight')
        plt.close()

        print(json.dumps({
            "ticker": ticker,
            "mape": round(float(bs_mape), 2),
            "val_mape": round(float(val_mape), 2),
            "output_path": output_path,
            "future_predictions": future_predictions,
            "future_dates": future_dates,
            "confidence_upper": confidence_upper,
            "confidence_lower": confidence_lower,
            "training_days": len(stock),
            "test_samples": len(actual)
        }))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--ticker', type=str, default='SBIN.NS')
    parser.add_argument('--output', type=str, default='baseline.png')
    parser.add_argument('--start', type=str, default='2019-01-01')
    parser.add_argument('--end', type=str, default='2026-01-01')
    parser.add_argument('--predict-days', type=int, default=20)
    args = parser.parse_args()

    run_baseline(args.ticker, args.output, args.start, args.end, args.predict_days)

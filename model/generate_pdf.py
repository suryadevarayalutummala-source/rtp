import argparse
import json
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import os

def generate_pdf(ticker, model, mape, image_path, output_path, future_predictions, future_dates, confidence_upper, confidence_lower):
    """Generate a detailed PDF report for a prediction."""

    doc = SimpleDocTemplate(output_path, pagesize=A4,
                            rightMargin=0.75*inch, leftMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)

    # Container for the 'Flowable' objects
    elements = []

    # Styles
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a2e'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#666666'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica'
    )

    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#1a1a2e'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333333'),
        fontName='Helvetica'
    )

    # Title
    elements.append(Paragraph("Sovereign Prediction Report", title_style))
    elements.append(Spacer(1, 0.2*inch))

    # Subtitle with ticker and model
    model_name = {
        'baseline': 'Ridge Regression (Baseline)',
        'lstm_price': 'LSTM Quantitative Model',
        'lstm_sentiment': 'LSTM Sentiment+ Model'
    }.get(model, model)

    elements.append(Paragraph(f"Asset: {ticker.split('.')[0]} | Model: {model_name}", subtitle_style))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", subtitle_style))
    elements.append(Spacer(1, 0.3*inch))

    # Key Metrics Table
    metrics_data = [
        ['Metric', 'Value'],
        ['Ticker', ticker],
        ['Model Type', model_name],
        ['Backtest MAPE', f"{mape}%"],
        ['Accuracy', f"{100 - float(mape):.2f}%"],
        ['Forecast Horizon', f"{len(future_predictions)} Trading Days"],
    ]

    metrics_table = Table(metrics_data, colWidths=[3*inch, 2*inch])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f5f5f5')),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#333333')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dddddd')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    elements.append(metrics_table)
    elements.append(Spacer(1, 0.3*inch))

    # Chart Section
    elements.append(Paragraph("Price Forecast Visualization", header_style))

    if os.path.exists(image_path):
        try:
            chart_img = Image(image_path, width=6.5*inch, height=4.5*inch)
            elements.append(chart_img)
        except Exception as e:
            elements.append(Paragraph(f"Chart: {image_path} (Error loading image)", normal_style))
    else:
        elements.append(Paragraph(f"Chart saved at: {image_path}", normal_style))

    elements.append(Spacer(1, 0.3*inch))

    # Future Predictions Table
    elements.append(Paragraph("Future Price Predictions", header_style))

    if future_predictions and future_dates:
        # Create predictions table (show first 10)
        pred_data = [['Date', 'Predicted Price', 'Lower Bound', 'Upper Bound']]

        for i in range(min(10, len(future_predictions))):
            pred_data.append([
                future_dates[i],
                f"INR {future_predictions[i]:.2f}",
                f"INR {confidence_lower[i]:.2f}" if confidence_lower else "N/A",
                f"INR {confidence_upper[i]:.2f}" if confidence_upper else "N/A"
            ])

        pred_table = Table(pred_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        pred_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f5f5f5')),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#333333')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dddddd')),
        ]))

        elements.append(pred_table)

        if len(future_predictions) > 10:
            elements.append(Paragraph(f"\n... and {len(future_predictions) - 10} more days in digital format", normal_style))
    else:
        elements.append(Paragraph("No future predictions available.", normal_style))

    elements.append(Spacer(1, 0.3*inch))

    # Analysis Summary
    elements.append(Paragraph("Analysis Summary", header_style))

    # Determine recommendation based on trend
    if future_predictions and len(future_predictions) >= 5:
        first_avg = sum(future_predictions[:5]) / 5
        last_avg = sum(future_predictions[-5:]) / 5
        trend = "BULLISH" if last_avg > first_avg else "BEARISH" if last_avg < first_avg else "NEUTRAL"
        trend_color = colors.HexColor('#88d982') if trend == "BULLISH" else colors.HexColor('#ff6b6b') if trend == "BEARISH" else colors.HexColor('#ffa500')

        summary_text = f"""
        <b>Predicted Trend:</b> <font color="{trend_color.hex}">{trend}</font><br/>
        The {model_name} model forecasts a {trend.lower()} trajectory for {ticker.split('.')[0]} over the next {len(future_predictions)} trading days.
        The model achieved a Mean Absolute Percentage Error (MAPE) of <b>{mape}%</b> on historical test data,
        indicating {(100 - float(mape)):.1f}% statistical accuracy.<br/><br/>
        <b>Confidence Interval:</b> The shaded region in the chart represents the 1-sigma confidence interval,
        accounting for recent market volatility. Prices are expected to remain within these bounds with ~68% probability.
        """
    else:
        summary_text = f"""
        The {model_name} model has generated predictions for {ticker.split('.')[0]} with a MAPE of {mape}%.
        Review the chart and predictions table for detailed analysis.
        """

    elements.append(Paragraph(summary_text, normal_style))
    elements.append(Spacer(1, 0.3*inch))

    # Disclaimer
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#999999'),
        alignment=TA_CENTER,
        fontName='Helvetica-Oblique'
    )

    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph(
        "DISCLAIMER: This report is for informational purposes only and does not constitute financial advice. "
        "Past performance does not guarantee future results. Always conduct your own research before making investment decisions.",
        disclaimer_style
    ))

    # Footer
    elements.append(Spacer(1, 0.2*inch))
    elements.append(Paragraph(
        "Wealth Management System | Institutional-Grade Quantitative Forecasting",
        disclaimer_style
    ))

    # Build PDF
    doc.build(elements)
    print(f"PDF generated: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--ticker', type=str, required=True)
    parser.add_argument('--model', type=str, required=True)
    parser.add_argument('--mape', type=str, required=True)
    parser.add_argument('--image', type=str, required=True)
    parser.add_argument('--output', type=str, required=True)
    parser.add_argument('--future', type=str, default='[]')
    parser.add_argument('--dates', type=str, default='[]')
    parser.add_argument('--confidence-upper', type=str, default='[]')
    parser.add_argument('--confidence-lower', type=str, default='[]')
    args = parser.parse_args()

    generate_pdf(
        ticker=args.ticker,
        model=args.model,
        mape=args.mape,
        image_path=args.image,
        output_path=args.output,
        future_predictions=json.loads(args.future),
        future_dates=json.loads(args.dates),
        confidence_upper=json.loads(args.confidence_upper),
        confidence_lower=json.loads(args.confidence_lower)
    )

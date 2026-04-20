import vader from 'vader-sentiment';
const title = "Stock Market Surges to Record Highs as Tech Rebounds";
const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(title);
console.log("Result:", intensity);
const words = title.split(' ');
words.forEach(w => {
    console.log(`${w}:`, vader.SentimentIntensityAnalyzer.polarity_scores(w).compound);
});

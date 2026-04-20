import vader from 'vader-sentiment';

export interface Article {
  id: string;
  category: string;
  time: string;
  title: string;
  excerpt: string;
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'high-alpha';
  tags: string[];
  image?: string;
  url: string;
}

const YAHOO_SEARCH_PROXY = '/api/yahoo-search/v1/finance/search';
const NEWS_COOLDOWN_MS = 60_000;
let newsCooldownUntil = 0;
let lastNewsCache: Article[] = [];

/**
 * Format timestamp to "Xh ago" or "Xm ago"
 */
function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - (timestamp * 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
}

/**
 * Get sentiment from title using VADER + Financial Keyword Booster
 */
function calculateSentiment(title: string): 'bullish' | 'bearish' | 'neutral' | 'high-alpha' {
  const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(title);
  let score = intensity.compound;

  // Financial Keyword Booster
  const lowerTitle = title.toLowerCase();
  const financialKeywords: Record<string, number> = {
    'surge': 0.4, 'rally': 0.4, 'gain': 0.3, 'high': 0.2, 'growth': 0.3, 'bull': 0.4, 'bullish': 0.5, 
    'beat': 0.3, 'outperform': 0.4, 'rise': 0.2, 'soar': 0.4, 'positive': 0.3, 'jump': 0.3,
    'plunge': -0.4, 'crash': -0.5, 'drop': -0.3, 'fall': -0.2, 'bear': -0.4, 'bearish': -0.5, 
    'miss': -0.3, 'underperform': -0.4, 'low': -0.2, 'loss': -0.3, 'negative': -0.3, 'sink': -0.3
  };

  Object.entries(financialKeywords).forEach(([word, weight]) => {
    if (lowerTitle.includes(word)) {
      score += weight;
    }
  });

  if (score >= 0.7) return 'high-alpha';
  if (score >= 0.1) return 'bullish';
  if (score <= -0.1) return 'bearish';
  return 'neutral';
}

export async function fetchMarketNews(query: string = 'Stock Market'): Promise<Article[]> {
  if (newsCooldownUntil && Date.now() < newsCooldownUntil) {
    return lastNewsCache;
  }
  try {
    const url = `${YAHOO_SEARCH_PROXY}?q=${encodeURIComponent(query)}&newsCount=10&region=IN`;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) {
        newsCooldownUntil = Date.now() + NEWS_COOLDOWN_MS;
      }
      throw new Error('Failed to fetch news');
    }
    
    const data = await response.json();
    const news = data.news || [];

    const articles = news.map((item: any) => {
      // Find highest resolution thumbnail
      const thumbnail = item.thumbnail?.resolutions?.sort((a: any, b: any) => b.width - a.width)[0]?.url;

      return {
        id: item.uuid,
        category: item.publisher || 'Market Insight',
        time: formatRelativeTime(item.providerPublishTime),
        title: item.title,
        excerpt: item.title, // News search doesn't provide excerpts, but the title is usually descriptive
        sentiment: calculateSentiment(item.title),
        tags: item.relatedTickers || [],
        image: thumbnail,
        url: item.link
      };
    });
    lastNewsCache = articles;
    return articles;
  } catch (error) {
    console.error('News service error:', error);
    return lastNewsCache;
  }
}

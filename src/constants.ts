import { Article, Holding, MarketIndex } from './types';

export const ARTICLES: Article[] = [
  {
    id: '1',
    category: 'Macro Analysis',
    time: '2h ago',
    title: 'Semiconductor Demand Surges as The Shift to Private AI Infrastructure',
    excerpt: 'Recent data indicates that private wealth funds are shifting capital towards domestic data center infrastructure, creating a sustained demand floor for top-tier chip manufacturers despite broader market volatility.',
    sentiment: 'bullish',
    tags: ['RELIANCE', 'TCS', 'INFY'],
    image: 'https://picsum.photos/seed/chips/800/600'
  },
  {
    id: '2',
    category: 'Risk Assessment',
    time: '4h ago',
    title: 'Consumer Credit Default Swaps Reach 18-Month High Amid Stagnant Wage Growth',
    excerpt: 'Internal risk models suggest a potential correction in the retail sector as delinquency rates in subprime segments begin to bleed into prime credit instruments.',
    sentiment: 'bearish',
    tags: ['HDFCBANK', 'ICICIBANK', 'SBIN']
  },
  {
    id: '3',
    category: 'Energy Sector',
    time: '6h ago',
    title: 'OPEC+ Maintenance Schedules May Balance Short-term Supply Gluts',
    excerpt: 'Market analysts expect price stability as voluntary cuts are extended through the next fiscal quarter.',
    sentiment: 'neutral',
    tags: ['ONGC', 'RELIANCE']
  },
  {
    id: '4',
    category: 'Strategic Metals',
    time: '8h ago',
    title: 'Rare Earth Export Limits Create Strategic Advantage for Local Refiners',
    excerpt: 'New regulatory framework favors integrated domestic supply chains over imported raw materials.',
    sentiment: 'high-alpha',
    tags: ['TATASTEEL', 'JSWSTEEL']
  },
  {
    id: '5',
    category: 'Policy Update',
    time: '12h ago',
    title: 'RBI Monetary Policy Committee Maintains Status Quo on Repo Rates',
    excerpt: 'The central bank remains focused on withdrawal of accommodation to ensure inflation progressively aligns with the target while supporting growth.',
    sentiment: 'neutral',
    tags: ['NIFTY', 'BANKNIFTY']
  }
];

export const HOLDINGS: Holding[] = [
  {
    ticker: 'RELIANCE',
    name: 'Reliance Industries',
    sector: 'Energy & Retail',
    type: 'stock',
    price: 2984.30,
    avgCost: 2421.10,
    quantity: 416,
    marketValue: 1242104.20,
    plPercent: 23.2,
    weight: 22.0
  },
  {
    ticker: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'Technology',
    type: 'stock',
    price: 4115.50,
    avgCost: 3888.20,
    quantity: 214,
    marketValue: 882410.00,
    plPercent: 5.8,
    weight: 15.9
  },
  {
    ticker: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    sector: 'Banking',
    type: 'stock',
    price: 1475.20,
    avgCost: 1592.40,
    quantity: 352,
    marketValue: 520112.55,
    plPercent: -7.3,
    weight: 7.4
  },
  {
    ticker: 'INFY',
    name: 'Infosys Limited',
    sector: 'Technology',
    type: 'stock',
    price: 1670.30,
    avgCost: 1565.10,
    quantity: 443,
    marketValue: 740882.10,
    plPercent: 6.7,
    weight: 12.6
  }
];

export const MARKET_INDICES: MarketIndex[] = [
  { name: 'Nifty 50', value: 22096.75, change: 173.90, changePercent: 0.79 },
  { name: 'BSE Sensex', value: 72831.94, change: 528.60, changePercent: 0.73 },
  { name: 'Nifty Bank', value: 46863.75, change: -47.35, changePercent: -0.10 }
];

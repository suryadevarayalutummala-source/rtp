import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface Article {
  id: string;
  category: string;
  time: string;
  title: string;
  excerpt: string;
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'high-alpha';
  tags: string[];
  image?: string;
}

export interface Holding {
  ticker: string;
  name: string;
  sector: string;
  type: 'stock' | 'mutual_fund';
  price: number;
  avgCost: number;
  quantity: number;
  marketValue: number;
  plPercent: number;
  weight: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

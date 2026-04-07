import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  user_type: 'institutional' | 'personal';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, user_type: string) => Promise<void>;
  logout: () => void;
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
  price: number;
  avgCost: number;
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

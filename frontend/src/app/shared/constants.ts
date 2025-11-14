export const CATEGORIES = [
  '賃貸・ルームシェア',
  '求人・アルバイト',
  '売買（Buy & Sell）',
  'レッスン',
  'イベント',
  'サービス',
  '口コミ・おすすめ',
  '相談HELP',
  '住居保証人マッチング',
  '乗り合い・タクシー',
] as const;

export const CITIES = [
  'Glasgow',
  'Edinburgh',
  'Aberdeen',
  'Dundee',
  'St Andrews',
  'Stirling',
  'Inverness',
  'その他',
] as const;

export const UNITS = ['GBP/月', 'GBP/週', 'GBP/日', 'GBP/時給', 'GBP', 'Free', '応相談'] as const;

export interface PostPayload {
  title?: string;
  category?: string;
  city?: string;
  location?: string;
  description?: string;
  price?: number | null;
  price_unit?: string | null;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  tags?: string[];
  images?: string[];
  published?: boolean;
  expires_at?: string | null;
}

export interface PostRecord extends PostPayload {
  id: string;
  created_at?: number;
  updated_at?: number;
}

import Parser from 'rss-parser';
import crypto from 'crypto';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'NewsInsights/1.0',
  },
});

export const RSS_FEEDS = [
  {
    name: 'reuters-business',
    url: 'https://www.reutersagency.com/feed/?best-topics=business-finance',
    source: 'Reuters',
  },
  {
    name: 'bloomberg-markets',
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    source: 'Bloomberg',
  },
  {
    name: 'techcrunch',
    url: 'https://techcrunch.com/feed/',
    source: 'TechCrunch',
  },
  {
    name: 'wsj-markets',
    url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
    source: 'WSJ',
  },
  {
    name: 'ft-world',
    url: 'https://www.ft.com/rss/home',
    source: 'Financial Times',
  },
];

export interface RSSItem {
  title: string;
  url: string;
  source: string;
  published_at: string | null;
  summary_fact: string | null;
  content_hash: string;
}

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function fetchFeed(feedConfig: typeof RSS_FEEDS[number]): Promise<RSSItem[]> {
  try {
    const feed = await parser.parseURL(feedConfig.url);
    return (feed.items || []).map((item) => ({
      title: item.title || 'Untitled',
      url: item.link || '',
      source: feedConfig.source,
      published_at: item.pubDate || item.isoDate || null,
      summary_fact: item.contentSnippet || item.content || null,
      content_hash: hashContent(item.link || item.title || ''),
    }));
  } catch (error) {
    console.error(`Failed to fetch feed ${feedConfig.name}:`, error);
    return [];
  }
}

export async function fetchAllFeeds(): Promise<RSSItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetchFeed(feed))
  );

  return results.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : []
  );
}

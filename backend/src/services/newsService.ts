import axios from 'axios';
import * as cheerio from 'cheerio';
import * as xml2js from 'xml2js';
import { promisify } from 'util';

const parseString = xml2js.parseString;

const parseXml = promisify(parseString);

interface NewsArticle {
  title: string;
  content: string;
  url: string;
  publishedDate: string;
}

class NewsService {
  private readonly REUTERS_SITEMAP = 'https://www.reuters.com/arc/outboundfeeds/sitemap-index/?outputType=xml';

  async fetchSitemapUrls(): Promise<string[]> {
    try {
      const response = await axios.get(this.REUTERS_SITEMAP);
      const result = await parseXml(response.data) as { sitemapindex: { sitemap: Array<{ loc: string[] }> } };
      return result.sitemapindex.sitemap.map(sitemap => sitemap.loc[0] || '');
    } catch (error) {
      console.error('Error fetching sitemap:', error);
      return [];
    }
  }

  async scrapeArticle(url: string): Promise<NewsArticle | null> {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      const title = $('h1').first().text().trim();
      const content = $('article p').map((_, el) => $(el).text().trim()).get().join(' ');
      const publishedDate = $('time').attr('datetime') || new Date().toISOString();

      return {
        title,
        content,
        url,
        publishedDate
      };
    } catch (error) {
      console.error(`Error scraping article ${url}:`, error);
      return null;
    }
  }

  async fetchLatestArticles(limit: number = 50): Promise<NewsArticle[]> {
    const sitemapUrls = await this.fetchSitemapUrls();
    const articles: NewsArticle[] = [];
    
    for (const sitemapUrl of sitemapUrls) {
      if (articles.length >= limit) break;
      
      try {
        const response = await axios.get(sitemapUrl);
        const result = await parseXml(response.data) as { urlset: { url: Array<{ loc: string[] }> } };
        const urls = result.urlset.url.map(url => url.loc[0] || '');
        
        for (const url of urls) {
          if (articles.length >= limit) break;
          const article = await this.scrapeArticle(url);
          if (article) {
            articles.push(article);
          }
        }
      } catch (error) {
        console.error(`Error processing sitemap ${sitemapUrl}:`, error);
        continue;
      }
    }

    return articles;
  }
}

export const newsService = new NewsService();
export type { NewsArticle };

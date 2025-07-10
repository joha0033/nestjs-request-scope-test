import { Injectable } from '@nestjs/common';
import { readFile, readdir } from 'fs/promises';
import { resolve, join } from 'path';

interface LocustMetrics {
  scenario: string;
  totalRequests: number;
  failureRate: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  queryBreakdown: Array<{
    query: string;
    count: number;
    averageTime: number;
    errorRate: number;
    rps: number;
  }>;
  duration: string;
  userCount: number;
}

@Injectable()
export class LocustParserService {
  private readonly LOCUST_REPORTS_DIR = resolve('./');

  async parseLatestReport(): Promise<LocustMetrics | null> {
    const latestReport = await this.getLatestReportFile();
    if (!latestReport) {
      return null;
    }

    return this.parseHtmlReport(latestReport);
  }

  async parseAllReports(): Promise<LocustMetrics[]> {
    const reportFiles = await this.getAllReportFiles();
    const metrics: LocustMetrics[] = [];

    for (const file of reportFiles) {
      const parsed = await this.parseHtmlReport(file);
      if (parsed) {
        metrics.push(parsed);
      }
    }

    return metrics;
  }

  private async getLatestReportFile(): Promise<string | null> {
    try {
      const files = await readdir(this.LOCUST_REPORTS_DIR);
      const reportFiles = files
        .filter(f => f.startsWith('locust-report-') && f.endsWith('.html'))
        .map(f => ({
          name: f,
          path: join(this.LOCUST_REPORTS_DIR, f),
          timestamp: this.extractTimestamp(f)
        }))
        .filter(f => f.timestamp > 0)
        .sort((a, b) => b.timestamp - a.timestamp);

      return reportFiles.length > 0 ? reportFiles[0].path : null;
    } catch (error) {
      console.error('Error reading report files:', error);
      return null;
    }
  }

  private async getAllReportFiles(): Promise<string[]> {
    try {
      const files = await readdir(this.LOCUST_REPORTS_DIR);
      return files
        .filter(f => f.startsWith('locust-report-') && f.endsWith('.html'))
        .map(f => join(this.LOCUST_REPORTS_DIR, f));
    } catch (error) {
      console.error('Error reading report files:', error);
      return [];
    }
  }

  private async parseHtmlReport(filePath: string): Promise<LocustMetrics | null> {
    try {
      const htmlContent = await readFile(filePath, 'utf-8');
      
      // Extract scenario name from filename
      const fileName = filePath.split('/').pop() || '';
      const scenario = fileName.replace('locust-report-', '').replace('.html', '');

      // Parse HTML content to extract metrics
      const metrics = this.extractMetricsFromHtml(htmlContent);
      
      return {
        scenario,
        ...metrics
      };
    } catch (error) {
      console.error(`Error parsing report ${filePath}:`, error);
      return null;
    }
  }

  private extractMetricsFromHtml(htmlContent: string): Omit<LocustMetrics, 'scenario'> {
    // Extract total requests
    const totalRequestsMatch = htmlContent.match(/Total requests.*?(\d+)/s);
    const totalRequests = totalRequestsMatch ? parseInt(totalRequestsMatch[1]) : 0;

    // Extract failure rate
    const failureRateMatch = htmlContent.match(/Failure rate.*?(\d+\.?\d*)%/s);
    const failureRate = failureRateMatch ? parseFloat(failureRateMatch[1]) : 0;

    // Extract average response time
    const avgResponseTimeMatch = htmlContent.match(/Average response time.*?(\d+\.?\d*)\s*ms/s);
    const averageResponseTime = avgResponseTimeMatch ? parseFloat(avgResponseTimeMatch[1]) : 0;

    // Extract RPS
    const rpsMatch = htmlContent.match(/Requests per second.*?(\d+\.?\d*)/s);
    const requestsPerSecond = rpsMatch ? parseFloat(rpsMatch[1]) : 0;

    // Extract user count
    const userCountMatch = htmlContent.match(/Total users.*?(\d+)/s);
    const userCount = userCountMatch ? parseInt(userCountMatch[1]) : 0;

    // Extract duration
    const durationMatch = htmlContent.match(/Test duration.*?(\d+[smh]+)/s);
    const duration = durationMatch ? durationMatch[1] : 'unknown';

    // Extract query breakdown from statistics table
    const queryBreakdown = this.extractQueryBreakdown(htmlContent);

    // Extract percentiles (P95, P99)
    const p95Match = htmlContent.match(/95th percentile.*?(\d+\.?\d*)\s*ms/s);
    const p99Match = htmlContent.match(/99th percentile.*?(\d+\.?\d*)\s*ms/s);
    const p95ResponseTime = p95Match ? parseFloat(p95Match[1]) : 0;
    const p99ResponseTime = p99Match ? parseFloat(p99Match[1]) : 0;

    return {
      totalRequests,
      failureRate,
      averageResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      requestsPerSecond,
      queryBreakdown,
      duration,
      userCount
    };
  }

  private extractQueryBreakdown(htmlContent: string): Array<{
    query: string;
    count: number;
    averageTime: number;
    errorRate: number;
    rps: number;
  }> {
    const breakdown: Array<{
      query: string;
      count: number;
      averageTime: number;
      errorRate: number;
      rps: number;
    }> = [];

    // Extract table rows with statistics
    const tableMatch = htmlContent.match(/<table[^>]*class="statistics"[^>]*>(.*?)<\/table>/s);
    if (!tableMatch) return breakdown;

    const tableContent = tableMatch[1];
    const rowMatches = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gs);
    
    if (!rowMatches) return breakdown;

    for (const row of rowMatches) {
      // Skip header rows
      if (row.includes('<th>')) continue;

      const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs);
      if (!cells || cells.length < 6) continue;

      const cleanCell = (cell: string) => cell.replace(/<[^>]*>/g, '').trim();

      const query = cleanCell(cells[0]);
      const count = parseInt(cleanCell(cells[1])) || 0;
      const averageTime = parseFloat(cleanCell(cells[4])) || 0;
      const errorRate = parseFloat(cleanCell(cells[6])) || 0;
      const rps = parseFloat(cleanCell(cells[7])) || 0;

      // Filter out GraphQL queries (ignore totals and non-GraphQL endpoints)
      if (query.includes('GraphQL') || query.includes('getUser') || query.includes('getProduct') || 
          query.includes('getPayment') || query.includes('getUserPayment') || query.includes('Stress:') || 
          query.includes('Browse:') || query.includes('Shopping:') || query.includes('Account:')) {
        
        breakdown.push({
          query: query.replace(/^(GraphQL:\s*|Stress:\s*|Browse:\s*|Shopping:\s*|Account:\s*)/, ''),
          count,
          averageTime,
          errorRate,
          rps
        });
      }
    }

    return breakdown;
  }

  private extractTimestamp(fileName: string): number {
    // Extract timestamp from filename if available
    const match = fileName.match(/(\d{13})/);
    if (match) {
      return parseInt(match[1]);
    }
    
    // Fallback: extract from config name and use current time
    const configMatch = fileName.match(/locust-report-(\w+)\.html/);
    if (configMatch) {
      return Date.now();
    }
    
    return 0;
  }

  /**
   * Parse CSV data if available (Locust can output CSV data)
   */
  async parseCSVData(csvPath: string): Promise<any[]> {
    try {
      const csvContent = await readFile(csvPath, 'utf-8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',');
      
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          const row: any = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
          });
          return row;
        });

      return data;
    } catch (error) {
      console.error('Error parsing CSV data:', error);
      return [];
    }
  }
} 

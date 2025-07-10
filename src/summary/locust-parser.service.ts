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
  private readonly LOCUST_REPORTS_DIR = resolve('./locust');

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
    try {
      // Extract data from window.templateArgs JavaScript object
      const templateArgsStart = htmlContent.indexOf('window.templateArgs = ');
      if (templateArgsStart === -1) {
        throw new Error('Could not find templateArgs in HTML');
      }

      // Find the start of the JSON object
      const jsonStart = htmlContent.indexOf('{', templateArgsStart);
      if (jsonStart === -1) {
        throw new Error('Could not find JSON object start');
      }

      // Find the end of the JSON object by counting braces
      let braceCount = 0;
      let jsonEnd = jsonStart;
      for (let i = jsonStart; i < htmlContent.length; i++) {
        if (htmlContent[i] === '{') {
          braceCount++;
        } else if (htmlContent[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            jsonEnd = i;
            break;
          }
        }
      }

      const jsonString = htmlContent.substring(jsonStart, jsonEnd + 1);
      const templateArgs = JSON.parse(jsonString);
      
      // Extract from requests_statistics array
      const requestsStats = templateArgs.requests_statistics || [];
      
      // Find the Aggregated row
      const aggregatedStats = requestsStats.find((stat: any) => stat.name === 'Aggregated');
      
      let totalRequests = 0;
      let failureRate = 0;
      let averageResponseTime = 0;
      let requestsPerSecond = 0;
      let p95ResponseTime = 0;
      let p99ResponseTime = 0;
      
      if (aggregatedStats) {
        totalRequests = aggregatedStats.num_requests || 0;
        failureRate = aggregatedStats.num_failures && totalRequests > 0 ? 
          (aggregatedStats.num_failures / totalRequests * 100) : 0;
        averageResponseTime = aggregatedStats.avg_response_time || 0;
        requestsPerSecond = aggregatedStats.current_rps || 0;
        p95ResponseTime = aggregatedStats.response_time_percentile_0_95 || 0;
        p99ResponseTime = aggregatedStats.response_time_percentile_0_99 || 0;
      }

      // Extract query breakdown (exclude Aggregated row)
      const queryStats = requestsStats.filter((stat: any) => stat.name !== 'Aggregated');
      const queryBreakdown = queryStats.map((stat: any) => ({
        query: stat.name,
        count: stat.num_requests || 0,
        averageTime: stat.avg_response_time || 0,
        errorRate: stat.num_failures && stat.num_requests > 0 ? 
          (stat.num_failures / stat.num_requests * 100) : 0,
        rps: stat.current_rps || 0,
      }));

      // Extract test metadata
      let userCount = 0;
      let duration = 'unknown';
      
      if (templateArgs.history && templateArgs.history.length > 0) {
        const firstPoint = templateArgs.history[0];
        userCount = firstPoint.user_count || 0;
        
        // Calculate duration from timestamps
        if (templateArgs.start_time && templateArgs.end_time) {
          const startTime = new Date(templateArgs.start_time);
          const endTime = new Date(templateArgs.end_time);
          const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
          duration = `${durationSeconds}s`;
        }
      }

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
    } catch (error) {
      console.error('Error parsing HTML content:', error);
      console.error('HTML content preview:', htmlContent.substring(0, 500));
      
      // Return default values if parsing fails
      return {
        totalRequests: 0,
        failureRate: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        requestsPerSecond: 0,
        queryBreakdown: [],
        duration: 'unknown',
        userCount: 0
      };
    }
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

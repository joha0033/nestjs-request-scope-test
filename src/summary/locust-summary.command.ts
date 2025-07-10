import { Command, CommandRunner, Option } from 'nest-commander';
import { OpenAIService } from './openai.service';
import { LocustParserService } from './locust-parser.service';
import { readFile, readdir } from 'fs/promises';
import { resolve, join } from 'path';

interface LocustSummaryOptions {
  latest?: boolean;
  all?: boolean;
  compare?: boolean;
  rank?: boolean;
  autocannon?: boolean;
}

@Command({ 
  name: 'locust-summary', 
  description: 'Analyze Locust load testing results with AI-powered insights' 
})
export class LocustSummaryCommand extends CommandRunner {
  constructor(
    private readonly openaiService: OpenAIService,
    private readonly locustParserService: LocustParserService
  ) {
    super();
  }

  async run(passedParams: string[], options: LocustSummaryOptions): Promise<void> {
    console.log('🔍 Analyzing Locust load testing results...\n');

    if (options.latest) {
      await this.summarizeLatestReport();
    } else if (options.all) {
      await this.summarizeAllReports();
    } else if (options.rank) {
      await this.rankQueries();
    } else if (options.compare && options.autocannon) {
      await this.compareWithAutocannon();
    } else {
      // Default: summarize latest report
      await this.summarizeLatestReport();
    }
  }

  @Option({
    flags: '-l, --latest',
    description: 'Summarize the latest Locust report',
  })
  parseLatest(): boolean {
    return true;
  }

  @Option({
    flags: '-a, --all',
    description: 'Summarize all Locust reports',
  })
  parseAll(): boolean {
    return true;
  }

  @Option({
    flags: '-r, --rank',
    description: 'Rank queries by performance',
  })
  parseRank(): boolean {
    return true;
  }

  @Option({
    flags: '-c, --compare',
    description: 'Compare with other results',
  })
  parseCompare(): boolean {
    return true;
  }

  @Option({
    flags: '--autocannon',
    description: 'Compare with autocannon results',
  })
  parseAutocannon(): boolean {
    return true;
  }

  private async summarizeLatestReport(): Promise<void> {
    console.log('📊 Analyzing latest Locust report...\n');

    const metrics = await this.locustParserService.parseLatestReport();
    if (!metrics) {
      console.error('❌ No Locust reports found.');
      console.log('💡 Run a Locust test first: npm run locust:quick');
      return;
    }

    console.log(`📋 Found report: ${metrics.scenario}`);
    console.log(`🔢 Total requests: ${metrics.totalRequests.toLocaleString()}`);
    console.log(`⚡ RPS: ${metrics.requestsPerSecond.toFixed(2)}`);
    console.log(`⏱️  Average response time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`❌ Failure rate: ${metrics.failureRate.toFixed(2)}%`);
    console.log('');

    console.log('🤖 Generating AI analysis...\n');
    const summary = await this.openaiService.summarizeLocustResults([metrics]);
    
    console.log('✅ AI Analysis:\n');
    console.log(summary);
  }

  private async summarizeAllReports(): Promise<void> {
    console.log('📊 Analyzing all Locust reports...\n');

    const allMetrics = await this.locustParserService.parseAllReports();
    if (allMetrics.length === 0) {
      console.error('❌ No Locust reports found.');
      console.log('💡 Run a Locust test first: npm run locust:quick');
      return;
    }

    console.log(`📋 Found ${allMetrics.length} reports:`);
    allMetrics.forEach((metrics, index) => {
      console.log(`  ${index + 1}. ${metrics.scenario} - ${metrics.totalRequests.toLocaleString()} requests`);
    });
    console.log('');

    console.log('🤖 Generating comprehensive AI analysis...\n');
    const summary = await this.openaiService.summarizeLocustResults(allMetrics);
    
    console.log('✅ Comprehensive Analysis:\n');
    console.log(summary);
  }

  private async rankQueries(): Promise<void> {
    console.log('🏆 Ranking GraphQL queries by performance...\n');

    const allMetrics = await this.locustParserService.parseAllReports();
    if (allMetrics.length === 0) {
      console.error('❌ No Locust reports found.');
      console.log('💡 Run a Locust test first: npm run locust:quick');
      return;
    }

    // Display quick summary
    console.log('📊 Query Performance Overview:');
    allMetrics.forEach(metrics => {
      console.log(`\n🔍 ${metrics.scenario}:`);
      metrics.queryBreakdown.forEach((query, index) => {
        console.log(`  ${index + 1}. ${query.query}: ${query.averageTime.toFixed(2)}ms avg, ${query.rps.toFixed(2)} RPS`);
      });
    });
    console.log('');

    console.log('🤖 Generating detailed query rankings...\n');
    const ranking = await this.openaiService.rankQueries(allMetrics);
    
    console.log('✅ Query Performance Rankings:\n');
    console.log(ranking);
  }

  private async compareWithAutocannon(): Promise<void> {
    console.log('⚖️  Comparing Locust results with Autocannon benchmarks...\n');

    // Get latest Locust metrics
    const locustMetrics = await this.locustParserService.parseLatestReport();
    if (!locustMetrics) {
      console.error('❌ No Locust reports found.');
      console.log('💡 Run a Locust test first: npm run locust:quick');
      return;
    }

    // Get latest autocannon results
    const autocannonData = await this.getLatestAutocannonResults();
    if (!autocannonData) {
      console.error('❌ No Autocannon results found.');
      console.log('💡 Run an Autocannon test first: npm run start:autocannon:user');
      return;
    }

    console.log('📊 Comparison Overview:');
    console.log(`🐝 Locust: ${locustMetrics.totalRequests.toLocaleString()} requests, ${locustMetrics.requestsPerSecond.toFixed(2)} RPS`);
    console.log(`🎯 Autocannon: ${autocannonData.requests?.total || 'N/A'} requests, ${(autocannonData.requests?.average || 0).toFixed(2)} RPS`);
    console.log('');

    console.log('🤖 Generating detailed comparison...\n');
    const comparison = await this.openaiService.compareAutoccannonWithLocust(
      JSON.stringify(autocannonData, null, 2), 
      locustMetrics
    );
    
    console.log('✅ Detailed Comparison:\n');
    console.log(comparison);
  }

  private async getLatestAutocannonResults(): Promise<any | null> {
    try {
      const RESULTS_DIR = resolve('./benchmark-results');
      const files = await readdir(RESULTS_DIR);
      
      // Get the most recent autocannon result
      const autocannonFiles = files
        .filter(f => f.startsWith('query') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: join(RESULTS_DIR, f),
          timestamp: this.extractTimestamp(f)
        }))
        .filter(f => f.timestamp > 0)
        .sort((a, b) => b.timestamp - a.timestamp);

      if (autocannonFiles.length === 0) {
        return null;
      }

      const latestFile = autocannonFiles[0];
      const content = await readFile(latestFile.path, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading autocannon results:', error);
      return null;
    }
  }

  private extractTimestamp(fileName: string): number {
    const match = fileName.match(/(\d+)(?=\.json$)/);
    return match ? Number(match[1]) : 0;
  }
} 

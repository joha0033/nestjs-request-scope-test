import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface AutocannonResult {
  latency: {
    average: number;
    stddev: number;
    min: number;
    max: number;
    p2_5: number;
    p50: number;
    p97_5: number;
    p99: number;
  };
  requests: {
    average: number;
    stddev: number;
    min: number;
    max: number;
    p1: number;
    p2_5: number;
    p50: number;
    p97_5: number;
    total: number;
  };
  throughput: {
    average: number;
    stddev: number;
    min: number;
    max: number;
    p2_5: number;
    p50: number;
    p97_5: number;
    p99: number;
    total: number;
  };
  duration: number;
  start: string;
  finish: string;
  connections: number;
  pipelining: number;
  url: string;
}

@Injectable()
export class BenchmarkComparisonService {
  
  async runAutocannon(url: string, options: any = {}): Promise<AutocannonResult> {
    return new Promise((resolve, reject) => {
      const query = options.query || `
        query {
          __typename
        }
      `;
      
      const body = JSON.stringify({
        query: query.trim(),
        variables: options.variables || {}
      });

      const args = [
        '--json',
        '--method', 'POST',
        '--headers', 'Content-Type=application/json',
        '--body', body,
        '--connections', (options.connections || 10).toString(),
        '--pipelining', (options.pipelining || 1).toString(),
        '--duration', (options.duration || 10).toString(),
        url
      ];

      const autocannon = spawn('autocannon', args);
      let output = '';
      let errorOutput = '';

      autocannon.stdout.on('data', (data) => {
        output += data.toString();
      });

      autocannon.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      autocannon.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Autocannon failed: ${errorOutput}`));
          return;
        }
        
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse JSON output: ${error.message}`));
        }
      });
    });
  }

  compareResults(result1: AutocannonResult, result2: AutocannonResult): void {
    console.log('\n🔥 AUTOCANNON BENCHMARK COMPARISON 🔥\n');
    
    // Create comparison table
    this.printComparisonTable(result1, result2);
    
    // Summary
    this.printSummary(result1, result2);
  }

  private printComparisonTable(result1: AutocannonResult, result2: AutocannonResult): void {
    const formatMs = (ms: number) => `${ms.toFixed(2)} ms`;
    const formatReq = (req: number) => req.toLocaleString();
    const formatMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    const formatKB = (bytes: number) => `${(bytes / 1024).toFixed(0)} kB`;

    console.log('┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
    console.log('│    Stat     │    2.5%     │     50%     │   97.5%     │     99%     │     Avg     │    Stdev    │     Max     │');
    console.log('├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
    console.log(`│   Latency   │ ${formatMs(result1.latency.p2_5).padEnd(11)} │ ${formatMs(result1.latency.p50).padEnd(11)} │ ${formatMs(result1.latency.p97_5).padEnd(11)} │ ${formatMs(result1.latency.p99).padEnd(11)} │ ${formatMs(result1.latency.average).padEnd(11)} │ ${formatMs(result1.latency.stddev).padEnd(11)} │ ${formatMs(result1.latency.max).padEnd(11)} │`);
    console.log('├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
    console.log('│    Stat     │      1%     │    2.5%     │     50%     │   97.5%     │     Avg     │    Stdev    │     Min     │');
    console.log('├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
    console.log(`│   Req/Sec   │ ${formatReq(result1.requests.p1).padEnd(11)} │ ${formatReq(result1.requests.p2_5).padEnd(11)} │ ${formatReq(result1.requests.p50).padEnd(11)} │ ${formatReq(result1.requests.p97_5).padEnd(11)} │ ${formatReq(result1.requests.average).padEnd(11)} │ ${formatReq(result1.requests.stddev).padEnd(11)} │ ${formatReq(result1.requests.min).padEnd(11)} │`);
    console.log(`│ Bytes/Sec   │ ${formatMB(result1.throughput.p2_5).padEnd(11)} │ ${formatMB(result1.throughput.p50).padEnd(11)} │ ${formatMB(result1.throughput.p97_5).padEnd(11)} │ ${formatMB(result1.throughput.p99).padEnd(11)} │ ${formatMB(result1.throughput.average).padEnd(11)} │ ${formatKB(result1.throughput.stddev).padEnd(11)} │ ${formatMB(result1.throughput.min).padEnd(11)} │`);
    console.log('└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');
    
    console.log(`\nReq/Bytes counts sampled once per second.`);
    console.log(`# of samples: ${Math.floor(result1.duration)}`);
    console.log(`\n${formatReq(result1.requests.total)} requests in ${result1.duration.toFixed(2)}s, ${formatMB(result1.throughput.total)} read\n`);

    // Second test results
    console.log('┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
    console.log('│    Stat     │    2.5%     │     50%     │   97.5%     │     99%     │     Avg     │    Stdev    │     Max     │');
    console.log('├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
    console.log(`│   Latency   │ ${formatMs(result2.latency.p2_5).padEnd(11)} │ ${formatMs(result2.latency.p50).padEnd(11)} │ ${formatMs(result2.latency.p97_5).padEnd(11)} │ ${formatMs(result2.latency.p99).padEnd(11)} │ ${formatMs(result2.latency.average).padEnd(11)} │ ${formatMs(result2.latency.stddev).padEnd(11)} │ ${formatMs(result2.latency.max).padEnd(11)} │`);
    console.log('├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
    console.log('│    Stat     │      1%     │    2.5%     │     50%     │   97.5%     │     Avg     │    Stdev    │     Min     │');
    console.log('├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
    console.log(`│   Req/Sec   │ ${formatReq(result2.requests.p1).padEnd(11)} │ ${formatReq(result2.requests.p2_5).padEnd(11)} │ ${formatReq(result2.requests.p50).padEnd(11)} │ ${formatReq(result2.requests.p97_5).padEnd(11)} │ ${formatReq(result2.requests.average).padEnd(11)} │ ${formatReq(result2.requests.stddev).padEnd(11)} │ ${formatReq(result2.requests.min).padEnd(11)} │`);
    console.log(`│ Bytes/Sec   │ ${formatMB(result2.throughput.p2_5).padEnd(11)} │ ${formatMB(result2.throughput.p50).padEnd(11)} │ ${formatMB(result2.throughput.p97_5).padEnd(11)} │ ${formatMB(result2.throughput.p99).padEnd(11)} │ ${formatMB(result2.throughput.average).padEnd(11)} │ ${formatKB(result2.throughput.stddev).padEnd(11)} │ ${formatMB(result2.throughput.min).padEnd(11)} │`);
    console.log('└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');
    
    console.log(`\nReq/Bytes counts sampled once per second.`);
    console.log(`# of samples: ${Math.floor(result2.duration)}`);
    console.log(`\n${formatReq(result2.requests.total)} requests in ${result2.duration.toFixed(2)}s, ${formatMB(result2.throughput.total)} read\n`);
  }

  private printSummary(result1: AutocannonResult, result2: AutocannonResult): void {
    console.log('📊 COMPARISON SUMMARY:\n');
    
    // Throughput comparison
    const throughputDiff = ((result1.requests.average - result2.requests.average) / result2.requests.average) * 100;
    const throughputWinner = result1.requests.average > result2.requests.average ? 'Test 1' : 'Test 2';
    console.log(`🚀 Throughput: ${throughputWinner} wins`);
    console.log(`   Test 1: ${result1.requests.average.toLocaleString()} req/s`);
    console.log(`   Test 2: ${result2.requests.average.toLocaleString()} req/s`);
    console.log(`   Difference: ${Math.abs(throughputDiff).toFixed(1)}%\n`);
    
    // Latency comparison
    const latencyDiff = ((result1.latency.average - result2.latency.average) / result2.latency.average) * 100;
    const latencyWinner = result1.latency.average < result2.latency.average ? 'Test 1' : 'Test 2';
    console.log(`⚡ Latency: ${latencyWinner} wins`);
    console.log(`   Test 1: ${result1.latency.average.toFixed(2)}ms avg`);
    console.log(`   Test 2: ${result2.latency.average.toFixed(2)}ms avg`);
    console.log(`   Difference: ${Math.abs(latencyDiff).toFixed(1)}%\n`);
    
    // Consistency comparison
    const consistencyWinner = result1.latency.stddev < result2.latency.stddev ? 'Test 1' : 'Test 2';
    console.log(`📈 Consistency: ${consistencyWinner} wins`);
    console.log(`   Test 1: ${result1.latency.stddev.toFixed(2)}ms std dev`);
    console.log(`   Test 2: ${result2.latency.stddev.toFixed(2)}ms std dev\n`);
    
    // Data transfer comparison
    const transferDiff = ((result1.throughput.average - result2.throughput.average) / result2.throughput.average) * 100;
    const transferWinner = result1.throughput.average > result2.throughput.average ? 'Test 1' : 'Test 2';
    console.log(`📤 Data Transfer: ${transferWinner} wins`);
    console.log(`   Test 1: ${(result1.throughput.average / 1024 / 1024).toFixed(2)} MB/s`);
    console.log(`   Test 2: ${(result2.throughput.average / 1024 / 1024).toFixed(2)} MB/s`);
    console.log(`   Difference: ${Math.abs(transferDiff).toFixed(1)}%\n`);
    
    // Total requests comparison
    const totalDiff = ((result1.requests.total - result2.requests.total) / result2.requests.total) * 100;
    const totalWinner = result1.requests.total > result2.requests.total ? 'Test 1' : 'Test 2';
    console.log(`📋 Total Work: ${totalWinner} wins`);
    console.log(`   Test 1: ${result1.requests.total.toLocaleString()} total requests`);
    console.log(`   Test 2: ${result2.requests.total.toLocaleString()} total requests`);
    console.log(`   Difference: ${Math.abs(totalDiff).toFixed(1)}%\n`);
  }

  async saveResults(result: AutocannonResult, filename: string): Promise<void> {
    const resultsDir = path.join(process.cwd(), 'benchmark-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const filepath = path.join(resultsDir, `${filename}.json`);
    fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
    console.log(`✅ Results saved to ${filepath}`);
  }

  loadResults(filename: string): AutocannonResult {
    const filepath = path.join(process.cwd(), 'benchmark-results', `${filename}.json`);
    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  }
}

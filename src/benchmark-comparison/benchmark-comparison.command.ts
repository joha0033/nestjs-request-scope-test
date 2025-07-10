import { Command, CommandRunner, Option } from 'nest-commander';
import type { BenchmarkComparisonService } from './benchmark-comparison.service';

interface BenchmarkOptions {
  connections: number;
  duration: number;
  pipelining: number;
  query1?: string;
  variables1?: string;
  query2?: string;
  variables2?: string;
}

@Command({
  name: 'benchmark:compare',
  description: 'Compare two different GraphQL queries against each other',
  arguments: '<url>',
})
export class BenchmarkComparisonCommand extends CommandRunner {
  constructor(private readonly benchmarkService: BenchmarkComparisonService) {
    super();
  }

  async run(passedParams: string[], options: BenchmarkOptions): Promise<void> {
    const [url] = passedParams;
    const {
      connections,
      duration,
      pipelining,
      query1,
      variables1,
      query2,
      variables2,
    } = options;

    // Default queries if not provided
    const defaultQuery1 = query1 || `query { __typename }`;
    const defaultQuery2 = query2 || query1 || `query { __typename }`;

    console.log(`🏁 Starting GraphQL query comparison for ${url}`);
    console.log(
      `⚙️  Config: ${connections} connections, ${duration}s duration, ${pipelining} pipelining`
    );
    console.log(
      `🔍 Query 1: ${defaultQuery1.substring(0, 100)}${defaultQuery1.length > 100 ? '...' : ''}`
    );
    console.log(
      `🔍 Query 2: ${defaultQuery2.substring(0, 100)}${defaultQuery2.length > 100 ? '...' : ''}`
    );
    console.log('');

    console.log(`🔄 Running Query 1 test...`);
    const result1 = await this.benchmarkService.runAutocannon(url, {
      connections,
      duration,
      pipelining,
      query: defaultQuery1,
      variables: variables1 ? JSON.parse(variables1) : undefined,
    });

    // Save first result
    await this.benchmarkService.saveResults(result1, `query1-${Date.now()}`);

    console.log('⏳ Waiting 3 seconds before next test...\n');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log(`🔄 Running Query 2 test...`);
    const result2 = await this.benchmarkService.runAutocannon(url, {
      connections,
      duration,
      pipelining,
      query: defaultQuery2,
      variables: variables2 ? JSON.parse(variables2) : undefined,
    });

    // Save second result
    await this.benchmarkService.saveResults(result2, `query2-${Date.now()}`);

    // Compare results
    this.benchmarkService.compareResults(result1, result2);
  }

  @Option({
    flags: '-c, --connections <number>',
    description: 'Number of concurrent connections',
    defaultValue: 10,
  })
  parseConnections(val: string): number {
    return parseInt(val);
  }

  @Option({
    flags: '-d, --duration <seconds>',
    description: 'Duration of test in seconds',
    defaultValue: 10,
  })
  parseDuration(val: string): number {
    return parseInt(val);
  }

  @Option({
    flags: '-p, --pipelining <number>',
    description: 'Number of pipelined requests',
    defaultValue: 1,
  })
  parsePipelining(val: string): number {
    return parseInt(val);
  }

  @Option({
    flags: '-r, --runs <number>',
    description: 'Number of test runs to compare',
    defaultValue: 2,
  })
  parseRuns(val: string): number {
    return parseInt(val);
  }

  @Option({
    flags: '-q1, --query1 <string>',
    description: 'First GraphQL query to benchmark',
  })
  parseQuery1(val: string): string {
    return val;
  }

  @Option({
    flags: '-v1, --variables1 <json>',
    description: 'Variables for first query as JSON string',
  })
  parseVariables1(val: string): string {
    return val;
  }

  @Option({
    flags: '-q2, --query2 <string>',
    description: 'Second GraphQL query to benchmark',
  })
  parseQuery2(val: string): string {
    return val;
  }

  @Option({
    flags: '-v2, --variables2 <json>',
    description: 'Variables for second query as JSON string',
  })
  parseVariables2(val: string): string {
    return val;
  }
}

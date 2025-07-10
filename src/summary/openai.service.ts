import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

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
export class OpenAIService {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  async summarize(fileA: string, fileB: string): Promise<string> {
    const systemPrompt = `
You are a benchmarking assistant. Compare the following two benchmark outputs and give a clear summary of performance differences and the impacts it can have on the user.
`;

    const userContent = `
File A:
\`\`\`json
${fileA}
\`\`\`

File B:
\`\`\`json
${fileB}
\`\`\`
`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    });

    return completion.choices[0].message.content ?? 'No summary generated.';
  }

  async summarizeLocustResults(metrics: LocustMetrics[]): Promise<string> {
    const systemPrompt = `
You are a load testing analyst specializing in Locust results. Analyze the following load testing data and provide:

1. **Performance Summary**: Overall performance assessment across all scenarios
2. **Query Rankings**: Rank GraphQL queries by performance (fastest to slowest)
3. **Bottleneck Analysis**: Identify potential performance bottlenecks
4. **Scenario Comparison**: Compare different test scenarios and their implications
5. **Recommendations**: Actionable recommendations for performance optimization
6. **Key Insights**: Important insights about system behavior under load

Focus on practical insights that developers can use to improve their GraphQL API performance.
`;

    const metricsJson = JSON.stringify(metrics, null, 2);
    const userContent = `
Analyze these Locust load testing results:

\`\`\`json
${metricsJson}
\`\`\`

Provide a comprehensive analysis with rankings, comparisons, and actionable recommendations.
`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    });

    return completion.choices[0].message.content ?? 'No analysis generated.';
  }

  async compareAutoccannonWithLocust(autocannonData: string, locustMetrics: LocustMetrics): Promise<string> {
    const systemPrompt = `
You are a performance testing expert. Compare Autocannon benchmark results with Locust load testing results for the same GraphQL API.

Provide:
1. **Methodology Comparison**: How the two tools differ in their approach
2. **Performance Correlation**: How results correlate between tools
3. **Insights**: What each tool reveals about system performance
4. **Recommendations**: When to use each tool and how to interpret results together
5. **Bottleneck Identification**: Common bottlenecks identified by both tools
`;

    const userContent = `
Compare these two testing approaches:

**Autocannon Results:**
\`\`\`json
${autocannonData}
\`\`\`

**Locust Results:**
\`\`\`json
${JSON.stringify(locustMetrics, null, 2)}
\`\`\`

Provide a detailed comparison and analysis.
`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    });

    return completion.choices[0].message.content ?? 'No comparison generated.';
  }

  async rankQueries(metrics: LocustMetrics[]): Promise<string> {
    const systemPrompt = `
You are a GraphQL performance analyst. Analyze the query performance data and provide:

1. **Performance Rankings**: Rank queries from best to worst performing
2. **Performance Metrics**: Key metrics for each query (RPS, response time, error rate)
3. **Performance Insights**: Why certain queries perform better/worse
4. **Optimization Recommendations**: Specific recommendations for improving slow queries
5. **Scaling Considerations**: How each query might behave under increased load

Focus on actionable insights for GraphQL optimization.
`;

    const userContent = `
Analyze and rank these GraphQL query performance results:

\`\`\`json
${JSON.stringify(metrics, null, 2)}
\`\`\`

Provide detailed rankings with performance analysis and optimization recommendations.
`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    });

    return completion.choices[0].message.content ?? 'No ranking generated.';
  }
}

import { Command, CommandRunner } from 'nest-commander';
import { OpenAIService } from './openai.service';
import { readFile, readdir } from 'fs/promises';
import { resolve, join } from 'path';

const RESULTS_DIR = resolve('./benchmark-results');

@Command({ name: 'summary', description: 'Compare latest benchmark results using AI' })
export class OpenAICommand extends CommandRunner {
  constructor(private readonly openaiService: OpenAIService) {
    super();
  }

  async run(): Promise<void> {
    const latestQuery1 = await this.getLatestFile('query1-');
    const latestQuery2 = await this.getLatestFile('query2-');

    if (!latestQuery1 || !latestQuery2) {
      console.error('❌ Could not find both query1 and query2 files.');
      return;
    }

    const [fileAContent, fileBContent] = await Promise.all([
      readFile(latestQuery1, 'utf-8'),
      readFile(latestQuery2, 'utf-8'),
    ]);

    console.log(`🗂️ Using files:\n- ${latestQuery1}\n- ${latestQuery2}`);
    console.log('\n⏳ Generating summary...\n');

    const summary = await this.openaiService.summarize(fileAContent, fileBContent);

    console.log('\n✅ Summary:\n');
    console.log(summary);
  }

  private async getLatestFile(prefix: string): Promise<string | null> {
    const files = await readdir(RESULTS_DIR);

    const matched = files
      .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
      .map((f) => ({
        name: f,
        timestamp: this.extractTimestamp(f),
      }))
      .filter((f) => !isNaN(f.timestamp))
      .sort((a, b) => b.timestamp - a.timestamp);

    return matched.length ? join(RESULTS_DIR, matched[0].name) : null;
  }

  private extractTimestamp(fileName: string): number {
    const match = fileName.match(/(\d+)(?=\.json$)/);
    return match ? Number(match[1]) : NaN;
  }
}

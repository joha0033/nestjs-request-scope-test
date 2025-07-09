import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class OpenAIService {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  async summarize(fileA: string, fileB: string): Promise<string> {
    const systemPrompt = `
You are a benchmarking assistant. Compare the following two benchmark outputs and give a clear, human-readable summary of performance differences, regressions, and improvements.
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
}

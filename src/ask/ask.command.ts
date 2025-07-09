import { Command, CommandRunner } from 'nest-commander';
import { OpenAI } from 'openai';
import chalk from 'chalk';

@Command({
  name: 'ask-gpt',
  description: 'Ask a question to ChatGPT using the OpenAI SDK',
})
export class AskGptCommand extends CommandRunner {
  async run(passedParams: string[]): Promise<void> {
    const question = passedParams.join(' ');
    if (!question) {
      console.error(chalk.red('❌ Please provide a question.'));
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error(chalk.red('❌ OPENAI_API_KEY is not set.'));
      return;
    }

    const openai = new OpenAI({ apiKey });

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: question }],
        temperature: 0.7,
      });

      const answer = chatCompletion.choices[0].message?.content?.trim();
      console.log(chalk.green.bold('\n🤖 ChatGPT says:\n'));
      console.log(chalk.white(answer || 'No response.'));
    } catch (error: any) {
      console.error(chalk.red('❌ Error:'), error?.message || error);
    }
  }
}

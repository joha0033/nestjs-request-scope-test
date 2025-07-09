import { CommandFactory } from 'nest-commander';
import { OpenAIModule } from './summary/openai.module';


async function bootstrap() {
  await CommandFactory.run(OpenAIModule, ['log', 'warn', 'error']);
}
bootstrap();

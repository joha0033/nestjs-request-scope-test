import { CommandFactory } from 'nest-commander';
import { OpenAIModule } from './summary/openai.module';

async function bootstrap() {
  await CommandFactory.run(OpenAIModule, {
    errorHandler: (err) => {
      console.error('Locust Summary CLI Error:', err);
      process.exit(1);
    },
    logger: false,
  });
}

bootstrap(); 

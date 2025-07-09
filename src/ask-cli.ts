import 'dotenv/config';
import { CommandFactory } from 'nest-commander';
import { AskGptModule } from './ask/ask.module';

async function bootstrap() {
  await CommandFactory.run(AskGptModule, {
    errorHandler: (err) => {
      console.error('CLI Error:', err);
    },
  });
}

bootstrap();

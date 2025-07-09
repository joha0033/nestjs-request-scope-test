import { CommandFactory } from 'nest-commander';
import { BenchmarkComparisonModule } from './benchmark-comparison/benchmark-comparison.module';


async function bootstrap() {
  await CommandFactory.run(BenchmarkComparisonModule, ['log', 'warn', 'error']);
}
bootstrap();

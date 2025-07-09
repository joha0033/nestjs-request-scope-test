// benchmark-comparison.module.ts
import { Module } from '@nestjs/common';
import { BenchmarkComparisonService } from './benchmark-comparison.service';
import { BenchmarkComparisonCommand } from './benchmark-comparison.command';

@Module({
  providers: [BenchmarkComparisonService, BenchmarkComparisonCommand],
  exports: [BenchmarkComparisonService],
})
export class BenchmarkComparisonModule {}

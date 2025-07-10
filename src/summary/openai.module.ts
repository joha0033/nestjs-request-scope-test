// src/summary/openai.module.ts
import { Module } from '@nestjs/common';

import { OpenAIService } from './openai.service';
import { OpenAICommand } from './openai.command';
import { LocustSummaryCommand } from './locust-summary.command';
import { LocustParserService } from './locust-parser.service';

@Module({
  providers: [OpenAICommand, OpenAIService, LocustSummaryCommand, LocustParserService],
  exports: [OpenAIService, LocustParserService],
})
export class OpenAIModule {}

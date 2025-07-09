// src/cli/cli.module.ts
import { Module } from '@nestjs/common';

import { OpenAIService } from './openai.service';
import { OpenAICommand } from './openai.command';

@Module({
  providers: [OpenAICommand, OpenAIService],
})
export class OpenAIModule {}

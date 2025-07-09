import { Module } from '@nestjs/common';
import { AskGptCommand } from './ask.command';


@Module({
  providers: [AskGptCommand],
})
export class AskGptModule {}

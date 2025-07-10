import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { UserResolver } from './user/user.resolver';
import { LoggerService } from './logger/logger.service';
import { ProductResolver } from './products/product.resolver';
import { PaymentResolver } from './payment/payment.resolver';
import { UserService } from './user/user.service';
import { PaymentService } from './payment/payment.service';
import { ProductService } from './products/product.service';
import { BenchmarkComparisonModule } from './benchmark-comparison/benchmark-comparison.module';
import { OpenAIService } from './summary/openai.service';
import { OpenAIModule } from './summary/openai.module';
import { AskGptCommand } from './ask/ask.command';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
    }),
    BenchmarkComparisonModule,
    OpenAIModule,
  ],
  providers: [
    AskGptCommand,
    OpenAIService,
    UserResolver,
    UserService,
    LoggerService,
    PaymentResolver,
    PaymentService,
    ProductResolver,
    ProductService,
  ],
})
export class AppModule {}

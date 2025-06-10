import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver,  ApolloDriverConfig } from '@nestjs/apollo';
import { UserResolver } from './user/user.resolver';
import { UserServiceReqScoped } from './user/user-request.service';
import { UserServiceSingleton } from './user/user-singleton.service';
import { UserRequestScopedResolver } from './user/user-request-scoped.resolver';
import { UserSingletonRequestScopedDepResolver } from './user/user-singleton-request-scoped-dep.resolver';
import { UserServiceSingletonRequestScopedDep } from './user/user-singleton-request-scoped-dep.service';
import { LoggerService } from './logger/logger.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
    }),
  ],
  providers: [
    UserResolver, 
    UserRequestScopedResolver, 
    UserServiceReqScoped, 
    UserServiceSingleton,
    
    LoggerService,
    // Logger service (req-scoped) is a dep of these.
    UserSingletonRequestScopedDepResolver,
    UserServiceSingletonRequestScopedDep,
  ],
})
export class AppModule {}

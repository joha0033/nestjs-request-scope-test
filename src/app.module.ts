import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver,  ApolloDriverConfig } from '@nestjs/apollo';
import { UserResolver } from './user/user.resolver';
import { UserServiceReqScoped } from './user/user-request.service';
import { UserServiceSingleton } from './user/user-singleton.service';
import { UserRequestScopedResolver } from './user/user-request-scoped.resolves';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
    }),
  ],
  providers: [UserResolver, UserRequestScopedResolver, UserServiceReqScoped, UserServiceSingleton],
})
export class AppModule {}

import { Context, Query, Resolver } from "@nestjs/graphql";
import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { UserServiceReqScoped } from "./user-request.service";
import { UserServiceSingleton } from "./user-singleton.service";

@Resolver()
@Injectable()
export class UserResolver {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly userServiceSingleton: UserServiceSingleton,
  ) {}

  @Query(() => String)
  getUserInfoSingleton(@Context() context: any): string {
    const user = this.userServiceSingleton.getUser(context);
    return `${user.name}`;
  }

  @Query(() => String)
  async getUserInfoRequestScoped(): Promise<string> {
    const userServiceReqScoped = await this.moduleRef.resolve(UserServiceReqScoped);
    const user = userServiceReqScoped.getUser();
    return `${user.name}`;
  }
}

import { Context, Query, Resolver } from "@nestjs/graphql";
import { UserServiceReqScoped } from "./user-request.service";
import { Inject } from "@nestjs/common";
import { UserServiceSingleton } from "./user-singleton.service";

@Resolver()
export class UserRequestScopedResolver {
  @Inject() userServiceReqScoped: UserServiceReqScoped;
  @Inject() userServiceSingleton: UserServiceSingleton;

  @Query(() => String)
  getUserInfoSingletonInRequestScopedResolver(
    @Context() context: any,
  ) {
    const userA = this.userServiceSingleton.getUser(context);
    return `${userA.name}`;
  }

  @Query(() => String)
  getUserInfoRequestScopedInRequestScopedResolver() {
    const userA = this.userServiceReqScoped.getUser();
    return `${userA.name}`;
  }
}

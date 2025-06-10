import { Context, Query, Resolver } from "@nestjs/graphql";
import { UserServiceReqScoped } from "./user-request.service";
import { Inject } from "@nestjs/common";
import { UserServiceSingleton } from "./user-singleton.service";
import { UserServiceSingletonRequestScopedDep } from "./user-singleton-request-scoped-dep.service";

@Resolver()
export class UserSingletonRequestScopedDepResolver {
  @Inject() userServiceSingletonRequestScopedDep: UserServiceSingletonRequestScopedDep;

  @Query(() => String)
  getUserInfoRequestScopedInRequestScopedResolver() {
    const userA = this.userServiceSingletonRequestScopedDep.getUser();
    return `${userA.name}`;
  }
}

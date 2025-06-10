import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";

@Injectable({ scope: Scope.REQUEST })
export class UserServiceReqScoped {
  @Inject(REQUEST) private readonly context: any;
  constructor() {
    console.log('Service Instantiated');
  }

  getUser() {
    return { id: 1, name: 'User' };
  }
}

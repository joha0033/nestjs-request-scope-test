import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";


export class UserServiceReqScoped {
  // This is the same as..
  // @Injectable({ scope: Scope.REQUEST })!!
  @Inject(REQUEST) private readonly context: any;
  constructor() {
    console.log('Service Instantiated');
  }

  getUser() {
    return { id: 1, name: 'User' };
  }
}

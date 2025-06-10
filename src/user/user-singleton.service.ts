import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";

@Injectable()
export class UserServiceSingleton {
  constructor() {
    console.log('Service Instantiated');
  }

  getUser(context: any = null) {
    return { id: 1, name: 'User' };
  }
}

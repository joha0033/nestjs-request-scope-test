import { Injectable } from "@nestjs/common";

@Injectable()
export class UserServiceSingleton {
  constructor() {
    console.log('Service Instantiated');
  }

  getUser(context: any = null) {
    return { id: 1, name: 'User' };
  }
}

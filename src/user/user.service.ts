import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor() {
    console.count('NOT, REPEAT, NOT REQ SCOPED - UserService Instantiated');
  }

  getUser(context: any = null) {
    return { id: 1, name: 'User' };
  }
}

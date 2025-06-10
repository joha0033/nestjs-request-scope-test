import { Inject, Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";

@Injectable()
export class UserServiceSingletonRequestScopedDep {
  @Inject() readonly loggerService: LoggerService;

  constructor() {
    console.log('Service Instantiated... b/c it is a singleton w/ a request scoped dependency');
  }

  getUser(context: any = null) {
    return { id: 1, name: 'User' };
  }
}

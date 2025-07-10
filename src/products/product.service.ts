import { Inject, Injectable } from '@nestjs/common';
import type { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class ProductService {
  // This is a singleton service, but it has a request scoped dependency.
  // This means that the loggerService will be injected as a request scoped dependency.
  // The loggerService will be created once per request, but the ProductService will be created once per application.
  @Inject() readonly loggerService: LoggerService;

  constructor() {
    console.count('REQ SCOPED (by dep) - ProductService Instantiated');
  }

  getProduct() {
    return { id: 1, name: 'Product' };
  }
}

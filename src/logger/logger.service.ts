import { Inject, Injectable, Optional, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";

// This LoggerService is a REQUEST that can be used to impact the application performance.
@Injectable({scope: Scope.REQUEST})
export class LoggerService {
  @Optional() @Inject(REQUEST) context: any;

  public log(message: string): void {
    console.log(`[LOG] ${message}`);
  }

  public error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }

  public warn(message: string): void {
    console.warn(`[WARN] ${message}`);
  }
}


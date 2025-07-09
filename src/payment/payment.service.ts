import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";


export class PaymentService {
  // This is the same as..
  // @Injectable({ scope: Scope.REQUEST })!!
  @Inject(REQUEST) private readonly context: any;
  constructor() {
    console.count('REQ SCOPED - PaymentService Instantiated');
  }

  getPayment() {
    return { id: 1, amount: 'PAY ME: $100' };
  }
}

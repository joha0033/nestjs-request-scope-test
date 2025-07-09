import { Context, Query, Resolver } from '@nestjs/graphql';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PaymentService } from '../payment/payment.service';
import { UserService } from './user.service';

@Resolver()
@Injectable()
export class UserResolver {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly userService: UserService,
  ) {}

  @Query(() => String)
  getUser(@Context() context: any): string {
    const user = this.userService.getUser(context);
    return `${user.name}`;
  }

  // This is a non-request-scoped resolver that uses the PaymentService
  // which is request-scoped.
  // This is a good example of how to use request-scoped services
  // in a non-request-scoped resolver.
  @Query(() => String)
  async getUserPayment(): Promise<string> {
    const paymentService = await this.moduleRef.resolve(PaymentService);
    const payment = paymentService.getPayment();
    return `${payment.amount}`;
  }
}

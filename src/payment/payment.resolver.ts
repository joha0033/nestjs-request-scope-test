import { Context, Query, Resolver } from "@nestjs/graphql";
import { PaymentService } from "./payment.service";
import { Inject } from "@nestjs/common";

@Resolver()
export class PaymentResolver {
  @Inject() paymentService: PaymentService;

  @Query(() => String)
  getPayment() {
    const payment = this.paymentService.getPayment();
    return `${payment.amount}`;
  }
}

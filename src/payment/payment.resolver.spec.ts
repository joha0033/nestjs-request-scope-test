import { Test, TestingModule } from '@nestjs/testing';
import { REQUEST } from '@nestjs/core';
import { PaymentResolver } from './payment.resolver';
import { PaymentService } from './payment.service';

describe('PaymentResolver', () => {
  let resolver: PaymentResolver;

  beforeEach(async () => {
    const mockRequest = {
      url: '/test',
      method: 'GET',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentResolver,
        PaymentService,
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    resolver = module.get<PaymentResolver>(PaymentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getPayment', () => {
    it('should return payment amount', () => {
      const result = resolver.getPayment();
      expect(result).toBe('PAY ME: $100');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { REQUEST } from '@nestjs/core';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const mockRequest = {
      url: '/test',
      method: 'GET',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPayment', () => {
    it('should return a payment object', () => {
      const result = service.getPayment();
      expect(result).toEqual({ id: 1, amount: 'PAY ME: $100' });
    });
  });
});

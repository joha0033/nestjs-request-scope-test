import { Test, TestingModule } from '@nestjs/testing';
import { ModuleRef } from '@nestjs/core';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { PaymentService } from '../payment/payment.service';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let moduleRef: ModuleRef;

  beforeEach(async () => {
    const mockModuleRef = {
      resolve: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        UserService,
        {
          provide: ModuleRef,
          useValue: mockModuleRef,
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    moduleRef = module.get<ModuleRef>(ModuleRef);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getUser', () => {
    it('should return user name', () => {
      const context = { requestId: 'test-123' };
      const result = resolver.getUser(context);
      expect(result).toBe('User');
    });
  });

  describe('getUserPayment', () => {
    it('should return payment amount', async () => {
      const mockPaymentService = {
        getPayment: jest
          .fn()
          .mockReturnValue({ id: 1, amount: 'PAY ME: $100' }),
      };

      (moduleRef.resolve as jest.Mock).mockResolvedValue(mockPaymentService);

      const result = await resolver.getUserPayment();
      expect(result).toBe('PAY ME: $100');
      expect(moduleRef.resolve).toHaveBeenCalledWith(PaymentService);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { LoggerService } from '../logger/logger.service';

describe('ProductResolver', () => {
  let resolver: ProductResolver;

  beforeEach(async () => {
    const mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductResolver,
        ProductService,
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    resolver = module.get<ProductResolver>(ProductResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getProduct', () => {
    it('should return product name', () => {
      const result = resolver.getProduct();
      expect(result).toBe('Product');
    });
  });
});

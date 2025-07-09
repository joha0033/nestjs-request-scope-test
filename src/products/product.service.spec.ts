import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { LoggerService } from '../logger/logger.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProduct', () => {
    it('should return a product object', () => {
      const result = service.getProduct();
      expect(result).toEqual({ id: 1, name: 'Product' });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { REQUEST } from '@nestjs/core';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  let module: TestingModule;

  beforeEach(async () => {
    const mockRequest = {
      url: '/test',
      method: 'GET',
    };

    module = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();
  });

  it('should be defined', async () => {
    service = await module.resolve<LoggerService>(LoggerService);
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should log a message', async () => {
      service = await module.resolve<LoggerService>(LoggerService);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      service.log('test message');
      expect(consoleSpy).toHaveBeenCalledWith('[LOG] test message');
      consoleSpy.mockRestore();
    });
  });

  describe('error', () => {
    it('should log an error message', async () => {
      service = await module.resolve<LoggerService>(LoggerService);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      service.error('test error');
      expect(consoleSpy).toHaveBeenCalledWith('[ERROR] test error');
      consoleSpy.mockRestore();
    });
  });

  describe('warn', () => {
    it('should log a warning message', async () => {
      service = await module.resolve<LoggerService>(LoggerService);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      service.warn('test warning');
      expect(consoleSpy).toHaveBeenCalledWith('[WARN] test warning');
      consoleSpy.mockRestore();
    });
  });
});

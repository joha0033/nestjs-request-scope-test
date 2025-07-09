import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    it('should return a user object', () => {
      const result = service.getUser();
      expect(result).toEqual({ id: 1, name: 'User' });
    });

    it('should return a user object with context', () => {
      const context = { requestId: 'test-123' };
      const result = service.getUser(context);
      expect(result).toEqual({ id: 1, name: 'User' });
    });
  });
});

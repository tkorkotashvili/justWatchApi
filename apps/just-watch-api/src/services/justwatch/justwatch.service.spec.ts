import { Test, TestingModule } from '@nestjs/testing';
import { JustwatchService } from './justwatch.service';

describe('JustwatchService', () => {
  let service: JustwatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JustwatchService],
    }).compile();

    service = module.get<JustwatchService>(JustwatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

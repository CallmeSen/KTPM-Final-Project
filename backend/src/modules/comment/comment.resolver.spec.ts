import { Test, TestingModule } from '@nestjs/testing';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { beforeEach, describe, it } from 'node:test';

describe('CommentResolver', () => {
  let resolver: CommentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentResolver, CommentService],
    }).compile();

    resolver = module.get<CommentResolver>(CommentResolver);
  });

});


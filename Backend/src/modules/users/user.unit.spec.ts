// =========================
// user.unit.test.ts
// =========================
import {  TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MailService } from 'src/mails/mail.service';
import { CartService } from 'src/modules/cart/cart.service';

const mockUserRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  preload: jest.fn(),
});

describe('UserService (Unit)', () => {
  let service: UserService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
        { provide: MailService, useValue: {} },
        { provide: CartService, useValue: { createCart: jest.fn() } },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(getRepositoryToken(User));
  });

  describe('createUser()', () => {
    it('should create user successfully', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({ email: 'new@test.com' } as User);
      repo.save.mockResolvedValue({ id: '1', username: 'test' } as User);

      const result = await service.createUser({
        email: 'new@test.com',
        username: 'test',
        password: '123456',
      } as any);

      expect(result).toEqual({ id: '1', username: 'test' });
    });

    it('should throw error if email exists', async () => {
      repo.findOne.mockResolvedValue({ id: '1' } as User);

      await expect(
        service.createUser({ email: 'exist@test.com' } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('getUserById()', () => {
    it('should return user', async () => {
      repo.findOne.mockResolvedValue({ id: '1' } as User);
      const user = await service.getUserById('1');
      expect(user.id).toBe('1');
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.getUserById('999')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});

// =========================
// user.integration.test.ts
// =========================
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/modules/users/entities/user.entity';
import { UserService } from 'src/modules/users/users.service';
import { UserModule } from 'src/modules/users/users.module';


describe('User API (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          database: ':memory:',
          dropSchema: true,
          entities: [User],
          synchronize: true,
        }),
        UserModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('IT_USER_CreateUser_Valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'new_valid@test.com',
          username: 'validuser',
          password: '123456',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('IT_USER_CreateUser_InvEmailFmt', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email',
          username: 'bad',
          password: '123456',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /users/:id', () => {
    it('IT_USER_GetById_NotFound', async () => {
      const res = await request(app.getHttpServer()).get('/users/999');
      expect(res.status).toBe(404);
    });
  });
});

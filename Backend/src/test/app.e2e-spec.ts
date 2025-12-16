import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('App (E2E) MySQL', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Override DB connection cho test
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: 'password123',
          database: 'nestjs_test',
          autoLoadEntities: true,
          synchronize: true,  // tạo schema tự động
          dropSchema: true,   // xóa schema trước khi test
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Database connection should be OK', async () => {
    // đơn giản gọi một repository để kiểm tra
    const response = await request(app.getHttpServer()).get('/books');
    expect(response.status).toBe(200);
  });

  it('POST /books - create book in MySQL', async () => {
    const newBook = {
      title: 'Test Book MySQL',
      authors: 'John Doe',
      categories: 'Science',
      description: 'Book for testing',
      published_year: 2024,
      average_rating: 4.5,
      num_pages: 100,
      price: 120,
    };

    const response = await request(app.getHttpServer())
      .post('/books')
      .send(newBook)
      .expect(201);

    expect(response.body.title).toBe('Test Book MySQL');
  });
});

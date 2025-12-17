import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { describe, it } from 'node:test';

describe('App (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // import toàn bộ app
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /books - should return all books', async () => {
    const response = await request(app.getHttpServer()).get('/books');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('POST /books - should create a book', async () => {
    const newBook = {
      title: 'Test Book',
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

    expect(response.body.title).toBe('Test Book');
  });
});

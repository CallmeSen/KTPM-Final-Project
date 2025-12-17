import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { GoogleStrategy } from 'src/modules/auth/stragegies/google.strategy';

describe('Comment Integration Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
    // ✅ Override GoogleStrategy để test không cần clientID/secret
    .overrideProvider(GoogleStrategy)
    .useValue({
      validate: jest.fn().mockResolvedValue({ id: 'mockUser' }),
    })
    .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET comments by book - flat list', async () => {
    const res = await request(app.getHttpServer())
      .get('/comments/book/101')
      .expect(200);

    expect(res.body.length).toBe(3);
    expect(res.body[0].children).toBeDefined();
  });

  it('GET nested comments tree', async () => {
    const res = await request(app.getHttpServer())
      .get('/comments/book/101')
      .expect(200);

    const root = res.body[0];
    expect(root.children[0].children.length).toBeGreaterThan(0);
  });

  it('Add comment with XSS payload', async () => {
    const payload = '<script>alert(1)</script>';

    const res = await request(app.getHttpServer())
      .post('/comments')
      .send({ content: payload, bookId: '101', userId: 'U1' })
      .expect(201);

    expect(res.body.content).not.toContain('<script>');
  });
});

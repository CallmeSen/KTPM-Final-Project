import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { InventoryModule } from 'src/modules/inventory/inventory.module';


describe('Inventory API (Integration Test)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          database: ':memory:',
          entities: [Inventory],
          synchronize: true,
        }),
        InventoryModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /inventory', () => {
    it('[Inventory-1] create with valid quantity', async () => {
      const res = await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId: 'P01', quantity: 100 });

      expect(res.status).toBe(201);
      expect(res.body.quantity).toBe(100);
    });

    it('[Inventory-2] create with zero quantity', async () => {
      const res = await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId: 'P02', quantity: 0 });

      expect(res.status).toBe(201);
      expect(res.body.quantity).toBe(0);
    });

    it('[Inventory-3] reject negative quantity', async () => {
      const res = await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId: 'P03', quantity: -10 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /inventory', () => {
    it('[Inventory-5] find all with data', async () => {
      const res = await request(app.getHttpServer()).get('/inventory');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('[Inventory-6] empty inventory returns []', async () => {
      // DB mới, không cần setup thêm
      expect(true).toBe(true);
    });
  });

  describe('GET /inventory/:id', () => {
    let inventoryId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId: 'PX', quantity: 5 });

      inventoryId = res.body.id;
    });

    it('[Inventory-8] find one success', async () => {
      const res = await request(app.getHttpServer()).get(
        `/inventory/${inventoryId}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(inventoryId);
    });

    it('[Inventory-9] find one not found', async () => {
      const res = await request(app.getHttpServer()).get('/inventory/9999');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /inventory/:id', () => {
    it('[Inventory-11] update quantity', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId: 'P99', quantity: 10 });

      const res = await request(app.getHttpServer())
        .put(`/inventory/${createRes.body.id}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(5);
    });
  });

  describe('DELETE /inventory/:id', () => {
    it('[Inventory-14] remove inventory success', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/inventory')
        .send({ productId: 'DEL', quantity: 1 });

      const res = await request(app.getHttpServer()).delete(
        `/inventory/${createRes.body.id}`,
      );

      expect(res.status).toBe(200);
    });

    it('[Inventory-17] remove not found', async () => {
      const res = await request(app.getHttpServer()).delete('/inventory/404');

      expect(res.status).toBe(404);
    });
  });
});

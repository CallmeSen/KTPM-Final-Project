import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { UserModule } from 'src/modules/users/users.module';




describe('User API (Integration)', () => {
let app: INestApplication;


beforeAll(async () => {
const moduleRef = await Test.createTestingModule({
imports: [
TypeOrmModule.forRoot({
type: 'sqlite',
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
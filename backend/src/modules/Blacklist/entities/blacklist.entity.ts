import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('blacklist')
export class Blacklist {
  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @Column({ type: 'text' })
  accessToken: string;
}

import { User } from 'src/modules/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  amount: number; 

  @Column()
  currency: string;

  @Column()
  status: string; 

  @Column({ nullable: true })
  stripePaymentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.payments, { onDelete: 'CASCADE' })
  user: User;
}

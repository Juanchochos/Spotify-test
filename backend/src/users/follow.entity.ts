import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';

@Entity('follow')
@Unique(['followerId', 'followingId'])
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  followerId: number;

  @Index()
  @Column()
  followingId: number;

  @CreateDateColumn()
  createdAt: Date;
}

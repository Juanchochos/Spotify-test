import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { SongEntry } from './song-entry.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  description: string | null;

  @OneToMany(() => SongEntry, (s) => s.post, { eager: true, cascade: true })
  songs: SongEntry[];

  @CreateDateColumn()
  createdAt: Date;
}

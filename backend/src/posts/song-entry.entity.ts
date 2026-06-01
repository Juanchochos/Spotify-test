import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class SongEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @ManyToOne(() => Post, (p) => p.songs, { onDelete: 'CASCADE' })
  post: Post;

  @Column()
  spotifyTrackId: string;

  @Column()
  trackName: string;

  @Column()
  artistName: string;

  @Column()
  albumName: string;

  @Column({ nullable: true })
  albumImageUrl: string | null;

  @Column()
  position: number;

  @Column({ nullable: true })
  description: string | null;
}

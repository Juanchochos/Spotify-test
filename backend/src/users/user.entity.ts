import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true, type: 'simple-json' })
  spotifyProfile: any | null;

  @Column({ nullable: true })
  spotifyId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  TableInheritance,
} from 'typeorm';

import { UserType } from '../enums/user-type.enum';

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'text' })
  type!: UserType;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  refreshToken?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

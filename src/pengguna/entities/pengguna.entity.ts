import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  OneToMany, OneToOne,
} from 'typeorm';
import { UserStatus } from '../../common/enums/user-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';

@Entity('pengguna')
export class Pengguna {
  @PrimaryGeneratedColumn()
  id_pengguna!: number; // ← PASTIKAN BARIS INI SUDAH TERTULIS SEPERTI INI

  @Column({ length: 100 })
  nama!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  @Column({ length: 255 })
  password!: string;

  @Column({ nullable: true, length: 20 })
  no_telepon!: string;

  @CreateDateColumn()
  tanggal_daftar!: Date;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.AKTIF })
  status!: UserStatus;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  // Hubungan relasi tiruan (placeholder) agar tidak circular dependency
  @OneToMany('Pemesanan', 'pengguna')
  pemesanan!: any[];

  @OneToMany('Notifikasi', 'pengguna')
  notifikasi!: any[];

  @OneToOne('Admin', 'pengguna')
  admin!: any;
}
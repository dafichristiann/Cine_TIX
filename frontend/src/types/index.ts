export interface User {
  id: number;
  nama: string | null;
  email: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Film {
  id_film: number;
  judul: string;
  genre: string;
  durasi: number;
  rating: string;
  sinopsis: string;
  poster_url: string | null;
  tanggal_rilis: string;
  bahasa: string;
  status: string;
}

export interface Bioskop {
  id_bioskop: number;
  nama_bioskop: string;
  kota: string;
  alamat: string;
  telepon?: string;
}

export interface Studio {
  id_studio: number;
  id_bioskop?: number;
  nama_studio: string;
  kapasitas?: number;
  tipe: string;
  lantai?: number;
  bioskop: Bioskop;
}

export interface Kursi {
  id_kursi: number;
  nomor_kursi: string;
  baris: string;
  tipe_kursi: string;
}

export interface SlotKursi {
  id_slot: number;
  status: 'TERSEDIA' | 'TERKUNCI' | 'TERJUAL';
  locked_until: string | null;
  kursi: Kursi;
}

export interface Jadwal {
  id_jadwal: number;
  id_film: number;
  id_studio: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  harga: string | number;
  film: Film;
  studio: Studio;
  slots?: SlotKursi[];
}

export interface Pembayaran {
  id_pembayaran: number;
  metode: string;
  jumlah: string | number;
  status: 'PENDING' | 'BERHASIL' | 'GAGAL';
}

export interface DetailPemesanan {
  id_detail: number;
  harga_satuan: string | number;
  kode_tiket: string;
  slot: SlotKursi;
}

export interface Pemesanan {
  id_pemesanan: number;
  kode_booking: string;
  total_harga: string | number;
  jumlah_tiket: number;
  tgl_pesan: string;
  expired_at: string;
  status: 'PENDING' | 'LUNAS' | 'BATAL';
  jadwal: Jadwal;
  detail: DetailPemesanan[];
  pembayaran: Pembayaran | null;
}

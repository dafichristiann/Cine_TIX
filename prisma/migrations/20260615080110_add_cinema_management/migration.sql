-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'LUNAS', 'BATAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'BERHASIL', 'GAGAL');

-- CreateTable
CREATE TABLE "Bioskop" (
    "id_bioskop" SERIAL NOT NULL,
    "nama_bioskop" TEXT NOT NULL,
    "kota" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "telepon" TEXT NOT NULL,

    CONSTRAINT "Bioskop_pkey" PRIMARY KEY ("id_bioskop")
);

-- CreateTable
CREATE TABLE "Studio" (
    "id_studio" SERIAL NOT NULL,
    "id_bioskop" INTEGER NOT NULL,
    "nama_studio" TEXT NOT NULL,
    "kapasitas" INTEGER NOT NULL,
    "tipe" TEXT NOT NULL,
    "lantai" INTEGER NOT NULL,

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("id_studio")
);

-- CreateTable
CREATE TABLE "Film" (
    "id_film" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "durasi" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,
    "sinopsis" TEXT NOT NULL,
    "poster_url" TEXT,
    "tanggal_rilis" TIMESTAMP(3) NOT NULL,
    "bahasa" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'tidak_tayang',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Film_pkey" PRIMARY KEY ("id_film")
);

-- CreateTable
CREATE TABLE "Kursi" (
    "id_kursi" SERIAL NOT NULL,
    "id_studio" INTEGER NOT NULL,
    "nomor_kursi" TEXT NOT NULL,
    "baris" TEXT NOT NULL,
    "tipe_kursi" TEXT NOT NULL,

    CONSTRAINT "Kursi_pkey" PRIMARY KEY ("id_kursi")
);

-- CreateTable
CREATE TABLE "Jadwal" (
    "id_jadwal" SERIAL NOT NULL,
    "id_film" INTEGER NOT NULL,
    "id_studio" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jam_mulai" TEXT NOT NULL,
    "jam_selesai" TEXT NOT NULL,
    "harga" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Jadwal_pkey" PRIMARY KEY ("id_jadwal")
);

-- CreateTable
CREATE TABLE "SlotKursi" (
    "id_slot" SERIAL NOT NULL,
    "id_jadwal" INTEGER NOT NULL,
    "id_kursi" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "locked_until" TIMESTAMP(3),

    CONSTRAINT "SlotKursi_pkey" PRIMARY KEY ("id_slot")
);

-- CreateTable
CREATE TABLE "Pemesanan" (
    "id_pemesanan" SERIAL NOT NULL,
    "id_pengguna" INTEGER NOT NULL,
    "id_jadwal" INTEGER NOT NULL,
    "tgl_pesan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_harga" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "kode_booking" TEXT NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "jumlah_tiket" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pemesanan_pkey" PRIMARY KEY ("id_pemesanan")
);

-- CreateTable
CREATE TABLE "DetailPemesanan" (
    "id_detail" SERIAL NOT NULL,
    "id_pemesanan" INTEGER NOT NULL,
    "id_slot" INTEGER NOT NULL,
    "harga_satuan" DECIMAL(10,2) NOT NULL,
    "kode_tiket" TEXT NOT NULL,
    "qr_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DetailPemesanan_pkey" PRIMARY KEY ("id_detail")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id_pembayaran" SERIAL NOT NULL,
    "id_pemesanan" INTEGER NOT NULL,
    "id_pengguna" INTEGER NOT NULL,
    "metode" TEXT NOT NULL,
    "jumlah" DECIMAL(10,2) NOT NULL,
    "tgl_bayar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "ref_gateway" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id_pembayaran")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pemesanan_kode_booking_key" ON "Pemesanan"("kode_booking");

-- CreateIndex
CREATE UNIQUE INDEX "DetailPemesanan_kode_tiket_key" ON "DetailPemesanan"("kode_tiket");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_id_pemesanan_key" ON "Pembayaran"("id_pemesanan");

-- AddForeignKey
ALTER TABLE "Studio" ADD CONSTRAINT "Studio_id_bioskop_fkey" FOREIGN KEY ("id_bioskop") REFERENCES "Bioskop"("id_bioskop") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kursi" ADD CONSTRAINT "Kursi_id_studio_fkey" FOREIGN KEY ("id_studio") REFERENCES "Studio"("id_studio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jadwal" ADD CONSTRAINT "Jadwal_id_film_fkey" FOREIGN KEY ("id_film") REFERENCES "Film"("id_film") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jadwal" ADD CONSTRAINT "Jadwal_id_studio_fkey" FOREIGN KEY ("id_studio") REFERENCES "Studio"("id_studio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotKursi" ADD CONSTRAINT "SlotKursi_id_jadwal_fkey" FOREIGN KEY ("id_jadwal") REFERENCES "Jadwal"("id_jadwal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotKursi" ADD CONSTRAINT "SlotKursi_id_kursi_fkey" FOREIGN KEY ("id_kursi") REFERENCES "Kursi"("id_kursi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pemesanan" ADD CONSTRAINT "Pemesanan_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "Pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pemesanan" ADD CONSTRAINT "Pemesanan_id_jadwal_fkey" FOREIGN KEY ("id_jadwal") REFERENCES "Jadwal"("id_jadwal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPemesanan" ADD CONSTRAINT "DetailPemesanan_id_pemesanan_fkey" FOREIGN KEY ("id_pemesanan") REFERENCES "Pemesanan"("id_pemesanan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPemesanan" ADD CONSTRAINT "DetailPemesanan_id_slot_fkey" FOREIGN KEY ("id_slot") REFERENCES "SlotKursi"("id_slot") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_id_pemesanan_fkey" FOREIGN KEY ("id_pemesanan") REFERENCES "Pemesanan"("id_pemesanan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "Pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

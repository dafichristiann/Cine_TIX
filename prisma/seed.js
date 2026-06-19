require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const seatRows = ['A', 'B', 'C', 'D', 'E'];

async function getOrCreateBioskop() {
  const existing = await prisma.bioskop.findFirst({
    where: { nama_bioskop: 'CineTix Grand Galaxy' },
  });

  if (existing) return existing;

  return prisma.bioskop.create({
    data: {
      nama_bioskop: 'CineTix Grand Galaxy',
      kota: 'Jakarta',
      alamat: 'Jl. Sudirman No. 88, Jakarta Pusat',
      telepon: '0215550101',
    },
  });
}

async function getOrCreateFilm(data) {
  const existing = await prisma.film.findFirst({
    where: { judul: data.judul },
  });

  if (existing) return existing;

  return prisma.film.create({ data });
}

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  await prisma.pengguna.upsert({
    where: { email: 'admin@cinetix.id' },
    update: {},
    create: {
      email: 'admin@cinetix.id',
      password: adminPassword,
      nama: 'Admin CineTix',
      no_telepon: '081200000001',
      role: 'admin',
      status: 'active',
    },
  });

  await prisma.pengguna.upsert({
    where: { email: 'user@cinetix.id' },
    update: {},
    create: {
      email: 'user@cinetix.id',
      password: userPassword,
      nama: 'Penonton Demo',
      no_telepon: '081200000002',
      role: 'user',
      status: 'active',
    },
  });

  const bioskop = await getOrCreateBioskop();

  const existingStudio = await prisma.studio.findFirst({
    where: {
      id_bioskop: bioskop.id_bioskop,
      nama_studio: 'Studio 1',
    },
  });

  const studio = existingStudio || await prisma.studio.create({
    data: {
      id_bioskop: bioskop.id_bioskop,
      nama_studio: 'Studio 1',
      kapasitas: 50,
      tipe: 'REGULER',
      lantai: 2,
    },
  });

  const kursiData = seatRows.flatMap((baris) =>
    Array.from({ length: 10 }, (_, index) => ({
      id_studio: studio.id_studio,
      nomor_kursi: `${baris}${index + 1}`,
      baris,
      tipe_kursi: index >= 8 ? 'VIP' : 'REGULER',
    })),
  );

  const existingSeats = await prisma.kursi.count({
    where: { id_studio: studio.id_studio },
  });

  if (!existingSeats) {
    await prisma.kursi.createMany({ data: kursiData });
  }

  const films = await Promise.all([
    getOrCreateFilm({
      judul: 'Langit Setelah Senja',
      genre: 'Drama, Romantis',
      durasi: 118,
      rating: 'R13+',
      sinopsis: 'Dua sahabat lama bertemu kembali dan harus memilih antara mimpi lama atau masa depan yang baru.',
      poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
      tanggal_rilis: new Date('2026-06-01'),
      bahasa: 'Indonesia',
      status: 'tayang',
    }),
    getOrCreateFilm({
      judul: 'Orbit Terakhir',
      genre: 'Aksi, Sci-Fi',
      durasi: 132,
      rating: 'R13+',
      sinopsis: 'Misi penyelamatan di stasiun luar angkasa berubah menjadi perlombaan melawan waktu.',
      poster_url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=900&q=80',
      tanggal_rilis: new Date('2026-05-24'),
      bahasa: 'Inggris',
      status: 'tayang',
    }),
    getOrCreateFilm({
      judul: 'Komedi Tengah Malam',
      genre: 'Komedi',
      durasi: 101,
      rating: 'SU',
      sinopsis: 'Sekelompok kru bioskop harus menyelamatkan premiere film terbesar tahun ini dari kekacauan lucu.',
      poster_url: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80',
      tanggal_rilis: new Date('2026-06-10'),
      bahasa: 'Indonesia',
      status: 'tayang',
    }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const [filmIndex, film] of films.entries()) {
    for (const [showIndex, hour] of ['13:00', '18:30'].entries()) {
      const tanggal = new Date(today);
      tanggal.setDate(today.getDate() + filmIndex);

      const [startHour, startMinute] = hour.split(':').map(Number);
      const selesai = new Date(tanggal);
      selesai.setHours(startHour, startMinute + film.durasi, 0, 0);
      const jamSelesai = `${String(selesai.getHours()).padStart(2, '0')}:${String(selesai.getMinutes()).padStart(2, '0')}`;

      const existingSchedule = await prisma.jadwal.findFirst({
        where: {
          id_film: film.id_film,
          id_studio: studio.id_studio,
          tanggal,
          jam_mulai: hour,
        },
      });

      const jadwal = existingSchedule || await prisma.jadwal.create({
        data: {
          id_film: film.id_film,
          id_studio: studio.id_studio,
          tanggal,
          jam_mulai: hour,
          jam_selesai: jamSelesai,
          harga: showIndex === 0 ? '45000' : '55000',
        },
      });

      const existingSlots = await prisma.slotKursi.count({
        where: { id_jadwal: jadwal.id_jadwal },
      });

      if (existingSlots) continue;

      const kursi = await prisma.kursi.findMany({
        where: { id_studio: studio.id_studio },
        select: { id_kursi: true },
      });

      await prisma.slotKursi.createMany({
        data: kursi.map((item) => ({
          id_jadwal: jadwal.id_jadwal,
          id_kursi: item.id_kursi,
          status: 'TERSEDIA',
        })),
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
    console.log('Seed CineTix selesai.');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });

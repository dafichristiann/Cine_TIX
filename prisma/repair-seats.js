require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function rowLabel(index) {
  let label = '';
  let value = index + 1;
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
}

function layout(capacity) {
  return Array.from({ length: capacity }, (_, index) => {
    const baris = rowLabel(Math.floor(index / 10));
    const number = (index % 10) + 1;
    return { nomor_kursi: `${baris}${number}`, baris, tipe_kursi: number >= 9 ? 'VIP' : 'REGULER' };
  });
}

async function repairStudio(studio) {
  await prisma.$transaction(async (tx) => {
    const seats = await tx.kursi.findMany({
      where: { id_studio: studio.id_studio },
      include: { slot: { include: { _count: { select: { detail: true } } } } },
      orderBy: { id_kursi: 'asc' },
    });
    const grouped = new Map();
    for (const seat of seats) grouped.set(seat.nomor_kursi, [...(grouped.get(seat.nomor_kursi) || []), seat]);

    for (const duplicates of grouped.values()) {
      const canonical = duplicates.sort((a, b) =>
        b.slot.reduce((sum, slot) => sum + slot._count.detail, 0) - a.slot.reduce((sum, slot) => sum + slot._count.detail, 0),
      )[0];
      for (const duplicate of duplicates.slice(1)) {
        for (const slot of duplicate.slot) {
          if (slot._count.detail) continue;
          await tx.slotKursi.delete({ where: { id_slot: slot.id_slot } });
        }
        const remaining = await tx.slotKursi.count({ where: { id_kursi: duplicate.id_kursi } });
        if (!remaining) await tx.kursi.delete({ where: { id_kursi: duplicate.id_kursi } });
      }
      grouped.set(canonical.nomor_kursi, [canonical]);
    }

    const current = await tx.kursi.findMany({ where: { id_studio: studio.id_studio } });
    const existing = new Set(current.map((seat) => seat.nomor_kursi));
    const missing = layout(studio.kapasitas).filter((seat) => !existing.has(seat.nomor_kursi));
    if (missing.length) {
      await tx.kursi.createMany({ data: missing.map((seat) => ({ ...seat, id_studio: studio.id_studio })) });
    }

    const allSeats = await tx.kursi.findMany({ where: { id_studio: studio.id_studio } });
    const schedules = await tx.jadwal.findMany({ where: { id_studio: studio.id_studio } });
    const existingSlots = await tx.slotKursi.findMany({
      where: { id_jadwal: { in: schedules.map((item) => item.id_jadwal) } },
      select: { id_jadwal: true, id_kursi: true },
    });
    const slotKeys = new Set(existingSlots.map((slot) => `${slot.id_jadwal}:${slot.id_kursi}`));
    const missingSlots = schedules.flatMap((schedule) => allSeats
      .filter((seat) => !slotKeys.has(`${schedule.id_jadwal}:${seat.id_kursi}`))
      .map((seat) => ({ id_jadwal: schedule.id_jadwal, id_kursi: seat.id_kursi, status: 'TERSEDIA' })));
    if (missingSlots.length) await tx.slotKursi.createMany({ data: missingSlots });
  });
}

async function main() {
  const studios = await prisma.studio.findMany();
  for (const studio of studios) await repairStudio(studio);
  console.log(`Perbaikan kursi selesai untuk ${studios.length} studio.`);
}

main().finally(async () => { await prisma.$disconnect(); await pool.end(); });

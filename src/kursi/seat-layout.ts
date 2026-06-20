export interface GeneratedSeat {
  nomor_kursi: string;
  baris: string;
  tipe_kursi: string;
}

function rowLabel(index: number) {
  let label = '';
  let value = index + 1;

  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }

  return label;
}

export function generateSeatLayout(capacity: number): GeneratedSeat[] {
  return Array.from({ length: capacity }, (_, index) => {
    const row = rowLabel(Math.floor(index / 10));
    const number = (index % 10) + 1;

    return {
      nomor_kursi: `${row}${number}`,
      baris: row,
      tipe_kursi: number >= 9 ? 'VIP' : 'REGULER',
    };
  });
}

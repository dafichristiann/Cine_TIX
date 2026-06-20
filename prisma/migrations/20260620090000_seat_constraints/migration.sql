CREATE UNIQUE INDEX "Kursi_id_studio_nomor_kursi_key"
ON "Kursi"("id_studio", "nomor_kursi");

CREATE UNIQUE INDEX "SlotKursi_id_jadwal_id_kursi_key"
ON "SlotKursi"("id_jadwal", "id_kursi");

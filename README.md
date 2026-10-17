# BISARA Frontend

Frontend React/TypeScript untuk portal BISARA. Data pengguna, psikolog, jadwal, sesi, pesan, riwayat, dan katalog frasa dibaca dari backend. Penyimpanan browser hanya digunakan untuk preferensi aksesibilitas; tidak digunakan sebagai database klinis atau autentikasi.

## Perilaku utama

- Autentikasi memakai cookie HttpOnly backend, bukan token `localStorage`.
- Sesi hanya dapat dibuka dari appointment backend.
- Pesan disimpan melalui REST sebelum ID pesan disiarkan melalui WebSocket.
- UI tidak membuat partner, skor, akurasi, antrean, atau riwayat simulasi.
- Avatar hanya memutar aset dan nama klip yang diberikan katalog backend. Jika aset tidak ada, UI menyatakannya sebagai teks saja.
- Video memerlukan PeerServer aman dan TURN relay; tidak ada mode offline atau stream sintetis.
- Halaman dipisah menjadi lazy-loaded chunks agar bundle awal lebih kecil.

## Menjalankan lokal

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Lengkapi `VITE_API_URL`, `VITE_WS_URL`, PeerJS, dan seluruh variabel TURN. Tanpa konfigurasi PeerServer/TURN, fitur video dinonaktifkan dengan pesan eksplisit.

## Verifikasi

```bash
pnpm check
```

Perintah tersebut menjalankan lint, unit test, TypeScript build, dan Vite production build.

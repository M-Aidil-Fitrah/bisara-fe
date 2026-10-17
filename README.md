# BISARA Frontend

Frontend React/TypeScript untuk layanan publik BISARA. Halaman publik diprerender saat build; editor display, renderer Three.js, kamera, PeerJS, dan WebRTC hanya berjalan di browser setelah route yang memerlukannya dibuka.

## Kontrak produksi

- One-way Service membuat display privat bertoken tanpa login. Viewer TV memakai token terpisah dan dapat memakai fullscreen.
- Ritz memasangkan `USER` dengan `ADMIN`; PSS-10, chat sementara, dan video hanya tersedia untuk peserta room aktif.
- `pnpm prerender` membuat HTML statis untuk route publik menggunakan Chromium. Nixpacks frontend memasang Chromium hanya pada build phase dan menerbitkan `dist` sebagai SPA output.
- Renderer avatar menjadi chunk lazy terpisah; GLB tidak dipreload dari landing page.

## Environment build Coolify

Vite membaca nilai berikut saat build, jadi setiap perubahan harus diikuti rebuild/deploy frontend:

```text
VITE_API_URL=https://api-bisara.example.com/api
VITE_WS_URL=wss://api-bisara.example.com
VITE_PEER_HOST=peer.example.com
VITE_PEER_PORT=443
VITE_PEER_PATH=/
VITE_PEER_SECURE=true
VITE_STUN_URL=stun:stun.l.google.com:19302
```

Gunakan HTTPS pada frontend, API, dan PeerServer. HTTPS adalah syarat browser untuk `getUserMedia`; konfigurasi ini sengaja tidak memasukkan TURN lokal ataupun kredensial database.

## Lokal dan verifikasi

```bash
cp .env.example .env
pnpm install
pnpm check
pnpm prerender
pnpm exec playwright test src/smoke.spec.ts
```

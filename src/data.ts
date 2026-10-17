import type { Sign, SignLabel } from './types'

export const PSS10: string[] = [
  'Dalam sebulan terakhir, seberapa sering Anda merasa sedih karena sesuatu yang terjadi secara tiba-tiba?',
  'Dalam sebulan terakhir, seberapa sering Anda merasa tidak mampu mengendalikan hal-hal penting dalam hidup Anda?',
  'Dalam sebulan terakhir, seberapa sering Anda merasa gugup dan stres?',
  'Dalam sebulan terakhir, seberapa sering Anda merasa yakin dengan kemampuan Anda menangani masalah pribadi?',
  'Dalam sebulan terakhir, seberapa sering Anda merasa bahwa segala sesuatunya berjalan lancar?',
  'Dalam sebulan terakhir, seberapa sering Anda merasa tidak mampu mengatasi semua hal yang harus Anda lakukan?',
  'Dalam sebulan terakhir, seberapa sering Anda mampu mengendalikan hal-hal yang menjengkelkan dalam hidup Anda?',
  'Dalam sebulan terakhir, seberapa sering Anda merasa berada di atas segalanya atau menguasai keadaan?',
  'Dalam sebulan terakhir, seberapa sering Anda merasa marah karena hal-hal yang berada di luar kendali Anda?',
  'Dalam sebulan terakhir, seberapa sering Anda merasa kesulitan menumpuk begitu tinggi sehingga Anda tidak dapat mengatasinya?',
]

export const ANSWERS: string[] = [
  'Tidak pernah',
  'Hampir tidak pernah',
  'Kadang-kadang',
  'Cukup sering',
  'Sangat sering',
]

export const SIGN_LABEL_MAP: Record<SignLabel, string> = {
  TIDAK_PERNAH: 'Tidak pernah',
  HAMPIR_TIDAK_PERNAH: 'Hampir tidak pernah',
  KADANG_KADANG: 'Kadang-kadang',
  CUKUP_SERING: 'Cukup sering',
  SANGAT_SERING: 'Sangat sering',
}

export const LABEL_TO_SIGN_MAP: Record<string, SignLabel> = {
  'Tidak pernah': 'TIDAK_PERNAH',
  'Hampir tidak pernah': 'HAMPIR_TIDAK_PERNAH',
  'Kadang-kadang': 'KADANG_KADANG',
  'Cukup sering': 'CUKUP_SERING',
  'Sangat sering': 'SANGAT_SERING',
}

export const OPENING: string[] = [
  'Halo, selamat datang. Saya psikolog yang akan mendampingi Anda hari ini.',
  'Kita akan mengisi 10 pertanyaan singkat tentang perasaan Anda sebulan terakhir.',
]

export const SIGNS: Sign[] = [
  { word: 'Halo', category: 'Sapaan', desc: 'Telapak terbuka di samping dahi, digerakkan menjauh.', hasClip: true },
  { word: 'Terima kasih', category: 'Sapaan', desc: 'Ujung jari menyentuh dagu lalu bergerak ke depan.', hasClip: true },
  { word: 'Selamat datang', category: 'Sapaan', desc: 'Kedua tangan terbuka bergerak ke arah dada.', hasClip: true },
  { word: 'Nama', category: 'Sapaan', desc: 'Dua jari kanan mengetuk dua jari kiri.', hasClip: true },
  { word: 'Sedih', category: 'Perasaan', desc: 'Jari terbuka bergerak turun di depan wajah.', hasClip: true },
  { word: 'Gugup', category: 'Perasaan', desc: 'Kedua tangan bergetar ringan di depan dada.', hasClip: true },
  { word: 'Stres', category: 'Perasaan', desc: 'Kepalan tangan menekan pelipis.', hasClip: true },
  { word: 'Marah', category: 'Perasaan', desc: 'Jari menekuk bergerak naik dari dada.', hasClip: true },
  { word: 'Yakin', category: 'Perasaan', desc: 'Kepalan tangan diletakkan tegas di dada.', hasClip: false },
  { word: 'Tidak pernah', category: 'Jawaban PSS-10', desc: 'Telapak menyilang lalu terbuka ke samping.', hasClip: true },
  { word: 'Hampir tidak pernah', category: 'Jawaban PSS-10', desc: 'Isyarat “tidak pernah” dengan gerak lebih kecil.', hasClip: true },
  { word: 'Kadang-kadang', category: 'Jawaban PSS-10', desc: 'Telapak bergoyang pelan ke kiri dan kanan.', hasClip: true },
  { word: 'Cukup sering', category: 'Jawaban PSS-10', desc: 'Jari telunjuk mengetuk telapak dua kali.', hasClip: true },
  { word: 'Sangat sering', category: 'Jawaban PSS-10', desc: 'Jari telunjuk mengetuk telapak berulang cepat.', hasClip: true },
  { word: 'Sebulan', category: 'Waktu', desc: 'Telunjuk bergerak turun di sepanjang telunjuk lain.', hasClip: true },
  { word: 'Hari ini', category: 'Waktu', desc: 'Kedua telapak menghadap atas, diturunkan pelan.', hasClip: false },
  { word: 'Masalah', category: 'Umum', desc: 'Kedua jari menekuk saling memutar.', hasClip: false },
  { word: 'Hidup', category: 'Umum', desc: 'Kedua tangan bergerak naik di depan tubuh.', hasClip: true },
]

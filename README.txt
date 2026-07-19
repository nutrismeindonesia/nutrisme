NUTRISME LANDING PAGE - BUILD 2026-07-19-11
============================================

RINGKASAN PERUBAHAN
-------------------
1. Urutan landing page diperbarui menjadi:
   - Hero
   - Mengapa Pelanggan Memilih Nutrisme
   - Pilihan Paket dan Harga
   - Cara Berlangganan dalam 4 Langkah
   - CTA akhir dan footer

2. Switch bahasa ID | EN ditambahkan di header.
   - Bahasa default: Indonesia.
   - Pilihan disimpan di browser melalui localStorage.
   - Navigasi, isi halaman, harga, form, validasi, pesan sukses,
     footer, dan seluruh Privacy Policy tersedia dalam dua bahasa.

3. Seluruh CTA berlangganan menggunakan satu form yang sama.
   - Header: Berlangganan
   - Hero: Berlangganan Sekarang
   - Hero sekunder: Lihat Pilihan Paket
   - Setiap kartu paket: Pilih Paket
   - CTA akhir: Mulai Berlangganan
   - Sticky CTA hanya tampil pada layar mobile

4. Promo Rp100.000 dibuat lebih menonjol.
   - Berlaku untuk semua paket.
   - Diterapkan pada pembayaran bulan pertama.
   - Tanpa kode promo.
   - Hanya untuk pelanggan yang tidak memiliki riwayat PAID atau ACTIVE.

5. Paket Pilihan wajib dipilih.
   - Opsi awal hanya placeholder dan tidak dapat dikirim.
   - Tombol submit tetap nonaktif sampai paket dipilih.
   - Tombol pada kartu paket otomatis mengisi paket terkait.

6. Privacy Policy dapat dibuka dari form dan footer.
   - Versi Bahasa Indonesia dan English.
   - Memuat penjelasan verifikasi promo menggunakan nomor handphone.

7. Perilaku setelah form berhasil dikirim tetap dipertahankan.
   - Tombol X menutup pop-up.
   - Tombol Pesan Lagi mengembalikan form kosong.
   - Klik bagian lain pada tampilan sukses mengembalikan form berlangganan.

BACKEND DAN PROMO OTOMATIS
--------------------------
Google Apps Script sekarang menyimpan kolom berikut:
- No
- Waktu
- Nama Lengkap
- Username Instagram
- Alamat
- No. Handphone
- Paket Pilihan
- Status Pelanggan
- Promo Eligible
- Diskon
- Harga Bulan Pertama
- Harga Normal/Bulan
- Alasan Promo
- Bahasa
- Request ID
- Sumber
- Waktu Klien

Status pelanggan yang tersedia:
- LEAD
- CONTACTED
- PAID
- ACTIVE
- CANCELLED

Aturan promo:
- Pengiriman form baru selalu masuk sebagai LEAD.
- Nomor telepon dibandingkan dengan data sebelumnya.
- LEAD dan CONTACTED tidak menggugurkan promo.
- PAID dan ACTIVE menggugurkan promo pelanggan baru.
- Sistem mencatat kelayakan, nilai diskon, harga bulan pertama,
  harga normal, dan alasannya secara otomatis.

HARGA
-----
Nutrisme Daily
- Normal: Rp1.120.000/bulan
- Bulan pertama pelanggan baru: Rp1.020.000

Nutrisme Ready
- Normal: Rp820.000/bulan
- Bulan pertama pelanggan baru: Rp720.000

Nutrisme Cook
- Normal: Rp700.000/bulan
- Bulan pertama pelanggan baru: Rp600.000

CARA DEPLOY FRONT-END
---------------------
1. Upload atau ganti file berikut di root website:
   - index.html
   - style.css
   - script.js
2. Pastikan folder assets/ ikut tersedia dengan struktur yang sama.
3. Lakukan hard refresh:
   - Windows/Linux: Ctrl + Shift + R
   - Mac: Cmd + Shift + R
4. Uji juga menggunakan mode incognito.

CARA DEPLOY GOOGLE APPS SCRIPT
------------------------------
1. Buka project Google Apps Script yang digunakan Nutrisme.
2. Ganti seluruh isi script dengan apps-script.gs pada paket ini.
3. Simpan.
4. Jalankan fungsi setupNutrisme() satu kali dan berikan izin jika diminta.
5. Buka Deploy > Manage deployments.
6. Edit deployment web app.
7. Pilih New version lalu Deploy.
8. Pastikan akses web app tetap sesuai konfigurasi sebelumnya.

PENTING:
Endpoint /exec pada script.js tetap menggunakan URL deployment yang sebelumnya
sudah digunakan. Apabila Google membuat URL deployment baru, ganti nilai
APPS_SCRIPT_URL pada script.js.

CHECKLIST PENGUJIAN
-------------------
[ ] Halaman pertama kali tampil dalam Bahasa Indonesia.
[ ] Switch EN menerjemahkan seluruh halaman dan Privacy Policy.
[ ] Refresh halaman mempertahankan pilihan bahasa terakhir.
[ ] Lihat Pilihan Paket mengarah ke section harga.
[ ] Urutan section: Hero > Keunggulan > Paket > 4 Langkah > CTA.
[ ] Promo Rp100.000 terlihat jelas pada Hero dan kartu paket.
[ ] Tombol kartu paket membuka form dengan paket otomatis terpilih.
[ ] Form singkat Hero hanya mewajibkan Nama, Username Instagram, dan Privacy Policy.
[ ] Tombol submit tidak aktif jika ada field yang belum valid.
[ ] Privacy Policy dapat dibuka dan ditutup.
[ ] Form singkat Hero masuk sebagai HERO_LEAD berstatus LEAD.
[ ] Form lengkap masuk sebagai FULL_SUBSCRIPTION berstatus LEAD.
[ ] Nomor tanpa PAID/ACTIVE mendapat Promo Eligible = YA.
[ ] Nomor dengan PAID/ACTIVE mendapat Promo Eligible = TIDAK.
[ ] Klik X setelah sukses menutup pop-up.
[ ] Klik Pesan Lagi menampilkan form kosong.
[ ] Klik area lain pada tampilan sukses menampilkan form lagi.
[ ] Sticky CTA hanya muncul pada mobile.


PERUBAHAN BUILD 2026-07-19-5
----------------------------
- Menambahkan badge bilingual "Segera Hadir / Launching Soon — Jakarta" di Hero.
- Gambar pada Hero menggunakan opacity 80% dan lapisan lembut agar form terbaca.
- Menambahkan form singkat di atas gambar Hero: Nama Lengkap, Username Instagram, dan persetujuan Privacy Policy.
- Form singkat langsung menyimpan HERO_LEAD ke Google Sheets tanpa alamat, nomor WhatsApp, atau paket.
- Promo pada HERO_LEAD berstatus BELUM DIVERIFIKASI sampai nomor WhatsApp dan paket tersedia.
- Pop-up Privacy Policy yang sama dapat dibuka dari form singkat maupun form lengkap.
- Setelah form singkat berhasil dikirim, pop-up Terima Kasih yang sama ditampilkan.
- Section Keunggulan, Paket, dan Cara Kerja dibuat lebih compact pada desktop.
- Backend menerima action createHeroLead dan createOrder.


PERUBAHAN BUILD 2026-07-19-5
-----------------------------
1. Tombol Berlangganan Sekarang dan Lihat Pilihan Paket di area copy Hero dihapus.
2. Proporsi teks Hero pada layar mobile diperkecil agar tidak terpotong dan seimbang dengan area gambar/form.
3. Kartu promo dibuat selebar area konten dan dipadatkan untuk viewport sekitar 382 px.
4. CTA pada header, kartu paket, CTA akhir, dan sticky mobile tetap dipertahankan.


PERUBAHAN BUILD 2026-07-19-7
-----------------------------
1. Menghapus label “Meal plan sehat yang mengikuti ritme hidupmu” dari Hero.
2. Mendesain ulang kartu promo agar lebih ringkas, lebih menarik, dan tetap menonjol.
3. Memindahkan keterangan verifikasi promo ke tengah halaman di bawah Hero grid.
4. Keterangan verifikasi tampil satu baris pada desktop tanpa line break manual.

PERUBAHAN BUILD 2026-07-19-7
----------------------------
1. Ukuran headline, deskripsi, dan kartu promo pada Hero diperkecil agar proporsinya lebih seimbang dengan visual produk di sebelahnya.
2. Kartu promo tetap menonjol, tetapi lebih ringkas pada desktop maupun mobile.
3. Background section dibuat bergantian:
   - Hero: #ffffff
   - Keunggulan: #fbf7ef
   - Paket: #ffffff
   - Cara Kerja: #fbf7ef
   - CTA akhir: #ffffff
   - Footer: #fbf7ef
4. Email kontak diganti menjadi nutrisme.indonesia@gmail.com pada footer, tautan mailto, Privacy Policy, dan terjemahan English.


BUILD 2026-07-19-8
- Seluruh section utama dipadatkan menjadi sekitar 75% dari tinggi visual build sebelumnya.
- Hero, kartu manfaat, paket, langkah, CTA, dan footer diperkecil secara proporsional.
- Responsivitas mobile dan tablet tetap dipertahankan.


BUILD 2026-07-19-9
------------------
- Menambahkan jarak visual antara copy CTA akhir dan gambar.
- Tombol Mulai Berlangganan pada CTA akhir kini melakukan smooth scroll ke form singkat di Hero dan memfokuskan field Nama Lengkap.
- Tombol tersebut tidak lagi membuka modal form berlangganan lengkap.


BUILD 2026-07-19-10
--------------------
- Ukuran teks Privacy Policy di footer disamakan dengan tautan footer lain.
- Tombol Pilih Paket dihapus dari ketiga kartu paket.
- Setiap kartu diberi keterangan singkat mengenai kecocokan paket dalam bahasa ID dan EN.
- Tinggi field Hero dikunci dan ruang pesan validasi disediakan sejak awal agar field tidak berubah ukuran setelah difokuskan atau divalidasi.


BUILD 2026-07-19-11
--------------------
- Lebar form singkat pada Hero diperbesar agar pesan validasi Username Instagram tetap berada pada satu baris dan tidak bertabrakan dengan persetujuan Privacy Policy.
- Ruang vertikal pesan validasi dan jarak menuju persetujuan diperjelas tanpa mengubah fungsi form.
- Lebar responsif pada tablet dan mobile tetap dibatasi agar form tidak keluar dari area gambar.

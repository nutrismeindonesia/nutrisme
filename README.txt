NUTRISME - VERSI DIPERBAIKI (BUILD 2026-07-17-3)
============================


PENTING SEBELUM MULAI
---------------------
Ekstrak ZIP ini. Jangan meng-upload ZIP sebagai satu file. Ganti file lama di
repository nutrisme/main dengan index.html, script.js, style.css, dan assets
dari paket ini. Nama file harus persis tanpa tambahan “(1)”. Baca juga
DEPLOY-CHECKLIST.txt.

MASALAH YANG DIPERBAIKI
-----------------------
1. Front-end sebelumnya memakai mode "no-cors" tetapi mengirim Content-Type
   "application/json". Kombinasi ini tidak aman/andal untuk simple cross-origin
   request. Versi baru memakai URLSearchParams tanpa header kustom.
2. Apps Script sebelumnya hanya mencoba JSON.parse. Versi baru menerima form
   URL encoded melalui e.parameter dan tetap memiliki fallback JSON.
3. Front-end sebelumnya selalu menampilkan sukses walaupun fetch gagal. Versi
   baru mempertahankan form dan menampilkan pesan gagal saat ada network error
   atau timeout.
4. Apps Script sekarang memiliki doGet untuk health check, validasi data,
   LockService, timestamp server, dan email yang tidak menggagalkan penyimpanan.
5. Teks preview pada modal sudah diperbarui dan file CSS/JS memakai cache-buster.

STRUKTUR FILE
-------------
- index.html
- style.css
- script.js
- apps-script.gs
- assets/

PENTING: GITHUB DAN APPS SCRIPT ADALAH DUA DEPLOYMENT BERBEDA
-------------------------------------------------------------
Meng-upload apps-script.gs ke GitHub TIDAK mengubah Google Apps Script yang
sedang berjalan. File apps-script.gs di GitHub hanya salinan/backup.

LANGKAH 1 - SIAPKAN GOOGLE APPS SCRIPT
--------------------------------------
1. Buka project Google Apps Script yang digunakan oleh endpoint Nutrisme.
2. Hapus kode lama dan tempel seluruh isi apps-script.gs versi ini.
3. Periksa CONFIG di bagian atas:
   - SPREADSHEET_ID
   - SHEET_NAME
   - NOTIFICATION_EMAIL
4. Simpan.
5. Pilih fungsi setupNutrisme lalu klik Run.
6. Setujui izin Google. Pastikan Execution log menampilkan status "ok".

LANGKAH 2 - REDEPLOY WEB APP
----------------------------
1. Klik Deploy > Manage deployments.
2. Edit deployment Web app yang lama, lalu pilih New version.
3. Execute as: Me.
4. Who has access: Anyone.
5. Klik Deploy.
6. Salin URL yang berakhir /exec.
7. Jika URL berubah, ganti nilai APPS_SCRIPT_URL di script.js.

Health check:
Buka URL /exec di jendela incognito. Hasil yang benar adalah JSON seperti:
{"status":"ok","service":"Nutrisme order endpoint",...}

Jika masih muncul "Script function not found: doGet", deployment masih memakai
versi lama dan harus di-update lagi dengan New version.

LANGKAH 3 - UPLOAD WEBSITE KE GITHUB
------------------------------------
1. Upload index.html, style.css, script.js, dan folder assets ke root repository.
2. apps-script.gs dan README.txt boleh ikut di-upload sebagai dokumentasi.
3. Commit perubahan ke branch yang dipakai GitHub Pages.
4. Tunggu deployment Pages selesai.
5. Buka https://www.nutrisme.biz.id/ lalu lakukan hard refresh:
   Windows/Linux: Ctrl+Shift+R
   Mac: Cmd+Shift+R

LANGKAH 4 - TEST
----------------
1. Buka domain dalam mode incognito.
2. Isi satu pesanan uji.
3. Periksa tab "Pesanan" pada spreadsheet.
4. Buka Apps Script > Executions untuk melihat doPost.

Jika doPost tidak muncul di Executions, biasanya APPS_SCRIPT_URL di script.js
salah atau file script.js lama masih tersimpan di cache.

Jika doPost muncul tetapi gagal, buka detail eksekusi. Penyebab yang paling umum:
- SPREADSHEET_ID salah.
- Akun pemilik deployment tidak punya akses edit ke spreadsheet.
- Deployment tidak dijalankan sebagai "Me".
- Deployment belum dibuat sebagai versi baru setelah kode diubah.

CATATAN TEKNIS
---------------
Karena endpoint Apps Script dipanggil dengan mode "no-cors", browser tidak dapat
membaca body respons. Front-end dapat mendeteksi kegagalan jaringan/timeout,
tetapi validasi akhir harus dilihat melalui spreadsheet dan Apps Script
Executions. Health check doGet membantu memastikan versi deployment yang aktif.

NUTRISME V21 - SETUP WAJIB
Build: 2026-07-21-21

PENYEBAB YANG DITEMUKAN
1. Domain live masih menampilkan landing page lama/form lengkap, bukan file v20.
2. v20 mengirim data lewat form POST ke iframe tersembunyi dan langsung menampilkan popup. Jika deployment salah, belum di-update, atau tidak punya akses ke Spreadsheet baru, pengguna tetap melihat popup tetapi baris tidak dibuat.
3. URL Web App di index.html masih URL deployment lama. URL tersebut hanya benar jika deployment yang sama diperbarui ke kode Apps Script terbaru.

PERBAIKAN V21
- Form aktif: Nama Lengkap, Username Instagram, checkbox Privacy Policy.
- Kolom Sheet: No, Tanggal, Jam, Nama Lengkap, Username Instagram.
- Pengiriman memakai JSONP GET yang dapat menerima respons sukses/error dari Apps Script tanpa masalah CORS.
- Popup muncul langsung. Teks popup berubah menjadi berhasil atau gagal setelah Apps Script merespons.
- Backend mendukung doGet untuk createHeroLead dan doPost sebagai cadangan.
- Spreadsheet ID: 1W84u1NlUBYCGrv80bsk9bp0-kt6uX8EcEz6uPju-_0M
- Nama Spreadsheet dan tab: Order

A. PASANG APPS SCRIPT
1. Buka Spreadsheet target dengan akun Google yang memiliki akses Editor:
   https://docs.google.com/spreadsheets/d/1W84u1NlUBYCGrv80bsk9bp0-kt6uX8EcEz6uPju-_0M/edit
2. Extensions > Apps Script.
3. Hapus isi Code.gs, lalu paste seluruh isi apps-script.gs.
4. Save.
5. Pilih fungsi setupNutrisme, klik Run, dan izinkan akses.
6. Pilih testHeroLeadNutrisme, klik Run.
7. Pastikan tab Order mendapat satu baris TEST NUTRISME. Jika tes ini gagal, buka Executions dan lihat pesan error. Jangan lanjut ke GitHub sebelum tes manual berhasil.

B. DEPLOY WEB APP
Pilihan yang paling aman: buat deployment baru.
1. Deploy > New deployment.
2. Select type > Web app.
3. Execute as: Me.
4. Who has access: Anyone.
5. Deploy dan salin URL /exec.
6. Buka URL /exec di tab incognito. Harus tampil JSON dengan:
   connected=true
   spreadsheetId=1W84u1NlUBYCGrv80bsk9bp0-kt6uX8EcEz6uPju-_0M
   spreadsheet=Order
   sheet=Order
   version=2026-07-21-21
7. Buka index.html. Ganti content pada meta nutrisme-apps-script-url dengan URL /exec baru. Jangan memakai URL lama jika berasal dari project/deployment berbeda.

C. UPLOAD KE GITHUB
1. Ekstrak ZIP. Upload ISI folder, bukan folder pembungkusnya.
2. Di repository, root harus berisi:
   index.html
   script.js
   style.css
   CNAME
   .nojekyll
   assets/
3. GitHub > Settings > Pages:
   Source: Deploy from a branch
   Branch: main (atau branch tempat file di-upload)
   Folder: / (root)
4. Pastikan Custom domain: www.nutrisme.biz.id.
5. Tunggu Actions/Pages selesai.
6. Buka view-source:https://www.nutrisme.biz.id/ dan cari 2026-07-21-21.
   Jika tidak ada, domain masih melayani branch/repository/folder yang salah.
7. Hard refresh Ctrl+Shift+R.

D. TES LIVE
1. Isi Nama dan Instagram.
2. Centang Privacy Policy.
3. Klik Submit.
4. Popup langsung muncul.
5. Dalam beberapa detik, teks popup harus berubah menjadi "Data Anda berhasil tercatat...".
6. Cek tab Order dan Apps Script > Executions.

CATATAN
- apps-script.gs tidak di-upload ke GitHub.
- Jika membuat deployment baru, URL /exec harus ditempel ke index.html sebelum upload.
- Jika hanya mengubah kode Apps Script tanpa membuat/update deployment, website tetap menjalankan backend lama.

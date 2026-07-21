NUTRISME - LANGKAH KONEKSI GITHUB KE GOOGLE SHEETS
Build: 2026-07-21-19

A. SIAPKAN GOOGLE APPS SCRIPT
1. Buka Google Spreadsheet dengan ID:
   1W84u1NlUBYCGrv80bsk9bp0-kt6uX8EcEz6uPju-_0M
2. Di Spreadsheet, pilih Extensions > Apps Script.
3. Buka file Code.gs, hapus kode lama, lalu salin seluruh isi file apps-script.gs dari paket ini.
4. Klik Save.
5. Pilih fungsi setupNutrisme, lalu klik Run.
6. Setujui permintaan izin Google.
7. Pastikan Execution log menampilkan:
   - spreadsheet: Order
   - sheet: Order
   - columns: No, Tanggal, Jam, Nama Lengkap, Username Instagram
8. Jalankan testHeroLeadNutrisme.
9. Buka tab Order dan pastikan satu baris TEST NUTRISME muncul.
10. Opsional: jalankan testNotificationEmailNutrisme untuk mengecek email notifikasi.

B. DEPLOY APPS SCRIPT SEBAGAI WEB APP
Cara yang disarankan agar URL di index.html tidak berubah:
1. Di Apps Script, klik Deploy > Manage deployments.
2. Pilih deployment Web App yang sudah digunakan situs.
3. Klik ikon pensil/Edit.
4. Pada Version, pilih New version.
5. Execute as: Me.
6. Who has access: Anyone.
7. Klik Deploy.
8. Salin Web App URL yang berakhiran /exec.
9. Bandingkan URL itu dengan meta tag berikut di index.html:
   <meta name="nutrisme-apps-script-url" content=".../exec">
10. Jika URL berbeda, ganti nilai content pada meta tag tersebut dengan URL Web App terbaru.

C. UPLOAD KE GITHUB
Upload/replace file dan folder berikut di root repository GitHub Pages:
- index.html
- script.js
- style.css
- folder assets beserta seluruh isinya

File apps-script.gs dan README-SETUP.txt tidak perlu dipublikasikan untuk menjalankan landing page.
apps-script.gs dipasang di editor Google Apps Script, bukan dijalankan dari GitHub.

D. PASTIKAN GITHUB PAGES SUDAH MEMAKAI FILE TERBARU
1. Commit semua perubahan ke branch yang dipakai GitHub Pages.
2. Buka repository > Actions dan tunggu deployment selesai.
3. Buka https://www.nutrisme.biz.id/
4. Lakukan hard refresh:
   Windows: Ctrl + Shift + R
   Mac: Command + Shift + R
5. View page source, lalu cari "2026-07-21-19".
   Jika ditemukan, file terbaru sudah aktif.

E. TES FORM DARI WEBSITE
1. Isi Nama Lengkap dan Username Instagram.
2. Klik Submit.
3. Pop-up Terima kasih muncul langsung tanpa menunggu Google Sheets.
4. Tunggu beberapa detik, lalu cek tab Order di Spreadsheet.
5. Data harus masuk ke lima kolom berikut saja:
   No | Tanggal | Jam | Nama Lengkap | Username Instagram

CATATAN PENTING
- Pop-up sekarang muncul segera setelah browser mengirim request. Pop-up bukan bukti bahwa Google Sheets berhasil menulis data.
- Jika pop-up muncul tetapi data tidak masuk, periksa Apps Script > Executions untuk melihat error backend.
- Jika deployment baru dibuat (bukan Edit deployment lama), URL /exec biasanya berubah dan wajib diperbarui di index.html.

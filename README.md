# Ma'lumotnoma tuzatgich (Kadrlar bo'limi)

O'zbekistondagi tashkilotlar va OTMlar kadrlar bo'limi uchun spravka-ob'ektivka (T-2 shakli) hujjatlarini tekshirish, tahlil qilish, kadrlar bazasi bilan solishtirish hamda davlat standarti bo'yicha Word va PDF shakliga keltiruvchi veb-tizim.

🌐 **Jonli havola (Demo):** [https://ecthelion-dev.github.io/word_cv/](https://ecthelion-dev.github.io/word_cv/)

---

## 🚀 Asosiy imkoniyatlar

1. **Ko'p formatli hujjatlarni o'qish (Parsing):**
   - `.docx`, `.doc` (eski Word formati), `.pdf` (matnli yoki avvaldan OCR matn qatlamiga ega) hamda `.zip` arxivlarni qo'llab-quvvatlaydi. Faqat rasm ko'rinishida bo'lgan, matn qatlami yo'q skaner PDF uchun alohida OCR kerak.
   - Butun papkani yoki yuzlab fayllarni birdaniga sudrab tashlash (`drag & drop`).
   - Web Worker orqali fonda tezkor qayta ishlash.

2. **Avtomatik aniqlash va standartlashtirish:**
   - Xodimning F.I.Sh., lavozimi, tayinlangan sanasi;
   - 3×4 fotosuratni topish, to'g'ri o'lchamda qirqish (crop) va joylashtirish;
   - Shaxsiy ma'lumotlar (tug'ilgan sana/joy, millati, partiya, ma'lumoti, tamomlagan OTM, mutaxassisligi, ilmiy daraja/unvon, chet tillari, harbiy unvon, davlat mukofotlari);
   - Mehnat faoliyati xronologiyasi (yillar ketma-ketligi va mantiqiy xatolar tekshiruvi);
   - Yaqin qarindoshlar to'g'risidagi jadval.

3. **Imlo va yozuvni to'g'rilash:**
   - Kirill ↔ Lotin yozuvlariga to'liq o'girish;
   - O'zbek tili tutuq belgilari (`'`, `’`, `ʻ`) va qisqartmalarni to'g'rilash;
   - Bo'sh yoki topilmagan maydonlarni ajratib ko'rsatish (`???`).

4. **Kadrlar Excel bazasi bilan solishtirish:**
   - Tashkilotning kadrlar Excel bazasini (`.xlsx`, `.csv`) yuklab, nomuvofiqliklarni aniqlash;
   - Bazada mavjud bo'lgan, lekin ma'lumotnomasi yo'q xodimlarga avtomatik yangi ma'lumotnoma yaratish;
   - Ishdan bo'shagan xodimlarni alohida ajratish.

5. **Manfaatlar to'qnashuvi moduli (O'RQ-931):**
   - 2024-yil 5-iyundagi **«Manfaatlar to'qnashuvi to'g'risida»gi O'RQ-931-son Qonun** va Mehnat kodeksining 121-moddasi talablari asosida tahlil;
   - Yaqin qarindoshlarning bir tashkilotda ishlash holatlarini aniqlash;
   - Risk toifalari: **Mavjud** (15-modda), **Ehtimoliy** (17–18-moddalar), **Aniqlashtirish kerak**;
   - Barcha xodimlar uchun 17-modda bo'yicha **Deklaratsiya loyihalari (ZIP)** va komissiya uchun **Qayd daftari (Excel)** shakllantirish.

6. **Dalillar to'plami va Audit:**
   - Manfaatlar to'qnashuvi holatlari bo'yicha faktlar, ularning manbasi (qaysi hujjat/qatordan olingani) va xronologiya;
   - Komissiya uchun rasmiy **Dalillar varaqasi (Word)** yaratish.

7. **Ilmiy salohiyat va Rahbar kadrlari hisoboti:**
   - DSc, PhD, fan nomzodlari, dotsent va professorlar tahlili (Excelga eksport);
   - OTM/tashkilot rahbarlari bo'yicha umumiy Word jadvalini avtomatik yig'ish.

8. **Eksport va Zaxiralash:**
   - Barcha tayyor fayllarni standartlashtirilgan Word (`.docx`) yoki PDF (`.pdf`) shaklida tartiblangan ZIP arxivda yuklab olish;
   - Butun ish sessiyasini zaxira fayl (backup) qilib olish va qayta tiklash.

---

## 🔒 Maxfiylik va Xavfsizlik

* **100% Mijoz tomonida (Client-side):** Barcha tahlil va qayta ishlash faqat foydalanuvchining brauzerida bajariladi. Hech qanday ma'lumot tashqi serverga yuborilmaydi.
* **Xotira va kesh:** Ma'lumotlar brauzerning xavfsiz `IndexedDB` xotirasida saqlanadi.
* **Umumiy kompyuter himoyasi:** 30 daqiqa harakatsizlikdan so'ng barcha shaxsiy ma'lumotlar avtomatik tozalanishi mumkin.

---

## 🧩 Arxitektura, Modullar (`src/`) va Testlar

Loyiha kodi oson tahrirlash va rivojlantirish uchun mantiqiy modullarga ajratilgan hamda o'qilishi oson formatга keltirilgan:

- `src/core/` (`js/core.js` yadrosi — `SpravkaCore`):
  - `01-dictionary-clean.js` — Lug'atlar, qisqartmalar, tutuq belgilari va imlo tozalash
  - `02-matching-fields.js` — Shablonlar (`SCRIPTS`), matnni normallashtirish va ism qismlarini ajratish
  - `03-block-parser.js` — Hujjat bloklaridan shaxsiy maydonlar, mehnat faoliyati va qarindoshlarni ajratish
  - `04-docx-builder.js` — Standart Word (`.docx`) OpenXML hujjatini generatsiya qilish
  - `05-transliterate.js` — Kirill ↔ Lotin yozuv o'girgichi
  - `06-docx-analyzer.js` — `.docx` faylni o'qish va ogohlantirishlarni shakllantirish
  - `07-doc-binary.js` — Eski binary `.doc` (Word 97–2003) formatini o'qish
  - `08-pdf-analyzer.js` — PDF fayllardan matn, jadval, 3×4 rasm va OCR holatini ajratish
  - `09-pdf-builder-api.js` — `PDF-lib` orqali standart PDF generatsiya qilish va `SpravkaCore` eksporti
- `src/app/` (`js/app.js` interfeysi va funksional modullar):
  - `01-ui-review.js` — Asosiy UI, fayllarni yuklash, Worker Pool, Tekshiruv va ZIP/PDF/DOCX eksport
  - `02-excel.js` — Excel (`.xlsx` / `.csv`) kadrlar bazasi bilan integratsiya va solishtirish
  - `03-coi.js` — Manfaatlar to'qnashuvi (O'RQ-931 va MK 121-modda) tahlili
  - `04-science.js` — Ilmiy salohiyat tahlili, kafedralar reytingi va ko'p varaqli `.xlsx` eksport
  - `05-evidence.js` — Dalillar to'plami, 17-modda Deklaratsiya va 14-modda Xabarnoma
  - `06-editor.js` — Ma'lumotnoma interaktiv muharriri
  - `07-storage.js` — `IndexedDB` xotira, Zaxira nusxa (Backup/Restore) va 30 daqiqalik avto-tozalash
  - `08-tools.js` — Takrorlarni aniqlash, Ommaviy tuzatish (`Bulk Edit`) va Bo'sh maydonlar jadvali
  - `09-reports.js` — Yakuniy hisobot, Rahbarlar ma'lumoti (Word jadval) va Yo'qlama
- Alohida mustaqil modullar: `js/coi-engine.js`, `js/science-engine.js`, `js/pdf-engine.js`, `js/file-error.js`, `js/scanned-pdf-ocr.js`, `js/parseworker.js`.
- Avtomatik testlar: `tests/*.test.cjs`.

`src/` ichidagi modullardan `js/core.js`, `js/app.js` va `js/parseworker.js` fayllarini qayta yig'ish:

```bash
npm run build
```

Testlarni ishga tushirish:

```bash
npm test
```

Ism bo‘yicha bir nechta o‘xshash xodim topilsa, tizim ularning birini avtomatik ravishda aniq shaxs deb belgilamaydi — holat mas’ul xodim tomonidan tasdiqlanishi kerak. Tug‘ilgan yillar mavjud bo‘lib, bir yildan ko‘proq farq qilsa, nomzod avtomatik moslikdan chiqariladi.

## 🛠 Mahalliy ishga tushirish (Local Run)

Loyiha sof statik veb-ilova bo'lib, veb-server orqali ishga tushiriladi (Web Workerlar ishlashi uchun):

### Python orqali:
```bash
python3 -m http.server 8000
```
Brauzerda: `http://localhost:8000`

### Node.js orqali:
```bash
npx serve .
```

---

## 📦 Netlify yoki GitHub Pages'ga joylash

- **GitHub Pages:** Repozitoriy sozlamalaridan `Pages` bo'limiga kirib, `main` tarmog'ini tanlash kifoya.
- **Netlify:** Loyiha papkasini to'g'ridan-to'g'ri Netlify boshqaruv paneliga sudrab tashlash (`drag & drop`) mumkin. `_headers` fayli Netlify xavfsizlik va keshlash siyosatini avtomatik sozlaydi.



## Ilmiy salohiyat bo‘limi

- Qidiruv bir nechta so‘zni istalgan tartibda qabul qiladi; xodim F.I.Sh., bo‘lim, daraja, unvon, manba va qo‘shimcha lavozimlar bo‘yicha qidiriladi.
- Ro‘yxatni F.I.Sh., bo‘lim, ilmiy daraja yoki unvon bo‘yicha tartiblash, sahifada 20/50/100 qator ko‘rsatish mumkin.
- Ilmiy daraja va unvon alohida tekshiriladi: hujjat va Excel qiymatlari tasnif bo‘yicha farq qilsa, yozuv «Tekshirish kerak» holatiga chiqariladi.
- «Boshqa» deb tasniflangan qiymatlar va daraja/unvon mavjud bo‘lmagan xodimlar uchun alohida filtrlar mavjud.
- Tashqi o‘rindoshlik ma’lumotnomada yoki Excel’da ko‘rsatilgan bo‘lsa, yozuv umumiy ilmiy salohiyat ro‘yxatidan chiqariladi.
- Ilmiy salohiyat Excel eksportida ham tekshiruv belgisi va manbalar tafovuti alohida ustunlarda beriladi.

Ilmiy dashboard yordamchi saralash va tekshirish vositasidir. «Boshqa» yoki manbalar tafovuti bilan belgilangan yozuvlar asl hujjat va kadrlar bazasi bo‘yicha mas’ul xodim tomonidan ko‘rib chiqilishi kerak.


## Kafedralar kesimida ilmiy salohiyat reytingi

- Reyting faqat professor-o‘qituvchilar guruhi uchun tuziladi; tashqi o‘rindoshlar chiqarib tashlanadi.
- Asosiy ko‘rsatkich: (DSc + PhD + fan nomzodi) / kafedradagi professor-o‘qituvchilar soni × 100%.
- «Boshqa/noaniq» daraja qiymati tan olingan ilmiy daraja sifatida foizga qo‘shilmaydi; alohida tekshiriladi.
- Professor va dotsent ilmiy unvonlari reyting foiziga ta’sir qilmaydi; alohida sonlarda ko‘rsatiladi.
- Kafedra nomlari kirill/lotin yozuvi normallashtirilgandan keyin guruhlanadi; taxminiy nom o‘xshashligi bo‘yicha birlashtirilmaydi.
- 5 nafardan kam xodimli kafedralar reytingda qoladi, ammo «kam sonli tanlanma» deb belgilanadi.
- Bo‘limi aniqlanmagan xodimlar umumiy foizda hisobga olinadi, ammo kafedralar reytingiga kiritilmaydi.
- Excel eksportiga «Kafedralar reytingi» varag‘i va hisoblash metodikasi qo‘shiladi.


## Skanerlangan PDF OCR

- `js/scanned-pdf-ocr.js` — PDF.js sahifalarini canvas'ga chizib, Tesseract.js orqali matnni tanish va natijani mavjud ma’lumotnoma parseriga uzatish.
- OCR faqat oddiy PDF matn qatlami yo‘q bo‘lganda ishga tushadi; matnli PDF'lar avvalgi tezkor yo‘ldan foydalanadi.
- `tests/scanned-pdf-ocr.test.cjs` — ko‘p bet, til to‘plami, sahifa masshtabi, bo‘sh OCR va resurslarni tozalash sinovlari.

## PDF o‘qish va diagnostika

- PDF.js worker `GlobalWorkerOptions.workerSrc` orqali `vendor/pdf.worker.min.js` manziliga ulanadi; manzil sayt domenining ildiziga emas, ilovaning joriy manziliga nisbatan hisoblanadi (GitHub Pages `/word_cv/` yo‘li ham qo‘llab-quvvatlanadi).
- PDF va worker kutubxonalari bir xil `vendor/` to‘plamidan yuklanadi.
- Matn qatlami bo‘lmagan sof skaner PDF aniqlansa, dastur avtomatik OCR zaxira yo‘lini ishga tushiradi. PDF sahifalari brauzer ichida PDF.js bilan rasmga chiziladi va Tesseract.js orqali o‘qiladi.

# Ma'lumotnoma tuzatgich (Kadrlar bo'limi)

O'zbekistondagi tashkilotlar va OTMlar kadrlar bo'limi uchun spravka-ob'ektivka (T-2 shakli) hujjatlarini tekshirish, tahlil qilish, kadrlar bazasi bilan solishtirish hamda davlat standarti bo'yicha Word va PDF shakliga keltiruvchi veb-tizim.

🌐 **Jonli havola (Demo):** [https://ecthelion-dev.github.io/word_cv/](https://ecthelion-dev.github.io/word_cv/)

---

## 🚀 Asosiy imkoniyatlar

1. **Ko'p formatli hujjatlarni o'qish (Parsing):**
   - `.docx`, `.doc` (eski Word formati), `.pdf` (matnli va skanerlangan OCR), hamda `.zip` arxivlarni qo'llab-quvvatlaydi.
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


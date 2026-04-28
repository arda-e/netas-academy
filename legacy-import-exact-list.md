# Legacy SQL Import Exact List

Source dump: `/Users/arda/Desktop/u944988139_netas2023.sql`

This is the exact content list currently planned for import into the live Strapi instance.

## Summary

- Teachers: 8
- Courses: 14
- Events: 2
- Blog posts: 11

## Teachers

| Legacy ID | Name |
| --- | --- |
| 1 | Alper Vahaplar |
| 2 | Arda Eren |
| 3 | Cemal Taner |
| 4 | Didem Çolak Arslan |
| 5 | Ergül İnanç |
| 6 | Harun Duman |
| 7 | M. Vedat Çelikel |
| 8 | Tayfun Suer |

## Courses

| Legacy ID | Title |
| --- | --- |
| 2 | Yapay Zeka ile İş Modellerini Yeniden Düşünmek |
| 3 | ISTQB Temel Seviye Sertifikasyon Eğitimi |
| 4 | Agile Yaklaşım ve Scrum Eğitimi |
| 5 | Yapay Zeka ile İletişim Yöntemleri |
| 6 | Temel Seviye Yazılım Test Eğitimi |
| 7 | Eğitmenliğe Hazırlık Atölyesi |
| 8 | Çevik Test Uzmanı (Agile Tester) Eğitimi |
| 9 | Veri Tabanı & SQL Eğitimi |
| 10 | Scrum Master Eğitimi |
| 11 | CISCO Sertifikalı Ağ Uzmanı Eğitimi (CCNA) |
| 12 | Bilgi Güvenliği ve Etiği Eğitimi |
| 23 | CISCO Sertifikalı Ağ Profesyoneli (CCNP) |
| 24 | Linux Temelleri Eğitimi |
| 25 | Temel Bankacılık Kavramları ve Uygulama Eğitimi |

## Events

| Legacy ID | Title |
| --- | --- |
| 1 | Yapay Zeka ile Değişen Hayatlar |
| 2 | Psikoloji × Tasarım: Deneyim Mühendisliğinin Anatomisi |

## Blog Posts

| Legacy ID | Title |
| --- | --- |
| 1 | FPGA ve Geleneksel İşlemciler Farklar ve Avantajlar |
| 2 | İki Yıllık Bir Sistem Mühendisliği Yolculuğu |
| 3 | Network Slicing (Ağ Dilimleme) |
| 4 | Agile ve Scrum Çalışmalarında İş Analisti Rolü |
| 5 | Ulusal Dolaşım Nedir? |
| 6 | Xshell ile Sistemlerin Kontrolü |
| 7 | Open RAN (Open Radio Acces) Network - Açık Radyo Erişim Ağı |
| 8 | Savunma ve Havacılık Sanayisinde Tasarım Kalite Güvence |
| 9 | Agile'ın En Güçlü Formülü: 3 Zihin, 1 Hedef |
| 10 | Kalite Herkesin Sorumluluğudur Söylemi |
| 13 | AI Çağında Test Uzmanı: Kodun Değil, Kalitenin Koruyucusu |

## Notes

- The event list is limited to the 2 legacy event records present in `SelectedEventPage`.
- The blog post titles are taken primarily from `BlogCard.title`, which is what will be used as the new Strapi title during import.
- No registrations, students, analytics, contracts, or static page tables are included in this import scope.

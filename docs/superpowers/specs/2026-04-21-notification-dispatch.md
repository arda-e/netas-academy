# Notification Dispatch Spec

## Purpose

Bu dokuman, legacy `send_email.php` ve `EmailController` davranisinin yeni projede nasil ayrisacagini tanimlar.

## Scope

- Basvuru olustuktan sonra bilgilendirme notification'i tetikleme
- Admin/internal notification
- Gerekirse applicant confirmation email
- Delivery hata durumlarinda uygulama davranisi

## Out of Scope

- Form submit UI
- Harici SAP entegrasyonu
- Payment provider entegrasyonu

## Ownership

- `backend`: notification template secimi, routing, dispatch
- `frontend`: sadece success/error mesajlarini gosterir

## Current Repo Alignment

Bu repo zaten backend notification pattern'i kullaniyor:

- `contact_submission`
- `event_registration`

Referans:

- [backend/src/index.ts](/Users/arda/Desktop/development/netas_academy/backend/src/index.ts:5)
- [backend/src/services/internal-notifications/strapi-service.ts](/Users/arda/Desktop/development/netas_academy/backend/src/services/internal-notifications/strapi-service.ts)

## Core Rules

- Notification gonderimi ana transaction'i mecburen bloklamamali.
- Basvuru kaydi basariliysa, notification hatasi loglanip akisin status'u korunabilir.
- Email payload'i ham UI field isimleriyle degil normalized domain object ile kurulmalidir.

## Suggested Notification Keys

- `course_application_submitted`
- `course_application_manual_review`
- `course_payment_pending`
- mevcut feature icin `event_registration`
- mevcut feature icin `contact_submission`

## Suggested Payload Shape

```json
{
  "applicationId": 123,
  "course": {
    "title": "string"
  },
  "applicant": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "tckn": "masked-or-governed"
  },
  "status": "pending_payment"
}
```

## Legacy Mapping

Legacy kaynaklar:

- `Academy/Assets/Scripts/EmailController.cs`
- `send_email.php`

Legacy'deki screenshot upload ve multipart alanlari yeni projede ancak acik bir is ihtiyaci varsa tasinmalidir.

## Notes

- Screenshot upload default olarak tasinmamali.
- TCKN gibi hassas alanlar notification icinde masked veya policy kontrollu kullanilmalidir.

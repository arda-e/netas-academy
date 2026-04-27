# Applicant Lookup By TCKN Spec

## Purpose

Bu dokuman, legacy `PhpController` icindeki TCKN bazli mevcut kullanici sorgusunun yeni projede nasil ele alinacagini tanimlar.

## Scope

- TCKN ile mevcut basvuru sahibini bulma
- Daha once secilen kurs veya aktif basvuru bilgisini donme
- Form prefill icin guvenli response uretme

## Out of Scope

- Frontend form rendering
- Payment link yonlendirme

## Ownership

- `backend`: lookup, normalization, authorization, response shaping
- `frontend`: alanlari doldurma ve kullaniciya gostermesi

## Core Rules

- TCKN backend tarafinda normalize edilir.
- Response JSON olmalidir; delimiter tabanli string parse kullanilmaz.
- TCKN uzerinden veri donerken KVKK ve minimum gerekli data ilkesi uygulanmalidir.
- Bu endpoint sadece gercek bir is ihtiyaci varsa eklenmelidir; zorunlu degilse sisteme alinmamalidir.

## Suggested Endpoint

`POST /api/applicants/lookup-by-tckn`

Request:

```json
{
  "tckn": "12345678901"
}
```

Response:

```json
{
  "data": {
    "found": true,
    "applicant": {
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "address": "string"
    },
    "latestCourseApplication": {
      "courseDocumentId": "string",
      "courseTitle": "string",
      "status": "string"
    }
  }
}
```

## Legacy Mapping

Legacy kaynak:

- `Academy/Assets/Scripts/PhpController.cs`

Legacy davranis:

- `Citizen = "read"`
- `?` ile split edilen response
- UI alanlarini dogrudan doldurma
- `PlayerPrefs` icine kurs bilgisi yazma

## Migration Rule

Yeni sistemde:

- `PlayerPrefs` benzeri local persistence zorunlu olmamali
- `courseId` secimi backend response icinde acik alan olarak donmeli
- frontend yalnizca response'u consume etmeli

## Notes

- Bu feature event registration ile karistirilmamali.
- Gerekiyorsa TCKN aramasi rate-limit ve audit log ile korunmalidir.

## Error Response Contract

```json
{
  "error": {
    "code": "INVALID_TCKN" | "RATE_LIMITED" | "UNAUTHORIZED",
    "message": "Human-readable error description"
  }
}
```

- `INVALID_TCKN` — TCKN is not 11 digits or fails checksum validation
- `RATE_LIMITED` — too many requests from this caller within the time window
- `UNAUTHORIZED` — caller lacks required authentication

## Error Response Contract

```json
{
  "error": {
    "code": "INVALID_TCKN" | "RATE_LIMITED" | "UNAUTHORIZED",
    "message": "Human-readable error description"
  }
}
```

- `INVALID_TCKN` — TCKN is not 11 digits or fails checksum validation
- `RATE_LIMITED` — too many requests from this caller within the time window
- `UNAUTHORIZED` — caller lacks required authentication

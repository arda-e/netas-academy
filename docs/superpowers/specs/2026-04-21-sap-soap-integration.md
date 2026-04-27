# SAP SOAP Integration Spec

## Purpose

Bu dokuman, legacy `SplController` icindeki SOAP/SAP entegrasyon mantiginin yeni projede backend entegrasyon servisi olarak nasil konumlanmasi gerektigini tanimlar.

## Scope

- Partner request olusturma
- Sales doc request olusturma
- Response parse ve status branching
- Timeout, protocol, connection ve fallback davranisi
- Integration sonucunun application workflow'a geri beslenmesi

## Out of Scope

- UI state degisiklikleri
- Dogrudan odeme sayfasi acilmasi
- CMS/resource fetch

## Ownership

- `backend only`

Frontend bu entegrasyonu bilmez; yalnizca backend'in dondurdugu application sonucunu gorur.

## Legacy Flow

1. Partner SOAP request
2. Sales document SOAP request
3. `<Status>` parse
4. `Status == "10"` ise success
5. Diger durumlar icin fallback veya manual review

## Legacy Control Flow

### `SendSOAPRequest(name, surname)`

1. `generatedId10` uretilir.
2. `sentDate` bugunun tarihi olarak `yyyy-MM-dd` formatinda hazirlanir.
3. `fullName = name + " " + surname` olarak olusturulur.
4. Partner SOAP body hazirlanir.
5. `soap-proxy.php` endpoint'ine XML `POST` edilir.

Partner request hata verirse:

- system `manual_review` karari dondurur
- `DBUserWrite()` cagrilir
- akis biter

Partner request basariliysa:

- `PostSOAPRequest()` cagrilir

### `PostSOAPRequest()`

1. Sales document SOAP body hazirlanir.
2. `soap-proxy.php` endpoint'ine XML `POST` edilir.
3. Response XML icinden `<Status>...</Status>` degeri cikartilir.

Sales request hata verirse:

- hata loglanir
- system `manual_review` karari dondurur
- akis biter

`<Status>` bulunamazsa:

- ham XML loglanir
- hata loglanir
- system `manual_review` karari dondurur
- akis biter

`Status == "10"` ise:

- `applyPage2` acilir
- yeni UI elemanlari register edilir
- `DBUserWrite()` cagrilir
- sistem `accepted` karari dondurur

`Status != "10"` ise:

- `SendEmail()` cagrilir
- `applyFinishPage` acilir
- `DBUserWrite()` cagrilir
- kullaniciya tesekkur mesaji yazilir
- `ApplyFinishPageCoroutine()` baslatilir
- sistem `rejected` karari dondurur

## Required Behavior

- SOAP request XML'i backend tarafinda uretilir.
- Credentials, endpoint ve sabit field degerleri environment/config uzerinden yonetilir.
- XML parse string split ile degil, deterministik bir parser veya kontrollu extraction ile yapilmalidir.
- Integration sonucu ham flag degil, typed result olarak donmelidir.

## Suggested Service Interface

```ts
type SapIntegrationResult = {
  decision: "accepted" | "manual_review" | "rejected";
  statusCode?: string;
  partnerReference?: string;
  salesDocumentReference?: string;
  rawResponse?: string;
  errorReason?: string;
};
```

## Branching Rules

- `statusCode === "10"` -> `accepted`
- `statusCode bulunamazsa` -> `manual_review`
- Network/protocol hata -> `manual_review`
- Bilinen business hata kodlari -> `rejected`

## Simplified Business Rule Summary

- Partner SOAP cagrisi entegrasyona giris kapisidir.
- Partner SOAP hata verirse sistem kullaniciyi tamamen bloklamaz; akisi `manual_review` benzeri fallback ile devam ettirir.
- Sales SOAP sonucu yalnizca `<Status>` alani uzerinden yorumlanir.
- `Status == "10"` durumunda kullanici odeme/onay tarafina ilerler.
- `Status != "10"` durumunda sistem basvuruyu kaydeder, email gonderir ve finish akisina duser.
- Sales SOAP technical hata verirse veya `<Status>` parse edilemezse yeni sistemde acik bir `manual_review` karari dondurulmalidir.

## Persistence

Asagidaki bilgiler application kaydina veya integration log tablosuna yazilmalidir:

- request id
- endpoint
- generated partner id
- parsed status code
- raw response snapshot
- error summary
- final decision

## Legacy Mapping

Legacy dosya:

- `Academy/Assets/Scripts/SplController.cs`

Tasima hedefi:

- `backend/src/services/integrations/sap-soap/*`

## Notes

- SOAP failure durumunda legacy sistem akisi tamamen durdurmuyordu; yeni sistemde bunun karsiligi acikca `manual_review` olarak modellenmelidir.
- UI tarafinda `splCheck` veya `manuelCheck` benzeri flag kullanilmamali.

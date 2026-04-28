# Content API Boundary Spec

## Purpose

Bu dokuman, legacy `PageApi` generic request katmaninin yeni projede hangi sinirlarla ele alinacagini tanimlar.

## Scope

- Content read modellerinin nasil fetch edilecegi
- Resource bazli generic API yerine domain odakli fetch yaklasimi
- Frontend/backend sorumluluk siniri

## Out of Scope

- Application submission
- Payment
- SAP entegrasyonu

## Current Repo Alignment

Yeni projede content fetch icin Strapi odakli typed helper kullaniliyor:

- [frontend/src/lib/strapi.ts](/Users/arda/Desktop/development/netas_academy/frontend/src/lib/strapi.ts:1)

Bu, legacy `PageApi` katmaninin dogrudan tasinmamasi gerektigini gosterir.

## Core Rule

Legacy `PageApi` generic `res` parametreli API yapisi yeni projeye tasinmamalidir.

Bunun yerine:

- Strapi content type bazli endpointler
- typed fetch helperlar
- gerekirse feature-specific Next route handlerlar

kullanilmalidir.

## Why

- `res=...` tabanli endpointler gevsek typed yapilar uretir
- resource -> DTO -> handler haritasi frontend'e gereksiz coupling getirir
- yeni repo zaten domain bazli content modelling kullaniyor

## Allowed Patterns

- `getCourses()`
- `getEvents()`
- `getBlogPosts()`
- tekil detay fetch helperlari
- frontend tarafinda minimal normalization helperlari

## Not Recommended

- tek endpoint uzerinden tum kaynaklari query string ile secme
- `ok/message/data` wrapper mecburiyeti
- UI'da resource string ile handler baglama

## Legacy Mapping

Legacy kaynaklar:

- `Academy/Assets/AlperenScripts/PageApi.cs`
- `HomePageManager`
- `PageManager`
- `GetContracts`

## Notes

- Content fetch business logic olarak degil, read-model access layer olarak ele alinmalidir.
- Eski `PageApi`'den tasinacak sey generic wrapper degil, ihtiyac olan resource alanlarinin domain karsiligidir.

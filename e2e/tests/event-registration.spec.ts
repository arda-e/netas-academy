import { test, expect } from "@playwright/test";

/**
 * E2E: Etkinlik Kaydı — üç etkinlik tipi için kayıt formu
 *
 * Her test senaryosu:
 *   1. İlgili etkinliğin kayıt sayfasına git
 *   2. Etkinlik tipine göre alanları kontrol et (TCKN/KVKK varlığı)
 *   3. Formu doldur ve gönder
 *   4. Başarı/hata/kapalı durumunu doğrula
 *
 * Fixture etkinlikler (U1 ile seed edildi):
 *   - e2e-test-etkinlik  : etkinlik tipi, kayıtlar açık
 *   - e2e-test-egitim    : eğitim tipi, kayıtlar açık (TCKN + KVKK zorunlu)
 *   - e2e-test-kurs      : kurs tipi, kayıtlar açık (TCKN + KVKK zorunlu)
 *   - e2e-test-kapali    : etkinlik tipi, kayıtlar kapalı
 */

const BASE_URL = "http://localhost:3000";

/**
 * TCKN doğrulaması için geçerli bir test numarası.
 * Kaynak: backend/tests/api/registration/field-requirements.test.ts
 */
const VALID_TCKN = "10000000078";

async function fillRegistrationBase(
  page: import("@playwright/test").Page,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes?: string;
  }
) {
  await page.getByTestId("event-registration.field.first-name").fill(data.firstName);
  await page.getByTestId("event-registration.field.last-name").fill(data.lastName);
  await page.getByTestId("event-registration.field.email").fill(data.email);
  await page.getByTestId("event-registration.field.phone").fill(data.phone);
  if (data.notes) {
    await page.getByTestId("event-registration.field.notes").fill(data.notes);
  }
}

test.describe("Etkinlik Kaydı", () => {

  test("1. Etkinlik happy path — TCKN ve KVKK alanları görünmemeli, kayıt başarılı olmalı", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/etkinlikler/e2e-test-etkinlik/kayit`);

    await expect(page.getByTestId("event-registration.form")).toBeVisible();

    // etkinlik tipinde TCKN ve KVKK alanları DOM'da bulunmamalı
    await expect(page.getByTestId("event-registration.field.tckn")).not.toBeAttached();
    await expect(page.getByTestId("event-registration.field.kvkk-consent")).not.toBeAttached();

    await fillRegistrationBase(page, {
      firstName: "Ayşe",
      lastName: "Demir",
      email: "ayse.demir.e2e-etkinlik@example.com",
      phone: "+90 532 100 0001",
      notes: "Etkinlik hakkında ek bir notum var.",
    });

    await page.getByTestId("event-registration.submit").click();

    await expect(page.getByTestId("event-registration.success")).toBeVisible({ timeout: 10_000 });
    console.log("[E2E] ✅ Etkinlik kaydı başarıyla tamamlandı");
  });

  test("2. Eğitim happy path — TCKN ve KVKK alanları görünmeli, kayıt başarılı olmalı", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/etkinlikler/e2e-test-egitim/kayit`);

    await expect(page.getByTestId("event-registration.form")).toBeVisible();

    // eğitim tipinde TCKN ve KVKK alanları mevcut olmalı
    await expect(page.getByTestId("event-registration.field.tckn")).toBeVisible();
    await expect(page.getByTestId("event-registration.field.kvkk-consent")).toBeVisible();

    await fillRegistrationBase(page, {
      firstName: "Mehmet",
      lastName: "Yıldız",
      email: "mehmet.yildiz.e2e-egitim@example.com",
      phone: "+90 532 200 0002",
    });

    await page.getByTestId("event-registration.field.tckn").fill(VALID_TCKN);
    await page.getByTestId("event-registration.field.kvkk-consent").check();

    await page.getByTestId("event-registration.submit").click();

    await expect(page.getByTestId("event-registration.success")).toBeVisible({ timeout: 10_000 });
    console.log("[E2E] ✅ Eğitim kaydı başarıyla tamamlandı");
  });

  test("3. Kurs happy path — TCKN ve KVKK alanları görünmeli, kayıt başarılı olmalı", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/etkinlikler/e2e-test-kurs/kayit`);

    await expect(page.getByTestId("event-registration.form")).toBeVisible();

    // kurs tipinde TCKN ve KVKK alanları mevcut olmalı
    await expect(page.getByTestId("event-registration.field.tckn")).toBeVisible();
    await expect(page.getByTestId("event-registration.field.kvkk-consent")).toBeVisible();

    await fillRegistrationBase(page, {
      firstName: "Fatih",
      lastName: "Çelik",
      email: "fatih.celik.e2e-kurs@example.com",
      phone: "+90 532 300 0003",
    });

    await page.getByTestId("event-registration.field.tckn").fill(VALID_TCKN);
    await page.getByTestId("event-registration.field.kvkk-consent").check();

    await page.getByTestId("event-registration.submit").click();

    await expect(page.getByTestId("event-registration.success")).toBeVisible({ timeout: 10_000 });
    console.log("[E2E] ✅ Kurs kaydı başarıyla tamamlandı");
  });

  test("4. Eğitim TCKN doğrulama hatası — geçersiz TCKN girildiğinde hata gösterilmeli", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/etkinlikler/e2e-test-egitim/kayit`);

    await expect(page.getByTestId("event-registration.form")).toBeVisible();

    await fillRegistrationBase(page, {
      firstName: "Zeynep",
      lastName: "Kara",
      email: "zeynep.kara.e2e-tckn-hata@example.com",
      phone: "+90 532 400 0004",
    });

    // Geçersiz TCKN (algoritma kontrolünden geçmez)
    await page.getByTestId("event-registration.field.tckn").fill("12345");
    await page.getByTestId("event-registration.field.kvkk-consent").check();

    await page.getByTestId("event-registration.submit").click();

    await expect(page.getByTestId("event-registration.error")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("event-registration.success")).not.toBeAttached();
    console.log("[E2E] ✅ Geçersiz TCKN için hata mesajı doğrulandı");
  });

  test("5. Eğitim KVKK onayı verilmezse hata gösterilmeli", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/etkinlikler/e2e-test-egitim/kayit`);

    await expect(page.getByTestId("event-registration.form")).toBeVisible();

    await fillRegistrationBase(page, {
      firstName: "Elif",
      lastName: "Arslan",
      email: "elif.arslan.e2e-kvkk-hata@example.com",
      phone: "+90 532 500 0005",
    });

    await page.getByTestId("event-registration.field.tckn").fill(VALID_TCKN);
    // KVKK onayı kasıtlı olarak işaretlenmedi

    await page.getByTestId("event-registration.submit").click();

    await expect(page.getByTestId("event-registration.error")).toBeVisible({ timeout: 10_000 });
    console.log("[E2E] ✅ KVKK onayı verilmediğinde hata mesajı doğrulandı");
  });

  test("6. Kapalı etkinlik — kapalı durum gösterilmeli, form bulunmamalı", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/etkinlikler/e2e-test-kapali/kayit`);

    await expect(page.getByTestId("page.event-registration.closed-state")).toBeVisible();
    await expect(page.getByTestId("event-registration.form")).not.toBeAttached();
    console.log("[E2E] ✅ Kapalı etkinlik için kapalı durum ekranı doğrulandı");
  });

  test("7. Idempotent duplicate — aynı e-posta ile ikinci kayıt da başarılı olmalı", async ({ page }) => {
    const email = "e2e-duplicate-test@example.com";

    // İlk kayıt
    await page.goto(`${BASE_URL}/tr/etkinlikler/e2e-test-etkinlik/kayit`);
    await expect(page.getByTestId("event-registration.form")).toBeVisible();

    await fillRegistrationBase(page, {
      firstName: "Birinci",
      lastName: "Kayıt",
      email,
      phone: "+90 532 600 0006",
    });

    await page.getByTestId("event-registration.submit").click();
    await expect(page.getByTestId("event-registration.success")).toBeVisible({ timeout: 10_000 });
    console.log("[E2E] ✅ İlk kayıt başarıyla tamamlandı");

    // Sayfa yenileme — aynı e-posta, farklı ad
    await page.goto(`${BASE_URL}/tr/etkinlikler/e2e-test-etkinlik/kayit`);
    await expect(page.getByTestId("event-registration.form")).toBeVisible();

    await fillRegistrationBase(page, {
      firstName: "İkinci",
      lastName: "Kayıt",
      email,
      phone: "+90 532 600 0006",
    });

    await page.getByTestId("event-registration.submit").click();

    // Backend, aynı öğrenci × etkinlik çiftini idempotent olarak işler
    await expect(page.getByTestId("event-registration.success")).toBeVisible({ timeout: 10_000 });
    console.log("[E2E] ✅ Duplicate kayıt idempotent olarak başarıyla işlendi");
  });

});

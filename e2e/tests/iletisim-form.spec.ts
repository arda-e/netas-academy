import { test, expect } from "@playwright/test";

/**
 * E2E: İletişim formu — 4 farklı intent için form doldur ve gönder
 *
 * Her test senaryosu:
 *   1. /tr/iletisim sayfasına git
 *   2. İlgili sekmeye tıkla
 *   3. Ortak alanları doldur (fullName, email, phone, company, message)
 *   4. Sekmeye özel alanları doldur
 *   5. KVKK onayını işaretle
 *   6. Gönder butonuna tıkla
 *   7. Başarı mesajının görüntülendiğini doğrula
 */

const BASE_URL = "http://localhost:3000";

/**
 * Switch to a tab and wait for React's tab-change useEffect to complete.
 *
 * The form's useEffect runs reset() *after* the browser paint (React's
 * scheduling), so just waiting for a tab-specific element to appear is not
 * enough — the effect hasn't fired yet. We wait for the fullName field to
 * clear, which is a reliable signal the reset() call has executed.
 */
async function switchTab(page: import("@playwright/test").Page, tabTestId: string) {
  await page.getByTestId(tabTestId).click();
  // Wait for the tab-change reset() effect to clear the form fields
  await expect(page.getByTestId("contact-lead.field.full-name")).toHaveValue("", { timeout: 3000 });
  // Small buffer so any downstream watch/persist effects also settle
  await page.waitForTimeout(100);
}

async function fillCommonFields(page: import("@playwright/test").Page, data: {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
}) {
  await page.getByTestId("contact-lead.field.full-name").fill(data.fullName);
  await page.getByTestId("contact-lead.field.email").fill(data.email);
  await page.getByTestId("contact-lead.field.phone").fill(data.phone);
  if (data.company) {
    await page.getByTestId("contact-lead.field.company").fill(data.company);
  }
  await page.getByTestId("contact-lead.field.message").fill(data.message);
  await page.getByTestId("contact-lead.field.kvkk-consent").check();
}

/** Wait for the watch() subscription in the form to flush to sessionStorage. */
async function waitForStorageWrite(page: import("@playwright/test").Page) {
  await page.waitForTimeout(200);
}

test.describe("İletişim Formu — 4 intent", () => {

  test("1. Kurumsal Eğitim Talebi gönderimi başarılı olmalı", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/iletisim`);
    await expect(page.getByTestId("contact-lead.form")).toBeVisible();

    // Sekme zaten aktif (default) — korporatif tab için reset gerekmez
    await page.getByTestId("contact-lead.tab.corporate_training_request").click();
    await page.waitForTimeout(100); // let any effects settle

    await fillCommonFields(page, {
      fullName: "Ahmet Yılmaz",
      email: "ahmet.yilmaz@testfirma.com",
      phone: "+90 532 111 2233",
      company: "Test Firma A.Ş.",
      message: "Siber güvenlik alanında kurumsal eğitim almak istiyoruz. Ekibimiz 15 kişiden oluşmaktadır.",
    });

    await page.getByTestId("contact-lead.field.interest-topic").fill("Siber Güvenlik");

    await page.getByTestId("contact-lead.submit").click();

    await expect(page.getByTestId("contact-lead.success")).toBeVisible({ timeout: 10_000 });
    console.log("[E2E] ✅ Kurumsal Eğitim Talebi başarıyla gönderildi");
  });

  test("2. Eğitmen Başvurusu gönderimi başarılı olmalı", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/iletisim`);
    await expect(page.getByTestId("contact-lead.form")).toBeVisible();

    await switchTab(page, "contact-lead.tab.instructor_application");

    await fillCommonFields(page, {
      fullName: "Zeynep Kaya",
      email: "zeynep.kaya@egitmen.com",
      phone: "+90 533 444 5566",
      message: "Veri bilimi ve makine öğrenmesi konularında eğitmen olmak istiyorum.",
    });

    await page.getByTestId("contact-lead.field.expertise-areas").fill(
      "Python, TensorFlow, Scikit-learn, Veri Analizi, Makine Öğrenmesi"
    );

    await page.getByTestId("contact-lead.submit").click();

    await expect(page.getByTestId("contact-lead.success")).toBeVisible({ timeout: 10_000 });
    console.log("[E2E] ✅ Eğitmen Başvurusu başarıyla gönderildi");
  });

  test("3. Çözüm Ortağı Başvurusu gönderimi başarılı olmalı", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/iletisim`);
    await expect(page.getByTestId("contact-lead.form")).toBeVisible();

    await switchTab(page, "contact-lead.tab.solution_partner_application");

    await fillCommonFields(page, {
      fullName: "Meriç Arda Eren",
      email: "mericardaeren@gmail.com",
      phone: "+90 534 777 8899",
      company: "Ortak Teknoloji Ltd.",
      message: "Çözüm ortaklığı programınıza dahil olmak istiyoruz. Yazılım geliştirme alanında hizmet veriyoruz.",
    });

    await page.getByTestId("contact-lead.field.company-size").fill("50-100 çalışan");
    await page.getByTestId("contact-lead.field.partnership-details").fill(
      "Yazılım geliştirme ve bulut altyapı hizmetleri sunuyoruz. Eğitim platformunuzla entegrasyon konusunda işbirliği yapmak istiyoruz."
    );

    await page.getByTestId("contact-lead.submit").click();

    await expect(page.getByTestId("contact-lead.success")).toBeVisible({ timeout: 10_000 });
    console.log("[E2E] ✅ Çözüm Ortağı Başvurusu başarıyla gönderildi");
  });

  test("4. Genel İletişim gönderimi başarılı olmalı", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/iletisim`);
    await expect(page.getByTestId("contact-lead.form")).toBeVisible();

    await switchTab(page, "contact-lead.tab.general_contact");

    await fillCommonFields(page, {
      fullName: "Fatma Şahin",
      email: "fatma.sahin@ornek.com",
      phone: "+90 535 000 1122",
      message: "Eğitim programlarınız hakkında genel bilgi almak istiyorum. Bireysel olarak kayıt olmak mümkün mü?",
    });

    await page.getByTestId("contact-lead.submit").click();

    await expect(page.getByTestId("contact-lead.success")).toBeVisible({ timeout: 10_000 });
    console.log("[E2E] ✅ Genel İletişim başarıyla gönderildi");
  });

});

/**
 * E2E: Form kalıcılığı — sayfa yenileme davranışı
 *
 * Formun React watch() aboneliği her değişikliği sessionStorage'a yazar.
 * Mount sırasında ilk useEffect o anahtarı yükler. Bu describe bloğu
 * üç senaryoyu kapsar:
 *
 *   5. Gönderilmemiş taslak, sayfa yenilemeden sonra korunmalı
 *   6. Başarılı gönderim sessionStorage'ı temizler; yenileme boş form göstermeli
 *   7. Sekme değişimi önceki sekmenin taslağını siler; yenileme boş form göstermeli
 */
test.describe("İletişim Formu — Sayfa Yenileme Davranışı", () => {

  test("5. Gönderilmemiş taslak sayfa yenilemesinde korunmalı", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/iletisim`);
    await expect(page.getByTestId("contact-lead.form")).toBeVisible();

    await page.getByTestId("contact-lead.field.full-name").fill("Taslak Kullanıcı");
    await page.getByTestId("contact-lead.field.email").fill("taslak@ornek.com");
    await page.getByTestId("contact-lead.field.phone").fill("+90 532 000 1111");
    await page.getByTestId("contact-lead.field.message").fill("Bu mesaj yenileme sonrası görünmeli.");

    // React watch() subscription writes to sessionStorage asynchronously
    await waitForStorageWrite(page);

    await page.reload();
    await expect(page.getByTestId("contact-lead.form")).toBeVisible();

    await expect(page.getByTestId("contact-lead.field.full-name")).toHaveValue("Taslak Kullanıcı");
    await expect(page.getByTestId("contact-lead.field.email")).toHaveValue("taslak@ornek.com");
    await expect(page.getByTestId("contact-lead.field.phone")).toHaveValue("+90 532 000 1111");
    await expect(page.getByTestId("contact-lead.field.message")).toHaveValue("Bu mesaj yenileme sonrası görünmeli.");
    console.log("[E2E] ✅ Taslak veriler sayfa yenilemesinde korundu");
  });

  test("6. Başarılı gönderim sonrası sayfa yenilemesinde form boş olmalı", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/iletisim`);
    await expect(page.getByTestId("contact-lead.form")).toBeVisible();

    // Use general_contact — no tab-specific required fields, so submission always succeeds
    await switchTab(page, "contact-lead.tab.general_contact");

    await fillCommonFields(page, {
      fullName: "Gönderim Sonrası Kullanıcı",
      email: "gonderimsonrasi@ornek.com",
      phone: "+90 533 111 2222",
      message: "Bu gönderim sessionStorage'ı temizlemeli.",
    });

    await page.getByTestId("contact-lead.submit").click();
    await expect(page.getByTestId("contact-lead.success")).toBeVisible({ timeout: 10_000 });

    // clearStorage() is called on submit success, so a reload should show an empty form
    await page.reload();
    await expect(page.getByTestId("contact-lead.form")).toBeVisible();

    await expect(page.getByTestId("contact-lead.field.full-name")).toHaveValue("");
    await expect(page.getByTestId("contact-lead.field.email")).toHaveValue("");
    await expect(page.getByTestId("contact-lead.field.message")).toHaveValue("");
    console.log("[E2E] ✅ Başarılı gönderim sonrası sayfa yenilemesinde form boş görüntülendi");
  });

  test("7. Sekme değişimi önceki sekmenin taslağını siler; yenilemede form boş olmalı", async ({ page }) => {
    await page.goto(`${BASE_URL}/tr/iletisim`);
    await expect(page.getByTestId("contact-lead.form")).toBeVisible();

    // Fill the default (corporate_training_request) tab
    await page.getByTestId("contact-lead.field.full-name").fill("Sekme Değiştirme Testi");
    await page.getByTestId("contact-lead.field.email").fill("sekme@ornek.com");
    await waitForStorageWrite(page);

    // Switching tabs triggers the React useEffect that clears the previous tab's storage
    await switchTab(page, "contact-lead.tab.general_contact");

    // Reload: no ?intent= in URL, so initialLeadType is corporate_training_request again.
    // That storage key was cleared by the tab-switch effect, so the form should be empty.
    await page.reload();
    await expect(page.getByTestId("contact-lead.form")).toBeVisible();

    await expect(page.getByTestId("contact-lead.field.full-name")).toHaveValue("");
    await expect(page.getByTestId("contact-lead.field.email")).toHaveValue("");
    console.log("[E2E] ✅ Sekme değişimi sonrası sayfa yenilemesinde form boş görüntülendi");
  });

});

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Textarea,
  Typography,
  Flex,
  Field,
  Alert,
  Loader,
} from '@strapi/design-system';
import { ArrowsCounterClockwise, Check } from '@strapi/icons';
import { getConfirmationTemplate, updateConfirmationTemplate, resetConfirmationTemplate } from '../utils/api';

const AVAILABLE_VARIABLES = [
  { variable: '{{ event.title }}', description: 'Etkinlik adı' },
  { variable: '{{ event.startsAt }}', description: 'Etkinlik tarihi' },
  { variable: '{{ event.location }}', description: 'Etkinlik yeri' },
  { variable: '{{ event.meetingLink }}', description: 'Toplantı linki' },
];

const ConfirmationTemplatePage: React.FC = () => {
  const [htmlBody, setHtmlBody] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const loadTemplate = useCallback(async () => {
    try {
      const result = await getConfirmationTemplate();
      if (result.data) {
        setHtmlBody(result.data.htmlBody || '');
        setEnabled(result.data.enabled ?? true);
      }
    } catch (error: any) {
      setAlert({ type: 'danger', message: 'Şablon yüklenemedi: ' + error.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const clearAlert = () => setAlert(null);

  const handleSave = async () => {
    setIsSaving(true);
    clearAlert();

    try {
      await updateConfirmationTemplate(htmlBody, enabled);
      setAlert({ type: 'success', message: 'Şablon kaydedildi.' });
    } catch (error: any) {
      setAlert({ type: 'danger', message: 'Kaydedilemedi: ' + error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    clearAlert();

    try {
      const result = await resetConfirmationTemplate();
      if (result.data) {
        setHtmlBody(result.data.htmlBody || '');
        setEnabled(result.data.enabled ?? true);
      }
      setAlert({ type: 'success', message: 'Şablon varsayılana döndürüldü.' });
    } catch (error: any) {
      setAlert({ type: 'danger', message: 'Sıfırlanamadı: ' + error.message });
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <Box padding={8} background="neutral0">
        <Flex justifyContent="center">
          <Loader>Yükleniyor...</Loader>
        </Flex>
      </Box>
    );
  }

  return (
    <Box padding={8} background="neutral0" hasRadius>
      <Flex direction="column" gap={4}>
        <Typography variant="beta" as="h1">
          Onay E-posta Şablonu
        </Typography>

        {alert && (
          <Alert
            variant={alert.type}
            onClose={clearAlert}
            title={alert.message}
          />
        )}

        <Box padding={4} background="neutral100" hasRadius>
          <Typography variant="delta" as="h3">
            Kullanılabilir Değişkenler
          </Typography>
          <Flex direction="column" gap={1} marginTop={2}>
            {AVAILABLE_VARIABLES.map((v) => (
              <Typography key={v.variable} variant="omega">
                <code>{v.variable}</code> — {v.description}
              </Typography>
            ))}
          </Flex>
        </Box>

        <Field.Root name="htmlBody" required>
          <Field.Label>HTML Şablon İçeriği</Field.Label>
          <Textarea
            value={htmlBody}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHtmlBody(e.target.value)}
            rows={16}
            placeholder="<html>..."
          />
        </Field.Root>

        <Flex gap={2}>
          <Button
            variant="primary"
            startIcon={<Check />}
            loading={isSaving}
            disabled={isResetting}
            onClick={handleSave}
          >
            Kaydet
          </Button>
          <Button
            variant="tertiary"
            startIcon={<ArrowsCounterClockwise />}
            loading={isResetting}
            disabled={isSaving}
            onClick={handleReset}
          >
            Varsayılana Dön
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ConfirmationTemplatePage;

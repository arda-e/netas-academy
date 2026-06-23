import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  TextInput,
  Textarea,
  Typography,
  Flex,
  Checkbox,
  Field,
  Alert,
  Badge,
} from '@strapi/design-system';
import { Mail } from '@strapi/icons';
import { sendManualEmail, sendTestEmail } from '../utils/api';
import ConfirmationModal from './ConfirmationModal';

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Onaylandı' },
  { value: 'pending', label: 'Beklemede' },
  { value: 'waitlisted', label: 'Yedek' },
  { value: 'attended', label: 'Katıldı' },
  { value: 'cancelled', label: 'İptal' },
];

interface EmailComposePanelProps {
  documentId: string;
}

const EmailComposePanel: React.FC<EmailComposePanelProps> = ({ documentId }) => {
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['confirmed']);
  const [isSending, setIsSending] = useState(false);
  const [isTestSending, setIsTestSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const toggleStatus = useCallback((status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }, []);

  const clearAlert = () => setAlert(null);

  const handleTestSend = async () => {
    if (!documentId || !subject || !htmlBody) {
      setAlert({ type: 'danger', message: 'Konu ve HTML içeriği zorunludur.' });
      return;
    }

    setIsTestSending(true);
    clearAlert();

    try {
      await sendTestEmail(documentId, { subject, htmlBody });
      setAlert({ type: 'success', message: 'Test e-postası gönderildi.' });
    } catch (error: any) {
      setAlert({ type: 'danger', message: error.message || 'Test e-postası gönderilemedi.' });
    } finally {
      setIsTestSending(false);
    }
  };

  const handleSend = async () => {
    if (!documentId || !subject || !htmlBody) {
      setAlert({ type: 'danger', message: 'Konu ve HTML içeriği zorunludur.' });
      return;
    }

    setIsSending(true);
    clearAlert();

    try {
      const result = await sendManualEmail(documentId, {
        subject,
        htmlBody,
        statuses: selectedStatuses,
      });
      setAlert({
        type: 'success',
        message: `${result.data.sentRecipients} alıcıya gönderildi.`,
      });
      setSubject('');
      setHtmlBody('');
    } catch (error: any) {
      setAlert({ type: 'danger', message: error.message || 'E-posta gönderilemedi.' });
    } finally {
      setIsSending(false);
      setShowConfirm(false);
    }
  };

  return (
    <Box width="100%">
      <Flex direction="column" gap={3}>
        <Typography variant="delta" as="h2">
          E-posta Gönder
        </Typography>

        {alert && (
          <Alert
            variant={alert.type}
            onClose={clearAlert}
            title={alert.message}
          />
        )}

        <Field.Root name="subject" required>
          <Field.Label>Konu</Field.Label>
          <TextInput
            placeholder="E-posta konusunu girin"
            value={subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
          />
        </Field.Root>

        <Field.Root name="htmlBody" required>
          <Field.Label>HTML İçeriği</Field.Label>
          <Textarea
            placeholder="HTML içeriğini buraya yapıştırın..."
            value={htmlBody}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHtmlBody(e.target.value)}
            rows={6}
          />
        </Field.Root>

        <Box>
          <Typography variant="omega" fontWeight="bold">
            Alıcı Durumları
          </Typography>
          <Flex gap={2} wrap="wrap" marginTop={2}>
            {STATUS_OPTIONS.map((status) => (
              <Checkbox
                key={status.value}
                checked={selectedStatuses.includes(status.value)}
                onCheckedChange={() => toggleStatus(status.value)}
              >
                {status.label}
              </Checkbox>
            ))}
          </Flex>
        </Box>

        {selectedStatuses.length > 0 && (
          <Badge>
            {selectedStatuses.length} durum seçildi
          </Badge>
        )}

        <Flex gap={2}>
          <Button
            variant="tertiary"
            startIcon={<Mail />}
            loading={isTestSending}
            disabled={isSending || !subject || !htmlBody}
            onClick={handleTestSend}
          >
            Kendime Test Gönder
          </Button>
          <Button
            variant="primary"
            startIcon={<Mail />}
            loading={isSending}
            disabled={isTestSending || !subject || !htmlBody || selectedStatuses.length === 0}
            onClick={() => setShowConfirm(true)}
          >
            Gönder
          </Button>
        </Flex>
      </Flex>

      {showConfirm && (
        <ConfirmationModal
          statuses={selectedStatuses}
          onConfirm={handleSend}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </Box>
  );
};

export default EmailComposePanel;

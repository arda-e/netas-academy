import React from 'react';
import {
  Modal,
  Button,
  Typography,
  Flex,
  Box,
} from '@strapi/design-system';

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Onaylandı',
  pending: 'Beklemede',
  waitlisted: 'Yedek',
  attended: 'Katıldı',
  cancelled: 'İptal',
};

interface ConfirmationModalProps {
  statuses: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  statuses,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal.Root open onOpenChange={onCancel}>
      <Modal.Content>
        <Modal.Header>
          <Typography variant="beta" as="h2">
            E-postayı Göndermek İstediğinize Emin Misiniz?
          </Typography>
        </Modal.Header>
        <Modal.Body>
          <Typography>
            Bu işlem geri alınamaz. Aşağıdaki durumlara sahip tüm alıcılara e-posta gönderilecek:
          </Typography>
          <Box marginTop={2}>
            <Flex direction="column" gap={1}>
              {statuses.map((status) => (
                <Typography key={status}>
                  • {STATUS_LABELS[status] || status}
                </Typography>
              ))}
            </Flex>
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <Flex gap={2} justifyContent="flex-end" width="100%">
            <Button variant="tertiary" onClick={onCancel}>
              İptal
            </Button>
            <Button variant="primary" onClick={onConfirm}>
              Alıcılara Gönder
            </Button>
          </Flex>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default ConfirmationModal;

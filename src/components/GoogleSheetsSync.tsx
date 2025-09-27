import React, { useState } from 'react';
import { Modal, Button, Group, Text, Alert, Progress, Stack } from '@mantine/core';
import { IconCloudUpload, IconCloudDownload, IconRefresh, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface GoogleSheetsSyncProps {
  opened: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({ opened, onClose, onSyncComplete }) => {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const performSync = async (action: 'sync-from-sheets' | 'sync-to-sheets' | 'two-way-sync') => {
    setSyncing(true);
    setProgress(0);
    
    const actionLabels = {
      'sync-from-sheets': 'Syncing from Google Sheets to Database',
      'sync-to-sheets': 'Syncing from Database to Google Sheets',
      'two-way-sync': 'Performing Two-way Sync'
    };
    
    setCurrentAction(actionLabels[action]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`${supabaseUrl}/functions/v1/google-sheets-sync?action=${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sync failed');
      }

      const result = await response.json();
      
      notifications.show({
        title: 'Sync Successful',
        message: result.message,
        color: 'green',
        icon: <IconCheck size={16} />
      });

      if (onSyncComplete) {
        onSyncComplete();
      }

    } catch (error) {
      console.error('Sync error:', error);
      notifications.show({
        title: 'Sync Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setSyncing(false);
      setProgress(0);
      setCurrentAction('');
    }
  };

  const handleClose = () => {
    if (!syncing) {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Google Sheets Sync"
      size="md"
      closeOnClickOutside={!syncing}
      closeOnEscape={!syncing}
    >
      <Stack gap="md">
        <Alert color="blue" icon={<IconCloudUpload size={16} />}>
          <Text size="sm">
            Sync your data between Google Sheets and the database. Make sure your Google Service Account 
            has editor access to the spreadsheet.
          </Text>
        </Alert>

        {syncing && (
          <div>
            <Text size="sm" mb="xs" style={{ color: '#000' }}>
              {currentAction}... {Math.round(progress)}%
            </Text>
            <Progress value={progress} animated />
          </div>
        )}

        <Group grow>
          <Button
            leftSection={<IconCloudDownload size={16} />}
            onClick={() => performSync('sync-from-sheets')}
            disabled={syncing}
            variant="light"
            color="blue"
          >
            Sheets → Database
          </Button>
          
          <Button
            leftSection={<IconCloudUpload size={16} />}
            onClick={() => performSync('sync-to-sheets')}
            disabled={syncing}
            variant="light"
            color="green"
          >
            Database → Sheets
          </Button>
        </Group>

        <Button
          leftSection={<IconRefresh size={16} />}
          onClick={() => performSync('two-way-sync')}
          disabled={syncing}
          variant="filled"
          color="orange"
          fullWidth
        >
          Two-way Sync
        </Button>

        <Group justify="flex-end">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={syncing}
          >
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default GoogleSheetsSync;
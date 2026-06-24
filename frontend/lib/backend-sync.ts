import { getConnection, getAiApiKey } from './app-state';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

/**
 * Synchronizes the current user's database connection and API keys from Next.js (MongoDB)
 * to the Python FastAPI backend's session manager so the python agent has context.
 */
export async function syncSessionToBackend(clientId: string): Promise<void> {
  try {
    // 1. Fetch active connection
    const connection = await getConnection();
    if (connection) {
      const connPayload = {
        type: connection.type,
        name: connection.name,
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password || '',
        database: connection.database,
        filepath: connection.filepath,
      };

      const connRes = await fetch(`${BACKEND_URL}/api/connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-prepsql-session-id': clientId,
        },
        body: JSON.stringify(connPayload),
      });

      if (!connRes.ok) {
        const errorText = await connRes.text();
        console.error(`[Sync] Failed to sync connection to backend: ${connRes.status} - ${errorText}`);
        throw new Error(`Failed to sync database connection to backend: ${errorText || connRes.statusText}`);
      }
    }

    // 2. Fetch AI API key
    const aiConfig = await getAiApiKey();
    if (aiConfig?.key) {
      const settingsRes = await fetch(`${BACKEND_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-prepsql-session-id': clientId,
        },
        body: JSON.stringify({
          apiKey: aiConfig.key,
        }),
      });

      if (!settingsRes.ok) {
        const errorText = await settingsRes.text();
        console.error(`[Sync] Failed to sync settings/API key to backend: ${settingsRes.status} - ${errorText}`);
      }
    }
  } catch (error) {
    console.error('[Sync Error] Session synchronization with Python backend failed:', error);
  }
}

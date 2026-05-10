import React from 'react';
import { PLUGIN_ID } from './pluginId';
import EmailComposePanel from './components/EmailComposePanel';

type EditViewPanelProps = {
  model: string;
  documentId?: string;
};

const EventEmailSidePanel = ({ model, documentId }: EditViewPanelProps) => {
  if (model !== 'api::event.event' || !documentId) {
    return null;
  }

  return {
    title: 'İletişim Merkezi',
    content: React.createElement(EmailComposePanel, { documentId }),
  };
};

/**
 * iletisim-merkezi admin plugin entry.
 *
 * Registers:
 * 1. Content-manager side panel on the Event edit view
 * 2. Settings page for confirmation template management
 */
const admin = {
  register(app: any) {
    // Register the plugin itself
    app.registerPlugin({
      id: PLUGIN_ID,
      name: 'İletişim Merkezi',
    });

    // Register settings page for confirmation template
    app.addSettingsLink('global', {
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'İletişim Merkezi',
      },
      id: PLUGIN_ID,
      to: `${PLUGIN_ID}/confirmation-template`,
      Component: () => import('./pages/ConfirmationTemplatePage'),
      permissions: [],
    });
  },

  bootstrap(app: any) {
    const contentManager = app.getPlugin('content-manager');

    contentManager.apis.addEditViewSidePanel((panels: unknown[]) => {
      const actionsPanelIndex = panels.findIndex((panel: any) => panel.type === 'actions');

      if (actionsPanelIndex === -1) {
        return [...panels, EventEmailSidePanel];
      }

      return [
        ...panels.slice(0, actionsPanelIndex + 1),
        EventEmailSidePanel,
        ...panels.slice(actionsPanelIndex + 1),
      ];
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    const translations = await Promise.all(
      locales.map(async (locale: string) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );

    return translations;
  },
};

export default admin;

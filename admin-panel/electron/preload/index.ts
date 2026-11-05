import { contextBridge, ipcRenderer } from 'electron';

export type ImageDialogResult = {
  fileBuffer: string; // base64
  mimeType: string;
  fileName: string;
} | null;

const electronAPI = {
  isElectron: true as const,
  platform: process.platform,

  // Window controls
  minimize:     () => ipcRenderer.send('win:minimize'),
  maximize:     () => ipcRenderer.send('win:maximize'),
  close:        () => ipcRenderer.send('win:close'),
  isMaximized:  (): Promise<boolean> => ipcRenderer.invoke('win:is-maximized'),

  // Maximize state subscription
  onMaximizeChange: (cb: (maximized: boolean) => void) => {
    const handler = (_: Electron.IpcRendererEvent, val: boolean) => cb(val);
    ipcRenderer.on('win:maximize-change', handler);
    return () => ipcRenderer.removeListener('win:maximize-change', handler);
  },

  // Menu navigation
  onNavigate: (cb: (path: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, path: string) => cb(path);
    ipcRenderer.on('menu:navigate', handler);
    return () => ipcRenderer.removeListener('menu:navigate', handler);
  },

  // Native file dialog
  openImageDialog: (): Promise<ImageDialogResult> =>
    ipcRenderer.invoke('dialog:open-image'),

  // OS notifications
  notify: (title: string, body: string): Promise<void> =>
    ipcRenderer.invoke('notify', { title, body }),

  // App info
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),

  // Open URL in default browser
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('open:external', url),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;

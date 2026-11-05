export type ImageDialogResult = {
  fileBuffer: string;
  mimeType: string;
  fileName: string;
} | null;

interface ElectronAPI {
  readonly isElectron: true;
  readonly platform: NodeJS.Platform;

  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;

  onMaximizeChange: (cb: (maximized: boolean) => void) => () => void;
  onNavigate: (cb: (path: string) => void) => () => void;

  openImageDialog: () => Promise<ImageDialogResult>;
  notify: (title: string, body: string) => Promise<void>;
  getVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

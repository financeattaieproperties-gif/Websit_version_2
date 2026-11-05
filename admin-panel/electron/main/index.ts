import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
  dialog,
  Notification,
  shell,
} from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

// ── Window state persistence ──────────────────────────────────────────────────
const stateFile = join(app.getPath('userData'), 'window-state.json');

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  maximized: boolean;
}

function loadWindowState(): WindowState {
  try {
    if (existsSync(stateFile)) {
      return JSON.parse(readFileSync(stateFile, 'utf-8'));
    }
  } catch { /* ignore */ }
  return { width: 1300, height: 820, maximized: false };
}

function saveWindowState(win: BrowserWindow) {
  try {
    const bounds = win.getBounds();
    const state: WindowState = {
      ...bounds,
      maximized: win.isMaximized(),
    };
    writeFileSync(stateFile, JSON.stringify(state));
  } catch { /* ignore */ }
}

// ── Single instance lock ──────────────────────────────────────────────────────
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// ── Globals ───────────────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const isDev = !app.isPackaged;

// ── Tray icon (inline 16×16 PNG, gold "A") ───────────────────────────────────
const TRAY_ICON_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAoklEQVQ4T2NkIBIwEqmPgWoGHPj/' +
  'fxsDA8M2BgaGk0D8nxgNQxoYGBh2MjAwlJKqgYGBgeH///+JBLQxMDAcJEYzA8MB/f//zxPS' +
  'QBCgugFkACMDAwMDiQaQYADFDSBBA5INoLgBJGhA0gYUNyBpA4obUNSAogYUNSBpA4obUNQA' +
  'ZQNKGlDUgKIGJG1AcQOKGlDUgGQDShpQ1ICiBiRtAADHVxMRkFMHeAAAAABJRU5ErkJggg==';

function createTray(win: BrowserWindow) {
  const icon = nativeImage.createFromDataURL(`data:image/png;base64,${TRAY_ICON_B64}`);
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('Attaie Admin');

  const menu = Menu.buildFromTemplate([
    {
      label: 'Show / Hide',
      click: () => {
        if (win.isVisible()) win.hide();
        else { win.show(); win.focus(); }
      },
    },
    { type: 'separator' },
    { label: 'Quit Attaie Admin', click: () => app.quit() },
  ]);

  tray.setContextMenu(menu);
  tray.on('double-click', () => { win.show(); win.focus(); });
}

// ── Native app menu ────────────────────────────────────────────────────────────
function buildAppMenu(win: BrowserWindow) {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        ...(isDev ? [{ role: 'toggleDevTools' as const }] : []),
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          click: () => win.minimize(),
        },
        {
          label: 'Toggle Maximize',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => win.isMaximized() ? win.unmaximize() : win.maximize(),
        },
        { type: 'separator' },
        {
          label: 'Navigate to Properties',
          accelerator: 'CmdOrCtrl+1',
          click: () => win.webContents.send('menu:navigate', '/properties'),
        },
        {
          label: 'Navigate to Projects',
          accelerator: 'CmdOrCtrl+2',
          click: () => win.webContents.send('menu:navigate', '/projects'),
        },
        {
          label: 'Navigate to Leads',
          accelerator: 'CmdOrCtrl+3',
          click: () => win.webContents.send('menu:navigate', '/leads'),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── IPC Handlers ──────────────────────────────────────────────────────────────
function registerIPC(win: BrowserWindow) {
  // Window controls
  ipcMain.on('win:minimize', () => win.minimize());
  ipcMain.on('win:maximize', () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on('win:close', () => win.close());
  ipcMain.handle('win:is-maximized', () => win.isMaximized());

  // Native image file dialog
  ipcMain.handle('dialog:open-image', async () => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Select Property Image',
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] },
      ],
    });
    if (result.canceled || result.filePaths.length === 0) return null;

    const filePath = result.filePaths[0];
    const { readFileSync: read } = await import('fs');
    const buf = read(filePath);
    const ext = filePath.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg',
      png: 'image/png', webp: 'image/webp', gif: 'image/gif',
    };
    const { basename } = await import('path');
    return {
      fileBuffer: buf.toString('base64'),
      mimeType: mimeMap[ext] ?? 'image/jpeg',
      fileName: basename(filePath),
    };
  });

  // OS notification
  ipcMain.handle('notify', (_e, { title, body }: { title: string; body: string }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body, silent: false }).show();
    }
  });

  // App version
  ipcMain.handle('app:version', () => app.getVersion());

  // Open external links
  ipcMain.handle('open:external', (_e, url: string) => shell.openExternal(url));

  // Maximize change events → renderer
  win.on('maximize',   () => win.webContents.send('win:maximize-change', true));
  win.on('unmaximize', () => win.webContents.send('win:maximize-change', false));
}

// ── Create window ─────────────────────────────────────────────────────────────
function createWindow() {
  const state = loadWindowState();

  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    show: false,
    backgroundColor: '#F9FAFB',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (state.maximized) mainWindow.maximize();

  // Load renderer
  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow!.show();
    if (isDev) mainWindow!.webContents.openDevTools();
  });

  // Handle new-window (open external links in browser)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Persist state on close
  mainWindow.on('close', () => saveWindowState(mainWindow!));
  mainWindow.on('closed', () => { mainWindow = null; });

  createTray(mainWindow);
  buildAppMenu(mainWindow);
  registerIPC(mainWindow);
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(createWindow);

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Ensure userData dir exists (for state file)
try {
  const dir = app.getPath('userData');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
} catch { /* ignore */ }

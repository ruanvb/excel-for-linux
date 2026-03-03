const {
  shell,
  BrowserWindow,
  app,
  nativeTheme,
  dialog,
  webFrameMain,
  nativeImage,
  desktopCapturer,
} = require("electron");
const { StreamSelector } = require("../screenSharing");
const login = require("../login");
const customCSS = require("../customCSS");
const Menus = require("../menus");
const { SpellCheckProvider } = require("../spellCheckProvider");
const { execFile } = require("node:child_process");
const TrayIconChooser = require("../browser/tools/trayIconChooser");
require("../appConfiguration");
const ConnectionManager = require("../connectionManager");
const BrowserWindowManager = require("../mainAppWindow/browserWindowManager");
const os = require("node:os");
const path = require("node:path");

// Default configuration for the screen sharing thumbnail preview (avoid magic values)
const DEFAULT_SCREEN_SHARING_THUMBNAIL_CONFIG = {
  enabled: true,
  alwaysOnTop: true,
};

let iconChooser;
let intune;
let isControlPressed = false;
let config;
let window = null;
let appConfig = null;
let streamSelector;
let screenSharingService = null;
let connectionManager = null;
let menus = null;

const isMac = os.platform() === "darwin";

function findSelectedSource(sources, source) {
  return sources.find((s) => s.id === source.id);
}

function setupScreenSharing(selectedSource) {
  // Store the source ID in the screen sharing service
  screenSharingService.setSelectedSource(selectedSource);

  // Create preview window for screen sharing
  createScreenSharePreviewWindow();
}

function handleScreenSourceSelection(source, callback) {
  desktopCapturer
    .getSources({ types: ["window", "screen"] })
    .then((sources) => {
      const selectedSource = findSelectedSource(sources, source);
      if (selectedSource) {
        setupScreenSharing(selectedSource);
        callback({ video: selectedSource });
      } else {
        // Source not found - use setImmediate and try-catch to allow retry
        setImmediate(() => {
          try {
            callback({});
          } catch {
            console.debug("[SCREEN_SHARE] Selected source not found");
          }
        });
      }
    })
    .catch((error) => {
      // Handle desktopCapturer failures gracefully - can crash on certain hardware
      // configurations (USB-C docking stations, DisplayLink drivers, etc.)
      // See issues #2058, #2041
      console.error("[SCREEN_SHARE] Failed to get sources for selection:", {
        error: error.message,
        stack: error.stack,
        sourceId: source?.id
      });
      setImmediate(() => {
        try {
          callback({});
        } catch {
          console.debug("[SCREEN_SHARE] Failed to complete screen selection callback");
        }
      });
    });
}

function createScreenSharePreviewWindow() {
  const startTime = Date.now();

  // Get configuration - use the module-level config variable
  // Support both new (screenSharing.thumbnail) and legacy (screenSharingThumbnail) config paths
  let thumbnailConfig =
    config?.screenSharing?.thumbnail ??
    config?.screenSharingThumbnail ??
    DEFAULT_SCREEN_SHARING_THUMBNAIL_CONFIG;

  const previewWindow = screenSharingService.getPreviewWindow();
  const activeSource = screenSharingService.getSelectedSource();

  console.debug("[SCREEN_SHARE_DIAG] Preview window creation requested", {
    enabled: thumbnailConfig.enabled,
    alwaysOnTop: thumbnailConfig.alwaysOnTop || false,
    existingWindow: previewWindow && !previewWindow.isDestroyed(),
    activeSource: activeSource,
    timestamp: new Date().toISOString()
  });

  if (!thumbnailConfig.enabled) {
    console.debug("[SCREEN_SHARE_DIAG] Preview window disabled in configuration");
    return;
  }

  // Don't create duplicate windows - this is critical for preventing echo
  if (previewWindow && !previewWindow.isDestroyed()) {
    console.warn("[SCREEN_SHARE_DIAG] Preview window already exists, focusing existing", {
      riskLevel: "MEDIUM - multiple preview windows could cause audio issues",
      action: "focusing existing window instead of creating new",
      windowId: previewWindow.id
    });
    previewWindow.focus();
    return;
  }

  console.debug("[SCREEN_SHARE_DIAG] Creating new preview window", {
    dimensions: "320x180",
    alwaysOnTop: thumbnailConfig.alwaysOnTop || false,
    partition: "persist:excel-for-linux-session"
  });

  const newPreviewWindow = new BrowserWindow({
    width: 320,
    height: 180,
    minWidth: 200,
    minHeight: 120,
    show: false,
    resizable: true,
    alwaysOnTop: thumbnailConfig.alwaysOnTop || false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(
        __dirname,
        "..",
        "screenSharing",
        "previewWindowPreload.js"
      ),
      partition: "persist:excel-for-linux-session",
    },
  });

  // Store in service
  screenSharingService.setPreviewWindow(newPreviewWindow);

  const windowId = newPreviewWindow.id;
  console.debug("[SCREEN_SHARE_DIAG] Preview BrowserWindow created", {
    windowId: windowId,
    creationTimeMs: Date.now() - startTime,
    alwaysOnTop: thumbnailConfig.alwaysOnTop || false
  });

  newPreviewWindow.loadFile(
    path.join(__dirname, "..", "screenSharing", "previewWindow.html")
  );

  newPreviewWindow.once("ready-to-show", () => {
    console.debug("[SCREEN_SHARE_DIAG] Preview window ready, showing now", {
      windowId: windowId,
      totalCreationTimeMs: Date.now() - startTime,
      focused: newPreviewWindow.isFocused(),
      visible: newPreviewWindow.isVisible()
    });
    newPreviewWindow.show();
  });

  // Add focus/blur event handlers to detect when preview window gets focus
  newPreviewWindow.on("focus", () => {
    console.debug("[SCREEN_SHARE_DIAG] Preview window gained focus", {
      windowId: windowId,
      potentialIssue: "Focus on preview might interfere with main app window"
    });
  });

  newPreviewWindow.on("blur", () => {
    console.debug("[SCREEN_SHARE_DIAG] Preview window lost focus", {
      windowId: windowId
    });
  });

  newPreviewWindow.on("closed", () => {
    const closedSource = screenSharingService.getSelectedSource();
    console.debug("[SCREEN_SHARE_DIAG] Preview window closed", {
      windowId: windowId,
      hadActiveSource: !!closedSource,
      closedSource: closedSource
    });
    // Clear both preview window and selected source when window closes
    screenSharingService.setPreviewWindow(null);
    screenSharingService.setSelectedSource(null);
  });
}

exports.onAppReady = async function onAppReady(configGroup, _customBackground, sharingService) {
  appConfig = configGroup;
  config = configGroup.startupConfig;
  screenSharingService = sharingService;

  // Support both new (auth.intune.*) and deprecated (ssoInTune*) config options
  const intuneEnabled = config.auth?.intune?.enabled || config.ssoInTuneEnabled;
  const intuneUser = config.auth?.intune?.user ?? config.ssoInTuneAuthUser ?? "";
  if (intuneEnabled) {
    intune = require("../intune");
    await intune.initSso(intuneUser);
  }

  if (config.trayIconEnabled) {
    iconChooser = new TrayIconChooser(config);

    if (isMac) {
      console.info("Setting Dock icon for macOS");
      let dockIconPath;
      
      // Use custom icon if specified, otherwise use default 256x256 icon for dock
      if (config.appIcon && config.appIcon.trim() !== "") {
        dockIconPath = config.appIcon;
      } else {
        dockIconPath = path.join(config.appPath, "assets/icons/icon-96x96.png");
      }
      
      const icon = nativeImage.createFromPath(dockIconPath);
      const iconSize = icon.getSize();
      
      if (iconSize.width < 128) {
        console.warn(
          `Unable to set dock icon for macOS, icon size is less than 128x128, current size ${iconSize.width}x${iconSize.height}. Using resized icon.`
        );
        // Resize the icon to meet macOS dock requirements
        const resizedIcon = icon.resize({ width: 128, height: 128 });
        app.dock.setIcon(resizedIcon);
      } else {
        app.dock.setIcon(icon);
      }
    }
  }

  const browserWindowManager = new BrowserWindowManager({
    config: config,
    iconChooser: iconChooser,
  });

  window = await browserWindowManager.createWindow();
  streamSelector = new StreamSelector(window);

  window.webContents.session.setDisplayMediaRequestHandler(
    (_request, callback) => {
      streamSelector.show((source) => {
        if (source) {
          handleScreenSourceSelection(source, callback);
        } else {
          // User canceled - use setImmediate and try-catch to allow retry
          setImmediate(() => {
            try {
              callback({});
            } catch {
              console.debug("[SCREEN_SHARE] User canceled screen selection");
            }
          });
        }
      });
    }
  );

  // Initialize connection manager
  connectionManager = new ConnectionManager();

  if (iconChooser) {
    menus = new Menus(window, configGroup, iconChooser.getFile(), connectionManager);
    menus.onSpellCheckerLanguageChanged = onSpellCheckerLanguageChanged;
  }

  addEventHandlers();

  login.handleLoginDialogTry(window, config.ssoBasicAuthUser, config.ssoBasicAuthPasswordCommand);

  const url = processArgs(process.argv);
  connectionManager.start(url, {
    window: window,
    config: config,
  });

  applyAppConfiguration(config, window);
};

function onSpellCheckerLanguageChanged(languages) {
  appConfig.legacyConfigStore.set("spellCheckerLanguages", languages);
}

let allowFurtherRequests = true;

exports.show = function () {
  window.show();
};

exports.getWindow = function () {
  return window;
};

exports.setQuickChatManager = function (_quickChatManager) {
  // Quick Chat not used in Excel for Linux
};

exports.onAppSecondInstance = function onAppSecondInstance(event, args) {
  console.debug("second-instance started");
  if (window) {
    event.preventDefault();
    const url = processArgs(args);
    if (url && allowFurtherRequests) {
      allowFurtherRequests = false;
      setTimeout(() => {
        allowFurtherRequests = true;
      }, 5000);
      window.loadURL(url, { userAgent: config.chromeUserAgent });
    }

    restoreWindow();
  }
};

function applyAppConfiguration(config, window) {
  applySpellCheckerConfiguration(config.spellCheckerLanguages, window);

  const certPath = config.clientCertPath;
  if (certPath) {
    app.importCertificate(
      {
        certificate: certPath,
        password: config.clientCertPassword || "",
      },
      (result) => {
        console.info(
          `[CERT] Client certificate loaded, result: ${result}`
        );
      }
    );
  }
  window.webContents.setUserAgent(config.chromeUserAgent);

  if (!config.minimized) {
    window.show();
  } else {
    window.hide();
  }

  if (config.webDebug) {
    window.openDevTools();
  }
}

function applySpellCheckerConfiguration(languages, window) {
  const spellCheckProvider = new SpellCheckProvider(window);
  if (
    spellCheckProvider.setLanguages(languages).length === 0 &&
    languages.length > 0
  ) {
    // If failed to set user supplied languages, fallback to system locale.
    const systemList = [app.getLocale()];
    if (app.getLocale() !== app.getSystemLocale()) {
      systemList.push(app.getSystemLocale());
    }
    spellCheckProvider.setLanguages(systemList);
  }
}

function onDidFinishLoad() {
  console.debug("did-finish-load");

  // Inject browser functionality
  injectScreenSharingLogic();

  customCSS.onDidFinishLoad(window.webContents, config);
  initSystemThemeFollow(config);
}

function injectScreenSharingLogic() {
  const fs = require("node:fs");
  const scriptPath = path.join(
    __dirname,
    "..",
    "screenSharing",
    "injectedScreenSharing.js"
  );
  try {
    const script = fs.readFileSync(scriptPath, "utf8");
    window.webContents.executeJavaScript(script);
  } catch (err) {
    console.error("Failed to load injected screen sharing script:", err);
  }
}

function initSystemThemeFollow(config) {
  if (config.followSystemTheme) {
    nativeTheme.on("updated", () => {
      window.webContents.send(
        "system-theme-changed",
        nativeTheme.shouldUseDarkColors
      );
    });
    setTimeout(() => {
      window.webContents.send(
        "system-theme-changed",
        nativeTheme.shouldUseDarkColors
      );
    }, 2500);
  }
}

function onDidFrameFinishLoad(
  event,
  isMainFrame,
  frameProcessId,
  frameRoutingId
) {
  console.debug("did-frame-finish-load", event, isMainFrame);

  if (isMainFrame) {
    return; // We want to insert CSS only into the Office content iframe
  }

  const wf = webFrameMain.fromId(frameProcessId, frameRoutingId);
  customCSS.onDidFrameFinishLoad(wf, config);
}

function restoreWindow() {
  // If minimized, restore.
  if (window.isMinimized()) {
    window.restore();
  }

  // If closed to tray, show.
  else if (!window.isVisible()) {
    window.show();
  }

  window.focus();
}

/**
 * Processes command line arguments to extract Excel/Office URLs.
 *
 * @param {string[]} args - Command line arguments to process
 * @returns {string|null} Processed URL to navigate to, or null if no valid URL found
 */
function processArgs(args) {
  console.debug("processArgs:", args);
  for (const arg of args) {
    if (/^https:\/\/.*office\.com/.test(arg) || /^https:\/\/.*microsoft365\.com/.test(arg)) {
      console.debug("An Office/Excel URL argument received");
      window.show();
      return arg;
    }
  }
}

function onBeforeRequestHandler(details, callback) {
  // Allow all requests to proceed normally
  callback({});
}

function onHeadersReceivedHandler(details, callback) {
  callback({
    responseHeaders: details.responseHeaders,
  });
}

function onBeforeSendHeadersHandler(detail, callback) {
  if (intune?.isSsoUrl(detail.url)) {
    intune.addSsoCookie(detail, callback);
  } else {
    callback({
      requestHeaders: detail.requestHeaders,
    });
  }
}

function onNewWindow(details) {
  if (
    details.url === "about:blank" ||
    details.url === "about:blank#blocked"
  ) {
    return { action: "deny" };
  }

  return secureOpenLink(details);
}

function onPageTitleUpdated(_event, title) {
  window.webContents.send("page-title", title);
}

function onNavigationChanged() {
  if (window?.webContents?.navigationHistory) {
    const canGoBack = window.webContents.navigationHistory.canGoBack();
    const canGoForward = window.webContents.navigationHistory.canGoForward();
    window.webContents.send("navigation-state-changed", canGoBack, canGoForward);
  }
}

function onWindowClosed() {
  console.debug("window closed");

  // Close preview window before quitting to prevent race conditions
  const previewWindow = screenSharingService?.getPreviewWindow();
  if (previewWindow && !previewWindow.isDestroyed()) {
    console.debug("[SCREEN_SHARE_DIAG] Closing preview window before app quit");
    previewWindow.close();
    screenSharingService.setPreviewWindow(null);
    screenSharingService.setSelectedSource(null);
  }

  window = null;
  app.quit();
}

function addEventHandlers() {
  window.on("page-title-updated", onPageTitleUpdated);
  window.webContents.setWindowOpenHandler(onNewWindow);
  window.webContents.session.webRequest.onBeforeRequest(
    { urls: ["https://*/*"] },
    onBeforeRequestHandler
  );
  window.webContents.session.webRequest.onHeadersReceived(
    { urls: ["https://*/*"] },
    onHeadersReceivedHandler
  );
  window.webContents.session.webRequest.onBeforeSendHeaders(
    getWebRequestFilterFromURL(),
    onBeforeSendHeadersHandler
  );
  window.webContents.on("did-finish-load", onDidFinishLoad);
  window.webContents.on("did-frame-finish-load", onDidFrameFinishLoad);
  window.on("closed", onWindowClosed);
  window.webContents.addListener("before-input-event", onBeforeInput);

  // Navigation state change handlers
  window.webContents.on("did-navigate", onNavigationChanged);
  window.webContents.on("did-navigate-in-page", onNavigationChanged);
}

function getWebRequestFilterFromURL() {
  const filter = { urls: ["https://*/*"] };
  if (intune) {
    intune.setupUrlFilter(filter);
  }
  return filter;
}

function onBeforeInput(_event, input) {
  isControlPressed = input.control;
}

function secureOpenLink(details) {
  console.debug('[LINK] Requesting to open external link');
  const action = getLinkAction();

  if (action === 0) {
    openInBrowser(details);
  }

  const returnValue =
    action === 1
      ? {
          action: "allow",
          overrideBrowserWindowOptions: {
            modal: true,
            useContentSize: true,
            parent: window,
          },
        }
      : { action: "deny" };

  if (action === 1) {
    removePopupWindowMenu();
  }

  return returnValue;
}

function openInBrowser(details) {
  if (config.defaultURLHandler.trim() === "") {
    shell.openExternal(details.url);
  } else {
    execFile(
      config.defaultURLHandler.trim(),
      [details.url],
      openInBrowserErrorHandler
    );
  }
}

function openInBrowserErrorHandler(error) {
  if (error) {
    console.error(`openInBrowserErrorHandler ${error.message}`);
  }
}

function getLinkAction() {
  const action = isControlPressed
    ? dialog.showMessageBoxSync(window, {
        type: "warning",
        buttons: ["Allow", "Deny"],
        title: "Open URL",
        normalizeAccessKeys: true,
        defaultId: 1,
        cancelId: 1,
        message:
          "This will open the URL in the application context. If this is for SSO, click Allow otherwise Deny.",
      }) + 1
    : 0;

  isControlPressed = false;
  return action;
}

async function removePopupWindowMenu() {
  for (let i = 1; i <= 200; i++) {
    await sleep(10);
    const childWindows = window.getChildWindows();
    if (childWindows.length) {
      childWindows[0].removeMenu();
      break;
    }
  }
}

async function sleep(ms) {
  return await new Promise((r) => setTimeout(r, ms));
}

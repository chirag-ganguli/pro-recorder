const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');
const { execSync } = require('child_process'); // Required for the deep-sign hook

module.exports = {
  packagerConfig: {
    asar: {
      unpack: '**/node_modules/ffmpeg-static/**',
    },
    icon: './assets/icon',
    extendInfo: {
      NSCameraUsageDescription: 'Pro Recorder needs camera access for Picture-in-Picture overlay recordings.',
      NSMicrophoneUsageDescription: 'Pro Recorder needs microphone access to capture audio during recordings.',
    },
    osxSign: {
      // Using absolute paths ensures the compiler never loses track of the file
      entitlements: path.join(__dirname, 'entitlements.plist'),
      'entitlements-inherit': path.join(__dirname, 'entitlements.plist')
    },
  },
  
  // --- NEW: Automated Deep Code Signing Hook ---
  hooks: {
    postPackage: async (config, packageResult) => {
      // Only run this on the Mac build servers
      if (packageResult.platform === 'darwin') {
        try {
          // Find the exact path to the built .app inside the runner
          const appPath = path.join(packageResult.outputPaths[0], 'Pro Recorder.app');
          
          console.log(`\nApplying Ad-Hoc Deep Signature to: ${appPath}`);
          
          // Force sign the app and nested binaries (like FFmpeg)
          execSync(`codesign --force --deep --sign - "${appPath}"`);
          
          console.log('Signature applied successfully!\n');
        } catch (error) {
          console.error('Failed to sign the app:', error);
        }
      }
    }
  },

  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: false,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
    }),
  ],
};
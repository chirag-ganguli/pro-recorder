const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: {
      unpack: '**/node_modules/ffmpeg-static/**',
    },
    icon: './assets/icon',
    extendInfo: {
      NSCameraUsageDescription: "Pro Recorder needs access to your camera to add a webcam overlay to your screen recordings.",
      NSMicrophoneUsageDescription: "Pro Recorder needs access to your microphone to record your voice during meetings."
    },
    osxSign: {},
    extendInfo: {
      NSCameraUsageDescription: 'Pro Recorder needs camera access for Picture-in-Picture overlay recordings.',
      NSMicrophoneUsageDescription: 'Pro Recorder needs microphone access to capture audio during recordings.',
    },
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
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
    }),
  ],
};

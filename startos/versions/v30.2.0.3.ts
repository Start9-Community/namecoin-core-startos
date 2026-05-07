import { VersionInfo } from '@start9labs/start-sdk'

export const v_30_2_0_3 = VersionInfo.of({
  version: '30.2.0.3:0',
  releaseNotes: {
    en_US:
      'Initial StartOS v0.4.x release. Ported the v0.3.5 wrapper to the TypeScript SDK. Build now uses CMake (nc30.2 dropped autotools). No upstream Namecoin Core changes vs nc30.2.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

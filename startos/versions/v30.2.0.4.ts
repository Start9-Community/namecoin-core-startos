import { VersionInfo } from '@start9labs/start-sdk'

export const v_30_2_0_4 = VersionInfo.of({
  version: '30.2.0.4:0',
  releaseNotes: {
    en_US:
      'Add "Name Lookup" action. Resolve any Namecoin name (d/foo, id/alice, dd/testls, etc.) directly from the StartOS Actions tab — runs `namecoin-cli name_show <name>` against the running node and displays the JSON result. No upstream Namecoin Core changes.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

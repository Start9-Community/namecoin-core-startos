import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '32.1:0',
  releaseNotes: {
    en_US: `Updated Namecoin Core to 32.1.

[Full release notes](https://github.com/namecoin/namecoin-core/releases/tag/nc32.1)`,
    es_ES: `Namecoin Core actualizado a la versión 32.1.

[Notas de la versión completas](https://github.com/namecoin/namecoin-core/releases/tag/nc32.1)`,
    de_DE: `Namecoin Core auf 32.1 aktualisiert.

[Vollständige Versionshinweise](https://github.com/namecoin/namecoin-core/releases/tag/nc32.1)`,
    pl_PL: `Zaktualizowano Namecoin Core do wersji 32.1.

[Pełne informacje o wydaniu](https://github.com/namecoin/namecoin-core/releases/tag/nc32.1)`,
    fr_FR: `Namecoin Core mis à jour vers la version 32.1.

[Notes de version complètes](https://github.com/namecoin/namecoin-core/releases/tag/nc32.1)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

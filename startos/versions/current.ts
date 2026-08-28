import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '31.1:0',
  releaseNotes: {
    en_US: `Updated Namecoin Core to 31.1.

- Redesigned mempool for better block templates and more predictable transaction replacement
- Transactions can optionally be broadcast only over Tor or I2P
- Fresh installs no longer come with a preset peer list; the node finds Namecoin peers on its own

[Full release notes](https://github.com/namecoin/namecoin-core/releases/tag/nc31.1)`,
    es_ES: `Namecoin Core actualizado a la versión 31.1.

- Mempool rediseñada, con mejores plantillas de bloque y un reemplazo de transacciones más predecible
- Las transacciones pueden difundirse opcionalmente solo a través de Tor o I2P
- Las instalaciones nuevas ya no incluyen una lista de pares predefinida; el nodo encuentra pares de Namecoin por sí mismo

[Notas de la versión completas](https://github.com/namecoin/namecoin-core/releases/tag/nc31.1)`,
    de_DE: `Namecoin Core auf 31.1 aktualisiert.

- Neu gestalteter Mempool für bessere Blockvorlagen und berechenbareren Transaktionsersatz
- Transaktionen können wahlweise ausschließlich über Tor oder I2P verbreitet werden
- Neuinstallationen enthalten keine voreingestellte Peer-Liste mehr; der Knoten findet Namecoin-Peers selbst

[Vollständige Versionshinweise](https://github.com/namecoin/namecoin-core/releases/tag/nc31.1)`,
    pl_PL: `Zaktualizowano Namecoin Core do wersji 31.1.

- Przeprojektowany mempool zapewnia lepsze szablony bloków i bardziej przewidywalne zastępowanie transakcji
- Transakcje można opcjonalnie rozgłaszać wyłącznie przez Tor lub I2P
- Nowe instalacje nie zawierają już wstępnie ustawionej listy węzłów; węzeł sam znajduje węzły Namecoin

[Pełne informacje o wydaniu](https://github.com/namecoin/namecoin-core/releases/tag/nc31.1)`,
    fr_FR: `Namecoin Core mis à jour vers la version 31.1.

- Mempool repensée, avec de meilleurs modèles de blocs et un remplacement de transactions plus prévisible
- Les transactions peuvent être diffusées uniquement via Tor ou I2P, au choix
- Les nouvelles installations ne contiennent plus de liste de pairs prédéfinie ; le nœud trouve seul des pairs Namecoin

[Notes de version complètes](https://github.com/namecoin/namecoin-core/releases/tag/nc31.1)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

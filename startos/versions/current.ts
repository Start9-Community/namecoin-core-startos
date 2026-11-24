import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '32.1:3',
  releaseNotes: {
    en_US:
      'Requires StartOS 0.4.2 or later. Services that depend on Namecoin Core can now connect to it without being able to read its data directory, including the wallet.',
    es_ES:
      'Requiere StartOS 0.4.2 o posterior. Los servicios que dependen de Namecoin Core ahora pueden conectarse a él sin poder leer su directorio de datos, incluida la billetera.',
    de_DE:
      'Erfordert StartOS 0.4.2 oder neuer. Dienste, die von Namecoin Core abhängen, können sich jetzt damit verbinden, ohne sein Datenverzeichnis einschließlich der Wallet lesen zu können.',
    pl_PL:
      'Wymaga StartOS 0.4.2 lub nowszego. Usługi zależne od Namecoin Core mogą teraz łączyć się z nim bez możliwości odczytu jego katalogu danych, w tym portfela.',
    fr_FR:
      "Nécessite StartOS 0.4.2 ou une version ultérieure. Les services qui dépendent de Namecoin Core peuvent désormais s'y connecter sans pouvoir lire son répertoire de données, portefeuille compris.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

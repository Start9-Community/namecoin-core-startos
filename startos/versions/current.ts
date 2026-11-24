import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '32.1:3',
  releaseNotes: {
    en_US:
      'Requires StartOS 0.4.2 or later. Services that depend on Namecoin Core can now connect to it without being able to read its data directory, including the wallet. ZeroMQ notifications are no longer reachable from other devices on your network; services on your server still receive them.',
    es_ES:
      'Requiere StartOS 0.4.2 o posterior. Los servicios que dependen de Namecoin Core ahora pueden conectarse a él sin poder leer su directorio de datos, incluida la billetera. Las notificaciones ZeroMQ ya no son accesibles desde otros dispositivos de su red; los servicios de su servidor siguen recibiéndolas.',
    de_DE:
      'Erfordert StartOS 0.4.2 oder neuer. Dienste, die von Namecoin Core abhängen, können sich jetzt damit verbinden, ohne sein Datenverzeichnis einschließlich der Wallet lesen zu können. ZeroMQ-Benachrichtigungen sind von anderen Geräten in Ihrem Netzwerk nicht mehr erreichbar; Dienste auf Ihrem Server erhalten sie weiterhin.',
    pl_PL:
      'Wymaga StartOS 0.4.2 lub nowszego. Usługi zależne od Namecoin Core mogą teraz łączyć się z nim bez możliwości odczytu jego katalogu danych, w tym portfela. Powiadomienia ZeroMQ nie są już dostępne z innych urządzeń w Twojej sieci; usługi na Twoim serwerze nadal je otrzymują.',
    fr_FR:
      "Nécessite StartOS 0.4.2 ou une version ultérieure. Les services qui dépendent de Namecoin Core peuvent désormais s'y connecter sans pouvoir lire son répertoire de données, portefeuille compris. Les notifications ZeroMQ ne sont plus accessibles depuis les autres appareils de votre réseau ; les services de votre serveur les reçoivent toujours.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '32.1:1',
  releaseNotes: {
    en_US:
      "Peers and ZMQ clients can now connect over the server's IPv6 addresses.",
    es_ES:
      'Los pares y los clientes ZMQ ahora pueden conectarse a través de las direcciones IPv6 del servidor.',
    de_DE:
      'Peers und ZMQ-Clients können sich jetzt über die IPv6-Adressen des Servers verbinden.',
    pl_PL:
      'Peery i klienci ZMQ mogą teraz łączyć się przez adresy IPv6 serwera.',
    fr_FR:
      'Les pairs et les clients ZMQ peuvent désormais se connecter via les adresses IPv6 du serveur.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

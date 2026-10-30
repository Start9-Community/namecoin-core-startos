import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '31.1:3',
  releaseNotes: {
    en_US:
      'The instructions cover keeping your home IP private when you publish Namecoin Core through StartTunnel.',
    es_ES:
      'Las instrucciones explican cómo mantener privada tu IP doméstica cuando publicas Namecoin Core a través de StartTunnel.',
    de_DE:
      'Die Anleitung erklärt, wie Ihre Heim-IP-Adresse privat bleibt, wenn Sie Namecoin Core über StartTunnel veröffentlichen.',
    pl_PL:
      'Instrukcje wyjaśniają, jak zachować prywatność domowego adresu IP, gdy publikujesz Namecoin Core przez StartTunnel.',
    fr_FR:
      'Les instructions expliquent comment garder votre IP personnelle privée lorsque vous publiez Namecoin Core via StartTunnel.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

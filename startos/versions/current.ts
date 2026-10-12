import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '31.1:2',
  releaseNotes: {
    en_US:
      'Restarting Namecoin Core while it is still starting stops every process of the previous run.',
    es_ES:
      'Reiniciar Namecoin Core mientras aún se está iniciando detiene todos los procesos de la ejecución anterior.',
    de_DE:
      'Ein Neustart von Namecoin Core, während es noch startet, beendet alle Prozesse des vorherigen Laufs.',
    pl_PL:
      'Ponowne uruchomienie Namecoin Core w trakcie uruchamiania zatrzymuje wszystkie procesy poprzedniego uruchomienia.',
    fr_FR:
      "Redémarrer Namecoin Core pendant son démarrage arrête tous les processus de l'exécution précédente.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

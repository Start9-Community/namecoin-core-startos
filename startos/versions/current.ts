import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '32.1:2',
  releaseNotes: {
    en_US:
      "Packaging update: the Namecoin Core source is checked against the exact release and its developer's signature before it is built. Nothing changes in how the node runs.",
    es_ES:
      'Actualización del empaquetado: el código fuente de Namecoin Core se verifica contra la versión exacta y la firma de su desarrollador antes de compilarse. No cambia nada en el funcionamiento del nodo.',
    de_DE:
      'Paketierungs-Update: Der Quellcode von Namecoin Core wird vor dem Bauen gegen die exakte Version und die Signatur des Entwicklers geprüft. An der Funktionsweise des Knotens ändert sich nichts.',
    pl_PL:
      'Aktualizacja pakietu: kod źródłowy Namecoin Core jest sprawdzany względem dokładnego wydania i podpisu jego twórcy przed kompilacją. Działanie węzła się nie zmienia.',
    fr_FR:
      "Mise à jour de l'empaquetage : le code source de Namecoin Core est vérifié par rapport à la version exacte et à la signature de son développeur avant d'être compilé. Rien ne change dans le fonctionnement du nœud.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

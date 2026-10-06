import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '31.1:1',
  releaseNotes: {
    en_US: `Updated Namecoin Core to 31.1.

- Redesigned mempool for better block templates and more predictable transaction replacement
- Transactions can optionally be broadcast only over Tor or I2P
- Fresh installs no longer come with a preset peer list; the node finds Namecoin peers on its own

[Full release notes](https://github.com/namecoin/namecoin-core/releases/tag/nc31.1)

**Changes**

- Delete Peer List asks for confirmation before running.
- When creating an RPC user fails, Generate RPC User Credentials and Configure for ElectrumX show the error output in its own copyable box.
- Name Lookup shows its JSON result, or the error, with line breaks intact.
- The Onlynet and Connect Peer settings describe each of their options, and the mempool size and expiry settings no longer show a blank where the value belongs.
- The service description reads correctly in Spanish, German, Polish and French.`,
    es_ES: `Namecoin Core actualizado a la versión 31.1.

- Mempool rediseñada, con mejores plantillas de bloque y un reemplazo de transacciones más predecible
- Las transacciones pueden difundirse opcionalmente solo a través de Tor o I2P
- Las instalaciones nuevas ya no incluyen una lista de pares predefinida; el nodo encuentra pares de Namecoin por sí mismo

[Notas de la versión completas](https://github.com/namecoin/namecoin-core/releases/tag/nc31.1)

**Cambios**

- Eliminar lista de pares pide confirmación antes de ejecutarse.
- Cuando falla la creación de un usuario RPC, Generar credenciales de usuario RPC y Configurar para ElectrumX muestran la salida de error en su propio cuadro copiable.
- Búsqueda de nombres muestra su resultado JSON, o el error, conservando los saltos de línea.
- Los ajustes Onlynet y Conectar par describen cada una de sus opciones, y los ajustes de tamaño y caducidad del mempool ya no muestran un hueco donde va el valor.
- La descripción del servicio se lee correctamente en español, alemán, polaco y francés.`,
    de_DE: `Namecoin Core auf 31.1 aktualisiert.

- Neu gestalteter Mempool für bessere Blockvorlagen und berechenbareren Transaktionsersatz
- Transaktionen können wahlweise ausschließlich über Tor oder I2P verbreitet werden
- Neuinstallationen enthalten keine voreingestellte Peer-Liste mehr; der Knoten findet Namecoin-Peers selbst

[Vollständige Versionshinweise](https://github.com/namecoin/namecoin-core/releases/tag/nc31.1)

**Änderungen**

- „Peer-Liste löschen“ fragt vor der Ausführung nach einer Bestätigung.
- Schlägt das Anlegen eines RPC-Benutzers fehl, zeigen „RPC-Benutzeranmeldeinformationen generieren“ und „Für ElectrumX konfigurieren“ die Fehlerausgabe in einem eigenen kopierbaren Feld.
- „Namenssuche“ zeigt ihr JSON-Ergebnis oder den Fehler mit erhaltenen Zeilenumbrüchen.
- Die Einstellungen „Onlynet“ und „Peer verbinden“ beschreiben jede ihrer Optionen, und die Einstellungen zu Größe und Ablauf des Mempools zeigen keine Lücke mehr, wo der Wert stehen sollte.
- Die Dienstbeschreibung ist auf Spanisch, Deutsch, Polnisch und Französisch korrekt.`,
    pl_PL: `Zaktualizowano Namecoin Core do wersji 31.1.

- Przeprojektowany mempool zapewnia lepsze szablony bloków i bardziej przewidywalne zastępowanie transakcji
- Transakcje można opcjonalnie rozgłaszać wyłącznie przez Tor lub I2P
- Nowe instalacje nie zawierają już wstępnie ustawionej listy węzłów; węzeł sam znajduje węzły Namecoin

[Pełne informacje o wydaniu](https://github.com/namecoin/namecoin-core/releases/tag/nc31.1)

**Zmiany w pakiecie**

- „Usuń listę peerów” prosi o potwierdzenie przed uruchomieniem.
- Gdy utworzenie użytkownika RPC się nie powiedzie, akcje „Generuj dane uwierzytelniające użytkownika RPC” i „Skonfiguruj dla ElectrumX” pokazują komunikat błędu w osobnym polu do skopiowania.
- „Wyszukiwanie nazw” pokazuje wynik JSON lub błąd z zachowanymi podziałami wierszy.
- Ustawienia „Onlynet” i „Połącz peera” opisują każdą ze swoich opcji, a ustawienia rozmiaru i wygasania mempoola nie pokazują już luki w miejscu wartości.
- Opis usługi jest poprawny po hiszpańsku, niemiecku, polsku i francusku.`,
    fr_FR: `Namecoin Core mis à jour vers la version 31.1.

- Mempool repensée, avec de meilleurs modèles de blocs et un remplacement de transactions plus prévisible
- Les transactions peuvent être diffusées uniquement via Tor ou I2P, au choix
- Les nouvelles installations ne contiennent plus de liste de pairs prédéfinie ; le nœud trouve seul des pairs Namecoin

[Notes de version complètes](https://github.com/namecoin/namecoin-core/releases/tag/nc31.1)

**Modifications**

- Supprimer la liste des pairs demande une confirmation avant de s'exécuter.
- Lorsque la création d'un utilisateur RPC échoue, Générer les informations d'identification utilisateur RPC et Configurer pour ElectrumX affichent la sortie d'erreur dans son propre champ copiable.
- La recherche de nom affiche son résultat JSON, ou l'erreur, avec les sauts de ligne conservés.
- Les réglages Onlynet et Connecter un pair décrivent chacune de leurs options, et les réglages de taille et d'expiration du mempool n'affichent plus de vide à la place de la valeur.
- La description du service est correcte en espagnol, allemand, polonais et français.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

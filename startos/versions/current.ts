import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '31.1:1',
  releaseNotes: {
    en_US: `- Delete Peer List asks for confirmation before running.
- When creating an RPC user fails, Generate RPC User Credentials and Configure for ElectrumX show the error output in its own copyable box.
- Name Lookup shows its JSON result, or the error, with line breaks intact.
- The Onlynet and Connect Peer settings describe each of their options, and the mempool size and expiry settings no longer show a blank where the value belongs.
- The service description reads correctly in Spanish, German, Polish and French.`,
    es_ES: `- Eliminar lista de pares pide confirmación antes de ejecutarse.
- Cuando falla la creación de un usuario RPC, Generar credenciales de usuario RPC y Configurar para ElectrumX muestran la salida de error en su propio cuadro copiable.
- Búsqueda de nombres muestra su resultado JSON, o el error, conservando los saltos de línea.
- Los ajustes Onlynet y Conectar par describen cada una de sus opciones, y los ajustes de tamaño y caducidad del mempool ya no muestran un hueco donde va el valor.
- La descripción del servicio se lee correctamente en español, alemán, polaco y francés.`,
    de_DE: `- „Peer-Liste löschen“ fragt vor der Ausführung nach einer Bestätigung.
- Schlägt das Anlegen eines RPC-Benutzers fehl, zeigen „RPC-Benutzeranmeldeinformationen generieren“ und „Für ElectrumX konfigurieren“ die Fehlerausgabe in einem eigenen kopierbaren Feld.
- „Namenssuche“ zeigt ihr JSON-Ergebnis oder den Fehler mit erhaltenen Zeilenumbrüchen.
- Die Einstellungen „Onlynet“ und „Peer verbinden“ beschreiben jede ihrer Optionen, und die Einstellungen zu Größe und Ablauf des Mempools zeigen keine Lücke mehr, wo der Wert stehen sollte.
- Die Dienstbeschreibung ist auf Spanisch, Deutsch, Polnisch und Französisch korrekt.`,
    pl_PL: `- „Usuń listę peerów” prosi o potwierdzenie przed uruchomieniem.
- Gdy utworzenie użytkownika RPC się nie powiedzie, akcje „Generuj dane uwierzytelniające użytkownika RPC” i „Skonfiguruj dla ElectrumX” pokazują komunikat błędu w osobnym polu do skopiowania.
- „Wyszukiwanie nazw” pokazuje wynik JSON lub błąd z zachowanymi podziałami wierszy.
- Ustawienia „Onlynet” i „Połącz peera” opisują każdą ze swoich opcji, a ustawienia rozmiaru i wygasania mempoola nie pokazują już luki w miejscu wartości.
- Opis usługi jest poprawny po hiszpańsku, niemiecku, polsku i francusku.`,
    fr_FR: `- Supprimer la liste des pairs demande une confirmation avant de s'exécuter.
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

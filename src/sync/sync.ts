import type { ChangeSet, ListStore } from '../store/store'
import type { Stamp } from '../domain/stamp'

/**
 * Vorbereitete Schnittstelle für eine spätere Synchronisation. Heute gibt es keine.
 *
 * Eine Synchronisation implementiert `SyncTransport` und wird mit `connectSync` an den
 * ListStore gehängt. Der Rest der App muss dafür nicht geändert werden:
 *
 * - Lokale Änderungen meldet der ListStore über `onLocalChange`. Sie gehen an `push`.
 * - Fremde Änderungen liefert der Transport an `onRemote`. Der ListStore führt sie über
 *   `applyRemote` zusammen, Feld für Feld, die spätere Änderung gewinnt.
 * - Nach einer Unterbrechung holt `pull(since)` alles nach, was seit dem letzten
 *   bekannten Stand passiert ist. Umgekehrt liefert `store.changesSince(stamp)` alles
 *   Lokale seit einem Stand.
 *
 * Denkbare Transporte: eigener kleiner Server mit Ende-zu-Ende-Verschlüsselung,
 * direkte Verbindung zwischen Geräten (WebRTC), Austausch per Datei oder QR-Code.
 */
export interface SyncTransport {
  push(changes: ChangeSet): Promise<void>
  pull(since: Stamp): Promise<{ changes: ChangeSet; until: Stamp }>
  onRemote(listener: (changes: ChangeSet) => void): () => void
  close(): void
}

export function connectSync(store: ListStore, transport: SyncTransport): () => void {
  const offLocal = store.onLocalChange((changes) => {
    transport.push(changes).catch((error) => console.warn('Senden fehlgeschlagen, wird später nachgeholt', error))
  })
  const offRemote = transport.onRemote((changes) => store.applyRemote(changes))
  return () => {
    offLocal()
    offRemote()
    transport.close()
  }
}

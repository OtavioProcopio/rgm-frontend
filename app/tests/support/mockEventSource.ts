type Ouvinte = (event: { data?: string }) => void;

/** Dublê de `EventSource` para testes: guarda as conexões abertas e deixa emitir eventos. */
export class MockEventSource {
  static CLOSED = 2;
  static OPEN = 1;
  static CONNECTING = 0;
  static instances: MockEventSource[] = [];

  readyState = MockEventSource.OPEN;
  url: string;
  onerror: (() => void) | null = null;
  private listeners = new Map<string, Set<Ouvinte>>();

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  static reset() {
    MockEventSource.instances = [];
  }

  addEventListener(type: string, listener: Ouvinte) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, listener: Ouvinte) {
    this.listeners.get(type)?.delete(listener);
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  /** Emite um evento; `corpo` é serializado como o servidor envia. */
  emit(type: string, corpo?: unknown) {
    const data = corpo === undefined ? undefined : JSON.stringify(corpo);
    this.listeners.get(type)?.forEach((listener) => listener({ data }));
  }

  triggerError() {
    this.onerror?.();
  }
}

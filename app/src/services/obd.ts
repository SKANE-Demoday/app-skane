/**
 * Camada de comunicação com o adaptador OBD-II.
 *
 * O app inteiro conversa só com a interface ObdService. Hoje quem a implementa é o
 * MockObdService (dados simulados, roda no Expo Go). Para ler um carro de verdade,
 * crie um BleObdService com react-native-ble-plx falando comandos ELM327
 * (ex.: "03" lê códigos de erro, "01 05" temperatura do líquido, "01 2F" nível do tanque)
 * e troque a instância exportada no final deste arquivo.
 */
export interface FoundDevice {
  id: string;
  name: string;
  signal: number; // 0–4
}

export interface ObdService {
  scan(onFound: (d: FoundDevice) => void): () => void;
  connect(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
  readDtcs(): Promise<string[]>;
  /** Nível do tanque em % (PID 01 2F). */
  readFuelLevelPercent(): Promise<number>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

class MockObdService implements ObdService {
  private fuelPercent = (26 / 47) * 100;

  scan(onFound: (d: FoundDevice) => void) {
    const t = setTimeout(() => onFound({ id: 'mock-1', name: 'SKANE OBD-II', signal: 3 }), 1800);
    return () => clearTimeout(t);
  }

  async connect(_deviceId: string) {
    await wait(1200);
  }

  async disconnect() {
    await wait(200);
  }

  async readDtcs() {
    await wait(400);
    return ['P0301', 'P0420', 'P0171', 'P0128'];
  }

  async readFuelLevelPercent() {
    await wait(300);
    return this.fuelPercent;
  }

  /** Só existe no mock: simula o efeito de um abastecimento no sensor do tanque. */
  simulateRefuel(liters: number, capacity: number) {
    const before = (this.fuelPercent / 100) * capacity;
    // 1 em cada 5 abastecimentos simula bomba entregando ~25% a menos, para demonstrar o alerta
    const delivered = Math.random() < 0.2 ? liters * 0.75 : liters * (0.96 + Math.random() * 0.04);
    const after = Math.min(capacity, before + delivered);
    this.fuelPercent = (after / capacity) * 100;
  }
}

export const mockObd = new MockObdService();
export const obd: ObdService = mockObd;

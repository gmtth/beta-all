export type AnalysisParams = Record<string, string | number | boolean | undefined>;

export interface AnalysisReader {
  searchTickets(params: AnalysisParams, accessToken: string): Promise<unknown>;
  getTicket(id: string, accessToken: string): Promise<unknown>;
}

export type AnalysisSessionOptions = {
  maxRequests?: number;
  windowMs?: number;
  maxTickets?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
};

export type AnalysisStats = {
  requests: number;
  cacheHits: number;
  candidates: number;
  analyzed: number;
  partial: boolean;
  warnings: string[];
};

const stableKey = (value: unknown) => JSON.stringify(value, Object.keys(value as Record<string, unknown>).sort());

export class MovideskAnalysisSession {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly maxTickets: number;
  private readonly now: () => number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly requestTimes: number[] = [];
  private readonly cache = new Map<string, unknown>();
  private readonly warningSet = new Set<string>();
  private requestCount = 0;
  private cacheHitCount = 0;
  private candidateCount = 0;
  private analyzedCount = 0;
  private partialResult = false;

  constructor(private readonly reader: AnalysisReader, private readonly accessToken: string, options: AnalysisSessionOptions = {}) {
    this.maxRequests = options.maxRequests ?? 10;
    this.windowMs = options.windowMs ?? 60000;
    this.maxTickets = options.maxTickets ?? 100;
    this.now = options.now ?? (() => Date.now());
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    if (!Number.isInteger(this.maxRequests) || this.maxRequests < 1) throw new Error("maxRequests deve ser positivo");
    if (!Number.isInteger(this.windowMs) || this.windowMs < 1) throw new Error("windowMs deve ser positivo");
    if (!Number.isInteger(this.maxTickets) || this.maxTickets < 1) throw new Error("maxTickets deve ser positivo");
  }

  private async acquire() {
    while (true) {
      const now = this.now();
      while (this.requestTimes.length && this.requestTimes[0] <= now - this.windowMs) this.requestTimes.shift();
      if (this.requestTimes.length < this.maxRequests) {
        this.requestTimes.push(now);
        this.requestCount += 1;
        return;
      }
      await this.sleep(Math.max(1, this.requestTimes[0] + this.windowMs - now));
    }
  }

  private async execute<T>(key: string, operation: () => Promise<T>): Promise<T> {
    if (this.cache.has(key)) {
      this.cacheHitCount += 1;
      return this.cache.get(key) as T;
    }
    await this.acquire();
    const result = await operation();
    this.cache.set(key, result);
    return result;
  }

  async searchTickets(params: AnalysisParams) {
    return this.execute(`search:${stableKey(params)}`, () => this.reader.searchTickets(params, this.accessToken));
  }

  async getTicket(id: string) {
    return this.execute(`ticket:${id}`, () => this.reader.getTicket(id, this.accessToken));
  }

  registerCandidates(count: number) {
    this.candidateCount += Math.max(0, count);
    if (this.candidateCount > this.maxTickets) {
      this.partialResult = true;
      this.warn(`Limite de ${this.maxTickets} tickets por análise atingido.`);
      return false;
    }
    return true;
  }

  registerAnalyzed(count = 1) { this.analyzedCount += Math.max(0, count); }

  markPartial(reason: string) { this.partialResult = true; this.warn(reason); }

  warn(message: string) { this.warningSet.add(message); }

  stats(): AnalysisStats {
    return { requests: this.requestCount, cacheHits: this.cacheHitCount, candidates: this.candidateCount, analyzed: this.analyzedCount, partial: this.partialResult, warnings: [...this.warningSet] };
  }
}

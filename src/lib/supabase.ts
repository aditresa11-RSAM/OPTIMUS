/**
 * OPTIMUS Local Storage & Offline Database Engine
 * Drop-in replacement for Supabase that persists all data 100% locally on this computer
 * without requiring any external cloud services or internet connection.
 */

export interface PostgrestResponse<T = any> {
  data: any;
  error: any;
  count?: number;
}

interface QueryFilter {
  column: string;
  operator: "eq" | "neq" | "ilike" | "in";
  value: any;
}

class LocalQueryBuilder<T = any> implements PromiseLike<PostgrestResponse<T>> {
  private table: string;
  private action: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private payload: any = null;
  private filters: QueryFilter[] = [];
  private orderConfig?: { column: string; ascending: boolean };
  private limitCount?: number;
  private offsetCount?: number;
  private isSingle = false;
  private selectColumns = "*";

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = "*", _options?: { count?: "exact" | "planned" | "estimated" }): this {
    this.action = "select";
    this.selectColumns = columns;
    return this;
  }

  insert(records: any): this {
    this.action = "insert";
    this.payload = records;
    return this;
  }

  update(records: any): this {
    this.action = "update";
    this.payload = records;
    return this;
  }

  upsert(records: any, _options?: any): this {
    this.action = "upsert";
    this.payload = records;
    return this;
  }

  delete(): this {
    this.action = "delete";
    return this;
  }

  eq(column: string, value: any): this {
    this.filters.push({ column, operator: "eq", value });
    return this;
  }

  neq(column: string, value: any): this {
    this.filters.push({ column, operator: "neq", value });
    return this;
  }

  ilike(column: string, value: any): this {
    this.filters.push({ column, operator: "ilike", value });
    return this;
  }

  in(column: string, values: any[]): this {
    this.filters.push({ column, operator: "in", value: values });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this.orderConfig = {
      column,
      ascending: options?.ascending !== false,
    };
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number): this {
    this.offsetCount = from;
    this.limitCount = to - from + 1;
    return this;
  }

  single(): this {
    this.isSingle = true;
    return this;
  }

  // Chainable terminal promise
  async then<TResult1 = PostgrestResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: PostgrestResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    try {
      const response = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: this.action,
          table: this.table,
          records: this.payload,
          data: this.payload,
          filters: this.filters,
          order: this.orderConfig,
          limit: this.limitCount,
          offset: this.offsetCount,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const res = { data: null, error: { message: errorText || response.statusText } };
        return onfulfilled ? onfulfilled(res) : (res as any);
      }

      const result = await response.json();
      let data = result.data;

      if (this.isSingle && Array.isArray(data)) {
        data = data.length > 0 ? data[0] : null;
      }

      const finalResult = {
        data,
        error: result.error || null,
        count: result.count ?? (Array.isArray(data) ? data.length : data ? 1 : 0),
      };

      // Notify realtime subscribers for mutations (same-tab + cross-tab)
      if (
        typeof window !== "undefined" &&
        (this.action === "insert" ||
          this.action === "update" ||
          this.action === "upsert" ||
          this.action === "delete")
      ) {
        const changeDetail = {
          table: this.table,
          action: this.action,
          ts: Date.now(),
        };
        window.dispatchEvent(
          new CustomEvent("optimus-db-change", { detail: changeDetail }),
        );
        try {
          if (typeof BroadcastChannel !== "undefined") {
            const bc = new BroadcastChannel("optimus-db-sync");
            bc.postMessage(changeDetail);
            bc.close();
          }
        } catch {
          // Ignore BroadcastChannel errors in restricted contexts
        }
        try {
          localStorage.setItem(
            "optimus-db-sync-event",
            JSON.stringify(changeDetail),
          );
        } catch {
          // Ignore storage quota errors
        }
      }

      return onfulfilled ? onfulfilled(finalResult) : (finalResult as any);
    } catch (err: any) {
      const finalResult = { data: null, error: { message: err?.message || "Koneksi database lokal bermasalah" } };
      return onfulfilled ? onfulfilled(finalResult) : (finalResult as any);
    }
  }
}

class LocalChannel {
  private name: string;
  private subscriptions: Array<{ table?: string; callback: (payload?: any) => void }> = [];
  private listener: ((e: Event) => void) | null = null;
  private storageListener: ((e: StorageEvent) => void) | null = null;
  private broadcastChannel: BroadcastChannel | null = null;

  constructor(name: string) {
    this.name = name;
  }

  on(_event: string, schema: any, callback: (payload?: any) => void) {
    const table = schema && typeof schema === "object" ? schema.table : undefined;
    this.subscriptions.push({ table, callback });
    return this;
  }

  private dispatchChange(detail: any) {
    const changedTable = detail?.table;
    this.subscriptions.forEach((sub) => {
      if (!sub.table || !changedTable || sub.table === changedTable) {
        sub.callback(detail || {});
      }
    });
  }

  subscribe(callback?: (status: string) => void) {
    if (typeof window !== "undefined") {
      this.listener = (e: Event) => {
        const detail = (e as CustomEvent)?.detail || {};
        this.dispatchChange(detail);
      };
      window.addEventListener("optimus-db-change", this.listener);

      this.storageListener = (e: StorageEvent) => {
        if (e.key === "optimus-db-sync-event" && e.newValue) {
          try {
            const detail = JSON.parse(e.newValue);
            this.dispatchChange(detail);
          } catch {
            this.dispatchChange({});
          }
        }
      };
      window.addEventListener("storage", this.storageListener);

      try {
        if (typeof BroadcastChannel !== "undefined") {
          this.broadcastChannel = new BroadcastChannel("optimus-db-sync");
          this.broadcastChannel.onmessage = (event) => {
            this.dispatchChange(event.data || {});
          };
        }
      } catch {
        this.broadcastChannel = null;
      }
    }
    if (callback) {
      callback("SUBSCRIBED");
    }
    return this;
  }

  unsubscribe() {
    if (typeof window !== "undefined") {
      if (this.listener) {
        window.removeEventListener("optimus-db-change", this.listener);
        this.listener = null;
      }
      if (this.storageListener) {
        window.removeEventListener("storage", this.storageListener);
        this.storageListener = null;
      }
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // Ignore close errors
      }
      this.broadcastChannel = null;
    }
  }
}

class LocalStorageBucket {
  private bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  async upload(targetPath: string, file: any, _options?: any) {
    try {
      let base64Data = "";
      let fileName = targetPath || (file as any)?.name || "upload.png";

      if (file instanceof Blob || file instanceof File) {
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else if (typeof file === "string") {
        base64Data = file;
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Data,
          fileName,
          bucket: this.bucket,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        return { data: null, error: json.error || "Gagal mengunggah file" };
      }

      const fileUrl = json.url || `/uploads/${json.path}`;

      return {
        data: { path: json.path, url: fileUrl, fullUrl: fileUrl, publicUrl: fileUrl },
        error: null,
      };
    } catch (e: any) {
      return { data: null, error: e };
    }
  }

  getPublicUrl(targetPath: string) {
    const clean = targetPath.startsWith("/") ? targetPath : `/uploads/${targetPath}`;
    return {
      data: {
        publicUrl: clean,
      },
    };
  }

  async remove(_paths: string[]) {
    return { data: null, error: null };
  }
}

class LocalSupabaseClient {
  from(table: string) {
    return new LocalQueryBuilder(table);
  }

  channel(name: string) {
    return new LocalChannel(name);
  }

  removeChannel(channel: LocalChannel) {
    if (channel && typeof channel.unsubscribe === "function") {
      channel.unsubscribe();
    }
  }

  get storage() {
    return {
      from: (bucket: string) => new LocalStorageBucket(bucket),
    };
  }
}

// Export singleton instance
export const supabase = new LocalSupabaseClient();

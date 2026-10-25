declare module 'embedded-postgres' {
  export interface EmbeddedPostgresOptions {
    port?: number;
    user?: string;
    password?: string;
    databaseDir?: string;
    persistent?: boolean;
    version?: string;
  }

  export default class EmbeddedPostgres {
    constructor(options?: EmbeddedPostgresOptions);
    initialise(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
  }
}

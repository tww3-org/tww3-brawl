declare namespace NodeJS {
  interface ProcessEnv {
    POSTRGES_PASSOWRD: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_ROLE_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    JWT_SECRET: string;

    // Ajout des variables courantes de Node.js
    NODE_ENV: "development" | "production" | "test";
    PORT?: string;
    PWD: string;
  }
}

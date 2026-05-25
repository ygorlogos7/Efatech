-- Lacuna 6: tokens de reset de senha no banco (uso unico, 15 min)
CREATE TABLE IF NOT EXISTS "TokenResetSenha" (
  "Id" SERIAL PRIMARY KEY,
  "UsuarioId" INTEGER NOT NULL,
  "TokenHash" VARCHAR(64) NOT NULL,
  "ExpiraEm" TIMESTAMPTZ NOT NULL,
  "UsadoEm" TIMESTAMPTZ,
  "CriadoEm" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "Ip" VARCHAR(45),
  CONSTRAINT "FK_TokenResetSenha_Usuarios"
    FOREIGN KEY ("UsuarioId") REFERENCES "Usuarios"("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_TokenResetSenha_TokenHash" ON "TokenResetSenha" ("TokenHash");
CREATE INDEX IF NOT EXISTS "IX_TokenResetSenha_UsuarioId" ON "TokenResetSenha" ("UsuarioId");

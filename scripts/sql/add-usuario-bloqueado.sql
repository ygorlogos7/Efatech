-- Rode no Neon (SQL Editor) se a coluna ainda nao existir.
ALTER TABLE "Usuarios"
  ADD COLUMN IF NOT EXISTS "Bloqueado" BOOLEAN NOT NULL DEFAULT false;

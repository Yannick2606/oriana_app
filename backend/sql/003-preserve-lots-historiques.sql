ALTER TABLE lots
  ADD COLUMN IF NOT EXISTS reference_lot text,
  ADD COLUMN IF NOT EXISTS etage text,
  ADD COLUMN IF NOT EXISTS usage_id bigint REFERENCES ref_familles(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS type_transaction text,
  ADD COLUMN IF NOT EXISTS loyer_annuel numeric(18,2),
  ADD COLUMN IF NOT EXISTS prix_vente numeric(18,2),
  ADD COLUMN IF NOT EXISTS charges numeric(18,2),
  ADD COLUMN IF NOT EXISTS statut_commercial text,
  ADD COLUMN IF NOT EXISTS date_disponibilite date;

CREATE INDEX IF NOT EXISTS lots_usage_id_idx ON lots(usage_id);

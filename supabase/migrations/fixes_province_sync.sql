-- This ensures that regardless of which field the form fills, 
-- both columns stay in sync for the dashboard.
CREATE OR REPLACE FUNCTION sync_provinces() 
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.province IS NOT NULL AND NEW.residency_province IS NULL) THEN
    NEW.residency_province := NEW.province;
  ELSIF (NEW.residency_province IS NOT NULL AND NEW.province IS NULL) THEN
    NEW.province := NEW.residency_province;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_provinces
BEFORE INSERT OR UPDATE ON public.tax_profiles
FOR EACH ROW EXECUTE FUNCTION sync_provinces();

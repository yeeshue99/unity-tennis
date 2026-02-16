-- RPC: get_unique_rounds
-- Returns distinct rounds for a given bracket and list of statuses

CREATE OR REPLACE FUNCTION public.get_unique_rounds(
  p_bracket_id integer,
  p_statuses text[]
)
RETURNS TABLE(round integer)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT m.round
  FROM public.matchups m
  WHERE m.bracket_id = p_bracket_id
    AND m.status = ANY(p_statuses)
  ORDER BY m.round;
$$;

-- Optional: grant execute to public (adjust for your security model)
GRANT EXECUTE ON FUNCTION public.get_unique_rounds(integer, text[]) TO PUBLIC;

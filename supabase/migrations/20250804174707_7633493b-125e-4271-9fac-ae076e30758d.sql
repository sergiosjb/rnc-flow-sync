-- Set the sequence to the correct next value
SELECT setval('rnc_counter_seq', 252530);

-- Simplify the function to avoid any race conditions
CREATE OR REPLACE FUNCTION public.generate_rnc_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    year_suffix TEXT;
    counter INTEGER;
    rnc_number TEXT;
BEGIN
    year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
    
    -- Get next value from sequence (this is atomic and thread-safe)
    counter := nextval('rnc_counter_seq');
    
    -- Generate RNC number with year and counter
    rnc_number := 'RNC' || year_suffix || LPAD(counter::TEXT, 4, '0');
    
    RETURN rnc_number;
END;
$function$
-- Create a sequence for RNC numbering to ensure uniqueness
CREATE SEQUENCE IF NOT EXISTS rnc_counter_seq;

-- Create a more robust function that uses a sequence
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
    
    -- Get next value from sequence
    counter := nextval('rnc_counter_seq');
    
    -- Generate RNC number
    rnc_number := 'RNC' || year_suffix || LPAD(counter::TEXT, 4, '0');
    
    RETURN rnc_number;
END;
$function$
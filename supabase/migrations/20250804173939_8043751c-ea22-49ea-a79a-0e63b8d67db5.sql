-- Fix the generate_rnc_number function to handle concurrent access properly
CREATE OR REPLACE FUNCTION public.generate_rnc_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    year_suffix TEXT;
    counter INTEGER;
    rnc_number TEXT;
    max_attempts INTEGER := 10;
    attempt INTEGER := 0;
BEGIN
    year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
    
    LOOP
        -- Get the next counter value
        SELECT COALESCE(MAX(CAST(SUBSTRING(numero_rnc FROM 4 FOR 4) AS INTEGER)), 0) + 1
        INTO counter
        FROM public.rncs
        WHERE numero_rnc LIKE 'RNC' || year_suffix || '%';
        
        rnc_number := 'RNC' || year_suffix || LPAD(counter::TEXT, 4, '0');
        
        -- Check if this number already exists
        IF NOT EXISTS (SELECT 1 FROM public.rncs WHERE numero_rnc = rnc_number) THEN
            RETURN rnc_number;
        END IF;
        
        attempt := attempt + 1;
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique RNC number after % attempts', max_attempts;
        END IF;
        
        -- Wait a small random amount to reduce collision probability
        PERFORM pg_sleep(random() * 0.1);
    END LOOP;
END;
$function$
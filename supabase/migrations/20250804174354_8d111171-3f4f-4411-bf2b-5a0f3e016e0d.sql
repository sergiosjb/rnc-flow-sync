-- Set the sequence to start from the next available number
DO $$
DECLARE
    max_number INTEGER;
BEGIN
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(numero_rnc FROM 4) AS INTEGER)), 
        0
    ) INTO max_number
    FROM rncs 
    WHERE numero_rnc ~ '^RNC[0-9]+$';
    
    PERFORM setval('rnc_counter_seq', max_number);
END $$;
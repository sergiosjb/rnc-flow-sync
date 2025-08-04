-- Create a function that generates the number and inserts the RNC atomically
CREATE OR REPLACE FUNCTION public.create_rnc_with_number(
    p_descricao TEXT,
    p_setor TEXT,
    p_criticidade TEXT,
    p_origem TEXT,
    p_data_abertura DATE,
    p_responsavel TEXT,
    p_data_prazo DATE,
    p_user_id UUID,
    p_evidencias JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
AS $function$
DECLARE
    year_suffix TEXT;
    counter INTEGER;
    rnc_number TEXT;
    max_attempts INTEGER := 50;
    attempt INTEGER := 0;
    new_id UUID;
BEGIN
    year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
    
    LOOP
        -- Get the highest existing number for this year and add 1
        SELECT COALESCE(
            MAX(
                CASE 
                    WHEN numero_rnc ~ ('^RNC' || year_suffix || '[0-9]{4}$') 
                    THEN CAST(SUBSTRING(numero_rnc FROM 6 FOR 4) AS INTEGER)
                    ELSE 0
                END
            ), 0
        ) + 1
        INTO counter
        FROM public.rncs;
        
        rnc_number := 'RNC' || year_suffix || LPAD(counter::TEXT, 4, '0');
        
        -- Try to insert with this number
        BEGIN
            INSERT INTO public.rncs (
                descricao,
                setor,
                criticidade,
                origem,
                data_abertura,
                responsavel,
                data_prazo,
                user_id,
                numero_rnc,
                evidencias,
                status
            ) VALUES (
                p_descricao,
                p_setor,
                p_criticidade,
                p_origem,
                p_data_abertura,
                p_responsavel,
                p_data_prazo,
                p_user_id,
                rnc_number,
                p_evidencias,
                'aberta'
            ) RETURNING id INTO new_id;
            
            -- If we get here, the insert was successful
            RETURN new_id;
            
        EXCEPTION WHEN unique_violation THEN
            -- Someone else used this number, try again
            attempt := attempt + 1;
            IF attempt >= max_attempts THEN
                RAISE EXCEPTION 'Could not generate unique RNC number after % attempts', max_attempts;
            END IF;
            -- Continue to next iteration
        END;
    END LOOP;
END;
$function$;
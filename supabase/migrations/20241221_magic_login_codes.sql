-- Create magic login codes table
CREATE TABLE IF NOT EXISTS public.magic_login_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    code text NOT NULL,
    expires_at timestamptz NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_magic_login_codes_email ON public.magic_login_codes(email);
CREATE INDEX IF NOT EXISTS idx_magic_login_codes_code ON public.magic_login_codes(code);
CREATE INDEX IF NOT EXISTS idx_magic_login_codes_expires_at ON public.magic_login_codes(expires_at);

-- Add RLS policies
ALTER TABLE public.magic_login_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage codes (for magic login functionality)
CREATE POLICY "Service role can manage magic codes" ON public.magic_login_codes
    FOR ALL USING (true);

-- Create function to clean up expired magic codes
CREATE OR REPLACE FUNCTION cleanup_expired_magic_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.magic_login_codes 
    WHERE expires_at < now() OR used = true;
END;
$$;

-- Create a function to validate magic code
CREATE OR REPLACE FUNCTION validate_magic_code(email_input text, code_input text)
RETURNS TABLE(id uuid, is_valid boolean, is_expired boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mlc.id, 
        CASE 
            WHEN mlc.used = false AND mlc.expires_at > now() THEN true
            ELSE false
        END as is_valid,
        CASE 
            WHEN mlc.expires_at <= now() THEN true
            ELSE false
        END as is_expired
    FROM public.magic_login_codes mlc
    WHERE mlc.email = email_input AND mlc.code = code_input
    ORDER BY mlc.created_at DESC
    LIMIT 1;
END;
$$; 
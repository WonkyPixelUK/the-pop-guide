-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token text UNIQUE NOT NULL,
    email text NOT NULL,
    expires_at timestamptz NOT NULL,
    used_at timestamptz NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Add RLS policies
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tokens (for cleanup purposes)
CREATE POLICY "Users can view their own reset tokens" ON public.password_reset_tokens
    FOR SELECT USING (user_id = auth.uid());

-- Allow service role to insert tokens (for password reset functionality)
CREATE POLICY "Service role can insert tokens" ON public.password_reset_tokens
    FOR INSERT WITH CHECK (true);

-- Allow service role to update tokens (for marking as used)
CREATE POLICY "Service role can update tokens" ON public.password_reset_tokens
    FOR UPDATE USING (true);

-- Allow service role to delete expired tokens
CREATE POLICY "Service role can delete tokens" ON public.password_reset_tokens
    FOR DELETE USING (true);

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.password_reset_tokens 
    WHERE expires_at < now() OR used_at IS NOT NULL;
END;
$$;

-- Create a function to validate and use reset token
CREATE OR REPLACE FUNCTION validate_reset_token(token_input text)
RETURNS TABLE(user_id uuid, email text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        prt.user_id, 
        prt.email,
        CASE 
            WHEN prt.expires_at > now() AND prt.used_at IS NULL THEN true
            ELSE false
        END as is_valid
    FROM public.password_reset_tokens prt
    WHERE prt.token = token_input;
END;
$$; 
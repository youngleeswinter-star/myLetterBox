import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rmufmaukaerrpevtczxf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdWZtYXVrYWVycnBldnRjenhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1Mzc3OTYsImV4cCI6MjA5NjExMzc5Nn0.0GOTye72VZUgG0DNXxJ8dhHdF9koBkk4-o6w0wmWxi8';
export const supabase = createClient(supabaseUrl, supabaseKey);
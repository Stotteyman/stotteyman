import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://drpowbmmyxwmedaxcjdy.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRycG93Ym1teXh3bWVkYXhjamR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2OTQ4NjgsImV4cCI6MjA5MzI3MDg2OH0.8nw4ofLo-WpWpgZYfKmNFT3hNncH6kwV4QzjlUO2qQU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

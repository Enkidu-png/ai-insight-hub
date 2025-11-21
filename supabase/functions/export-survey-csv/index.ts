import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting CSV export...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all survey responses
    const { data: responses, error } = await supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching survey responses:', error);
      throw error;
    }

    console.log(`Found ${responses?.length || 0} survey responses`);

    // Generate CSV content
    const csvHeader = 'ID,Email,Profession,Experience,AI Areas,Challenge,Expectations,Time Spent,Frustration,Data Consent,Created At\n';
    
    const csvRows = responses?.map(row => {
      const aiAreas = Array.isArray(row.ai_areas) ? row.ai_areas.join('; ') : '';
      return [
        row.id,
        row.email,
        escapeCSV(row.profession),
        escapeCSV(row.experience),
        escapeCSV(aiAreas),
        escapeCSV(row.challenge),
        escapeCSV(row.expectations),
        escapeCSV(row.time_spent),
        escapeCSV(row.frustration),
        row.data_consent,
        row.created_at
      ].join(',');
    }).join('\n') || '';

    const csvContent = csvHeader + csvRows;
    
    console.log('CSV generated successfully');

    return new Response(csvContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="survey-responses-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error in export-survey-csv function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function escapeCSV(value: string): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

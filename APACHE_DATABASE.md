# Apache Server + Database Integration Guide

## Overview

This application includes a backend database powered by Lovable Cloud that collects and stores survey responses. The data can be exported as CSV files for analysis.

## Architecture

- **Frontend**: React app served by Apache
- **Backend**: Lovable Cloud (serverless backend with PostgreSQL database)
- **CSV Export**: Serverless function for data export

## Database Structure

### Survey Responses Table

The `survey_responses` table stores all survey submissions:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | User's email address |
| profession | TEXT | Professional role |
| experience | TEXT | AI experience level |
| ai_areas | TEXT[] | Areas of AI usage (array) |
| challenge | TEXT | Biggest AI challenge |
| expectations | TEXT | Expectations from training |
| time_spent | TEXT | Weekly time spent with AI |
| frustration | TEXT | Current frustrations |
| data_consent | BOOLEAN | Data processing consent |
| created_at | TIMESTAMP | Submission timestamp |

## Accessing Survey Data

### Method 1: View in Backend Dashboard

1. Click the "Cloud" button in your Lovable project
2. Navigate to "Database" → "Tables"
3. Select "survey_responses" to view all submissions
4. Use the interface to filter, search, and view responses

### Method 2: Export as CSV

The application includes a CSV export endpoint:

**Endpoint**: `https://ocqipyupzudrihqdzfbd.supabase.co/functions/v1/export-survey-csv`

**Usage**:
```bash
# Download CSV file
curl -o survey-data.csv https://ocqipyupzudrihqdzfbd.supabase.co/functions/v1/export-survey-csv
```

**Browser Access**:
Simply visit the URL in your browser to download the CSV file directly.

**CSV Format**:
- Headers: ID, Email, Profession, Experience, AI Areas, Challenge, Expectations, Time Spent, Frustration, Data Consent, Created At
- All fields properly escaped for CSV compatibility
- Arrays (AI Areas) are joined with semicolons

### Method 3: Add Admin Page (Optional)

You can create an admin page in your React app to view and export data:

```typescript
// Example admin component
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    const { data } = await supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false });
    setResponses(data || []);
  };

  const exportCSV = () => {
    window.open('https://ocqipyupzudrihqdzfbd.supabase.co/functions/v1/export-survey-csv', '_blank');
  };

  return (
    <div>
      <h1>Survey Responses ({responses.length})</h1>
      <Button onClick={exportCSV}>Export CSV</Button>
      {/* Display responses in a table */}
    </div>
  );
}
```

## Security Notes

**IMPORTANT**: The current configuration allows public access to:
- Survey submission (anyone can submit)
- Data viewing (anyone can read responses)
- CSV export (anyone can download)

This is appropriate for an open research/marketing survey. If you need to restrict access:

1. **Protect CSV Export**: Add authentication to the edge function
2. **Limit Data Access**: Update RLS policies to require authentication
3. **Add Admin Role**: Implement user roles for admin-only access

### Making CSV Export Private (Optional)

Edit `supabase/functions/export-survey-csv/index.ts` to require authentication:

```typescript
// Add authentication check
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response('Unauthorized', { status: 401 });
}
```

## Deployment Checklist

- [x] Apache server configured (.htaccess in place)
- [x] Frontend built and deployed
- [x] Database table created
- [x] Survey form connected to database
- [x] CSV export function deployed
- [ ] Test survey submission
- [ ] Verify data appears in backend
- [ ] Test CSV export download

## Monitoring & Maintenance

### Check Survey Submissions

Visit the Lovable Cloud dashboard regularly to:
- Monitor new submissions
- Check for errors or incomplete data
- Export data for analysis

### Backend Logs

If you encounter issues:
1. Open your Lovable project
2. Click "Cloud" → "Edge Functions"
3. Select "export-survey-csv" to view logs
4. Check for errors or warnings

### Database Backup

The backend automatically backs up your data. For additional safety:
1. Regularly export CSV files
2. Store exports in a secure location
3. Consider setting up automated exports via cron job

## Apache Integration Notes

**Static Frontend + Dynamic Backend**:
- Apache serves the React app (static files)
- API calls go directly to Lovable Cloud endpoints
- No Apache configuration needed for API routes
- CORS is handled by edge functions

**Environment Variables**:
The frontend is pre-configured with backend URLs. No additional Apache environment configuration required.

## Troubleshooting

### Submissions Not Saving
1. Check browser console for errors
2. Verify network requests are reaching the backend
3. Check backend logs in Lovable Cloud dashboard

### CSV Export Empty
1. Verify data exists in database (check backend dashboard)
2. Check edge function logs for errors
3. Try downloading directly from browser

### CORS Errors
- Edge functions include CORS headers
- If issues persist, check browser console for specific errors
- Verify the correct API endpoint is being called

## Support

For issues or questions:
- Check Lovable documentation: https://docs.lovable.dev
- Review backend logs in Cloud dashboard
- Verify Apache configuration (see DEPLOY.md)

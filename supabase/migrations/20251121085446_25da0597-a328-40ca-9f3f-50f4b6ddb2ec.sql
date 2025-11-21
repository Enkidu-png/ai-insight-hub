-- Create survey responses table
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profession TEXT NOT NULL,
  experience TEXT NOT NULL,
  ai_areas TEXT[] NOT NULL,
  email TEXT NOT NULL,
  challenge TEXT NOT NULL,
  expectations TEXT NOT NULL,
  time_spent TEXT NOT NULL,
  frustration TEXT NOT NULL,
  data_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (since it's a survey)
CREATE POLICY "Anyone can submit survey responses" 
ON public.survey_responses 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading all responses (for CSV export)
CREATE POLICY "Anyone can read survey responses" 
ON public.survey_responses 
FOR SELECT 
USING (true);

-- Create index on email for faster lookups
CREATE INDEX idx_survey_responses_email ON public.survey_responses(email);

-- Create index on created_at for sorting
CREATE INDEX idx_survey_responses_created_at ON public.survey_responses(created_at DESC);
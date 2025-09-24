-- Add new fields to reports table for enhanced plant analysis data
ALTER TABLE public.reports 
ADD COLUMN required_nutrients text,
ADD COLUMN recommended_pesticides_or_fertilizers text,
ADD COLUMN stage text;

-- Add comment for documentation
COMMENT ON COLUMN public.reports.required_nutrients IS 'Nutritional requirements for the plant';
COMMENT ON COLUMN public.reports.recommended_pesticides_or_fertilizers IS 'Recommended treatments and fertilizers';
COMMENT ON COLUMN public.reports.stage IS 'Current growth stage of the plant';
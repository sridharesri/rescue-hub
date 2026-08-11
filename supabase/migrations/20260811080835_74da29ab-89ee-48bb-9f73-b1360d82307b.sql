CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TYPE public.rescue_team_status AS ENUM ('AVAILABLE','DISPATCHED','ON_THE_WAY','ON_SITE','RESCUING','COMPLETED');

CREATE TABLE public.rescue_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organisation TEXT NOT NULL DEFAULT '',
  base_area TEXT NOT NULL,
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  members INTEGER NOT NULL DEFAULT 0,
  contact_phone TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  status public.rescue_team_status NOT NULL DEFAULT 'AVAILABLE',
  disaster_id UUID REFERENCES public.disasters(id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.rescue_team_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.rescue_teams(id) ON DELETE CASCADE,
  author_id UUID,
  author_email TEXT,
  status public.rescue_team_status NOT NULL,
  disaster_id UUID REFERENCES public.disasters(id) ON DELETE SET NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX rescue_teams_status_idx ON public.rescue_teams (status);
CREATE INDEX rescue_teams_disaster_idx ON public.rescue_teams (disaster_id);
CREATE INDEX rescue_team_updates_team_idx ON public.rescue_team_updates (team_id, created_at DESC);

GRANT SELECT ON public.rescue_teams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rescue_teams TO authenticated;
GRANT ALL ON public.rescue_teams TO service_role;

GRANT SELECT ON public.rescue_team_updates TO anon;
GRANT SELECT, INSERT ON public.rescue_team_updates TO authenticated;
GRANT ALL ON public.rescue_team_updates TO service_role;

ALTER TABLE public.rescue_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_team_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rescue teams are publicly readable"
  ON public.rescue_teams FOR SELECT USING (true);

CREATE POLICY "Responders can create rescue teams"
  ON public.rescue_teams FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Responders can update rescue teams"
  ON public.rescue_teams FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rescue teams"
  ON public.rescue_teams FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Rescue team updates are publicly readable"
  ON public.rescue_team_updates FOR SELECT USING (true);

CREATE POLICY "Responders can log rescue team updates"
  ON public.rescue_team_updates FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE TRIGGER update_rescue_teams_updated_at
  BEFORE UPDATE ON public.rescue_teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.rescue_teams (name, organisation, base_area, capabilities, members, contact_phone, available, status, notes) VALUES
  ('NDRF Team Alpha', 'National Disaster Response Force', 'Guwahati, Assam', ARRAY['Flood rescue','Boat operations','Medical first aid'], 24, '+91 98100 11223', true, 'AVAILABLE', 'Primary flood response unit for the Brahmaputra basin.'),
  ('SDRF Bravo', 'State Disaster Response Force', 'Kamrup, Assam', ARRAY['Search and rescue','Rope rescue','Debris clearance'], 18, '+91 98100 44556', true, 'AVAILABLE', 'Rapid deployment unit with rope and collapse-rescue kit.'),
  ('Coastal Rescue Squad', 'Coast Guard Auxiliary', 'Puri, Odisha', ARRAY['Cyclone response','Water rescue','Evacuation support'], 30, '+91 98100 77889', false, 'ON_THE_WAY', 'Mobilised for coastal evacuation support.'),
  ('Medical Response Unit 7', 'State Health Mission', 'Bhubaneswar, Odisha', ARRAY['Field triage','Ambulance transport','Casualty care'], 12, '+91 98100 33221', true, 'AVAILABLE', 'Mobile trauma unit with two ambulances.');
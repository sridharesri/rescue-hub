CREATE TYPE public.app_role AS ENUM ('citizen','responder','admin');
CREATE TYPE public.report_status AS ENUM ('PENDING','VERIFIED','REJECTED');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.bootstrap_my_role()
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  has_admin boolean;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO has_admin;

  IF NOT has_admin THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'citizen')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN (
    SELECT role FROM public.user_roles
    WHERE user_id = uid
    ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'responder' THEN 2 ELSE 3 END
    LIMIT 1
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.bootstrap_my_role() TO authenticated;

CREATE TABLE public.disaster_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reporter_email text,
  title text NOT NULL,
  type text NOT NULL,
  description text NOT NULL DEFAULT '',
  severity public.severity_level NOT NULL DEFAULT 'MODERATE',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  area text NOT NULL,
  affected_estimate integer NOT NULL DEFAULT 0,
  status public.report_status NOT NULL DEFAULT 'PENDING',
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  disaster_id uuid REFERENCES public.disasters(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.disaster_reports TO authenticated;
GRANT ALL ON public.disaster_reports TO service_role;
ALTER TABLE public.disaster_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit their own reports" ON public.disaster_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can read their own reports" ON public.disaster_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Responders can read all reports" ON public.disaster_reports
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Responders can review reports" ON public.disaster_reports
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.disaster_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id uuid NOT NULL REFERENCES public.disasters(id) ON DELETE CASCADE,
  author_id uuid,
  author_email text,
  status public.disaster_status,
  severity public.severity_level,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.disaster_updates TO anon, authenticated;
GRANT INSERT ON public.disaster_updates TO authenticated;
GRANT ALL ON public.disaster_updates TO service_role;
ALTER TABLE public.disaster_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Updates are publicly readable" ON public.disaster_updates
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Responders can log updates" ON public.disaster_updates
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'));

GRANT INSERT, UPDATE ON public.disasters TO authenticated;
CREATE POLICY "Responders can create disasters" ON public.disasters
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Responders can update disasters" ON public.disasters
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'));

GRANT UPDATE ON public.shelters TO authenticated;
CREATE POLICY "Responders can update shelters" ON public.shelters
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'));

GRANT UPDATE ON public.hospitals TO authenticated;
CREATE POLICY "Responders can update hospitals" ON public.hospitals
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'responder') OR public.has_role(auth.uid(), 'admin'));

GRANT INSERT ON public.alerts TO authenticated;
CREATE POLICY "Admins can publish alerts" ON public.alerts
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
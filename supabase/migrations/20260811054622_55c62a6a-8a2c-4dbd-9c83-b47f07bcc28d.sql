REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.bootstrap_my_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_my_role() TO authenticated, service_role;
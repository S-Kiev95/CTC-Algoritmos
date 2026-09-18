-- Tarea diaria dentro de Postgres (pg_cron): todos los dias a las 12:00 UTC
-- le pide la fecha a la base. Si ya existe, la vuelve a programar igual.
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule('consulta-diaria', '0 12 * * *', 'select now()');

-- Para verificar la tarea:
select jobid, jobname, schedule, command, active from cron.job;

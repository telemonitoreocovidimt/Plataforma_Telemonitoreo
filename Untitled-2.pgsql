





select p.dni,
case when c.edad is null then p.edad else c.edad end,
p.factor_riesgo,
'PACIENTE' as seguimiento,
p.nombre,
c.observacion,
'' as parentesco,
(select '2020-10-20'::date - fecha_creacion::date from development.dt_contactos_pacientes where dni_contacto = c.dni and fecha_creacion = '2020-10-20'::date limit 1)::int as dia,
(select flag from development.dt_contactos_pacientes where dni_contacto = c.dni and fecha_creacion = '2020-10-20'::date limit 1)::char(1) as monitoreo
from development.dt_pacientes as p
left join development.dt_contactos as c
on p.dni = c.dni
where p.dni = '43211804';




select cp.dni_contacto as dni,
c.edad,
c.factor_riesgo,
'CONTACTO' as seguimiento,
c.nombre,
c.observacion,
'' as parentesco,
(select '2020-10-20'::date - fecha_creacion::date from development.dt_contactos_pacientes where dni_contacto = cp.dni_contacto and fecha_creacion = '2020-10-20'::date limit 1)::int as dia,
(select flag from development.dt_contactos_pacientes where dni_contacto = cp.dni_contacto and fecha_creacion = '2020-10-20'::date limit 1)::char(1) as monitoreo
from development.dt_contactos_pacientes as cp
left join development.dt_contactos as c
on cp.dni_contacto = c.dni
where cp.dni_contacto = '43211804' limit 1;







select * from development.dt_contactos;

select * from development.dt_contactos_pacientes;

select '2020-10-20'::date - fecha_monitoreo as dia, 
id_status as monitoreo   from development.dt_monitoreo_contactos
where dni_contacto = '' and fecha_monitoreo < '2020-10-20'::date;




select * from development.dt_contactos_pacientes


alter table development.dt_contactos_pacientes add column parentesco varchar(50)




select c.dni,
c.edad,
c.factor_riesgo,
'CONTACTO' as seguimiento,
c.nombre,
c.observacion,
cp.parentesco,
(select '2020-10-20'::date - fecha_creacion::date from development.dt_contactos_pacientes where dni_contacto = cp.dni_contacto and fecha_creacion = '2020-10-20'::date limit 1)::int as dia,
(select flag from development.dt_contactos_pacientes where dni_contacto = cp.dni_contacto and fecha_creacion = '2020-10-20'::date limit 1)::char(1) as monitoreo
from development.dt_contactos_pacientes as cp
                        inner join development.dt_contactos as c
                        on cp.dni_contacto = c.dni
                        where cp.dni_paciente = $1;




select '2020-10-20'::date - fecha_monitoreo as dia, 
id_status as monitoreo   from development.dt_monitoreo_contactos
where dni_contacto = '' and fecha_monitoreo < '2020-10-20'::date;




update development.dt_monitoreo_contactos set
    id_status = ""
    where fecha_monitoreo::date = '2020-10-20'::date and dni_contacto = '';


select * from development.dt_monitoreo_contactos
where fecha_monitoreo::date = '2020-10-20'::date and dni_contacto = ''

insert into development.dt_monitoreo_contactos
(dni_contacto, fecha_monitoreo, id_status)
values ($1, $2, $3)

select (select edad from development.dt_pacientes where dni = '41311356' limit 1)::int 

select case when  (select edad from development.dt_pacientes where dni = '41311356' limit 1)::int is null then (select edad from development.dt_pacientes where dni = '41311356'  limit 1)::int
            else 43 end as edad

select * from development.dt_pacientes;

select * from development.dt_contactos;

select * from development.dt_contactos_pacientes;

select * from development.dt_monitoreo_contactos;






select cp.dni_contacto as dni,
case when (select count(*) from development.dt_pacientes where dni = cp.dni_contacto)::int > 0 then (select edad from development.dt_pacientes where dni = cp.dni_contacto limit 1)::int
else c.edad end as edad,
c.factor_riesgo,
case when (select count(*) from development.dt_pacientes where dni = cp.dni_contacto)::int > 0 then 'PACIENTE'
else 'CONTACTO' end as seguimiento,
c.nombre,
c.observacion,
cp.parentesco,
(select '2020-06-30'::date - fecha_creacion::date + 1 from development.dt_contactos_pacientes where dni_contacto = cp.dni_contacto and fecha_creacion = '2020-06-30'::date limit 1)::int as dia,
(select flag from development.dt_contactos_pacientes where dni_contacto = cp.dni_contacto and fecha_creacion = '2020-06-30'::date limit 1)::char(1) as monitoreo
from development.dt_contactos_pacientes as cp
left join development.dt_contactos as c
on cp.dni_contacto = c.dni
where cp.dni_paciente = '06843695';






update development.dt_monitoreo_contactos set
                id_status = 'H'
                where fecha_monitoreo::date = '2020-06-30'::date and dni_contacto = '73454770';


select * from development.dt_monitoreo_contactos


select '2020-06-30'::date - fecha_monitoreo as dia, 
        id_status as monitoreo  from development.dt_monitoreo_contactos



select * from development.dt_monitoreo_contactos



select * from development.dt_contactos



select c.dni,
c.edad,
c.factor_riesgo,
'CONTACTO' as seguimiento,
c.nombre,
c.observacion,
'' as parentesco,
'2020-06-30'::date - fecha_creacion::date + 1 as dia,
(select id_status from development.dt_monitoreo_contactos where dni_contacto = c.dni and fecha_monitoreo = '2020-06-30'::date limit 1)::char(1) as monitoreo
from development.dt_contactos as c
where cp.dni_contacto = $1 limit 1;
(select '2020-10-10'::date - fecha_creacion::date + 1 from development.dt_contactos where dni = c.dni and fecha_creacion = '2020-10-10'::date limit 1)::int as dia,
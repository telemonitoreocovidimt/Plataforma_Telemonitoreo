

select * from development.dt_contactos_pacientes;


select * from development.dt_contactos;



select cp.dni_contacto as dni,
case when (select edad from development.dt_pacientes where dni = cp.dni_contacto limit 1)::int is null then c.edad
else (select edad from development.dt_pacientes where dni = cp.dni_contacto limit 1)::int end as edad,
c.factor_riesgo,
case when (select count(*) from development.dt_pacientes where dni = cp.dni_contacto)::int > 0 then 1
when cp.flag then 2
else 3 end as seguimiento,
c.nombre,
c.observacion,
cp.parentesco,
('2020-07-02'::date - c.fecha_creacion::date + 1)::int as dia,
(select id_status from development.dt_monitoreo_contactos where dni_contacto = cp.dni_contacto and fecha_monitoreo = '2020-07-02'::date limit 1)::char(1) as monitoreo
from development.dt_contactos_pacientes as cp
left join development.dt_contactos as c
on cp.dni_contacto = c.dni
where cp.dni_paciente = $1;



select p.dni,
case when c.edad is null then p.edad else c.edad end,
p.factor_riesgo,
1 as seguimiento,
p.nombre,
c.observacion,
'' as parentesco,
($2::date - c.fecha_creacion::date + 1)::int as dia,
(select id_status from ${PGSCHEMA}.dt_monitoreo_contactos 
    where dni_contacto = c.dni and fecha_monitoreo = $2::date limit 1)::char(1) as monitoreo
from ${PGSCHEMA}.dt_pacientes as p
left join ${PGSCHEMA}.dt_contactos as c
on p.dni = c.dni
where p.dni = $1;

select * from development.dt_monitoreo_contactos




select c.dni,
c.edad,
c.factor_riesgo,
3 as seguimiento,
c.nombre,
c.observacion,
'' as parentesco,
($2::date - fecha_creacion::date + 1) as dia,
(select id_status from ${PGSCHEMA}.dt_monitoreo_contactos where dni_contacto = c.dni and fecha_monitoreo = $2::date limit 1)::char(1) as monitoreo
(select id_status from ${PGSCHEMA}.dt_monitoreo_contactos where dni_contacto = c.dni and fecha_monitoreo = $2::date limit 1)::char(1) as monitoreo
from ${PGSCHEMA}.dt_contactos as c
where c.dni = $1 limit 1;



select (c.fecha_creacion::date - mc.fecha_monitoreo + 1) as dia, 
        mc.id_status as monitoreo  from ${PGSCHEMA}.dt_monitoreo_contactos as mc
        INNER join ${PGSCHEMA}.dt_contactos as c
        on mc.dni_contacto = c.dni
        where dni_contacto = $1 and fecha_monitoreo < $2::date;


select * from development.dt_contactos


select * from development.dt_pacientes;


select * from development.dt_monitoreo_contactos;

select * from development.dt_contactos;




select * from development.dt_contactos_pacientes;

update development.dt_contactos_pacientes set
    flag = true
where dni_contacto = '73454770' and dni_paciente = '';


update development.dt_contactos_pacientes set
    flag = false
where dni_contacto = ''






show timezone;

SELECT * FROM pg_timezone_names;

select now();

select * from development.dm_preguntas;

set timezone = "America/Lima";
America/Lima	-05	-PT5H	false




drop table if exists development.dt_contactos;
create table development.dt_contactos(
    dni varchar(16) primary key not null,
    parentesco varchar(100) not null,
    nombre varchar(100) not null,
    edad int not null,
    factor_riesgo BOOLEAN default false,
    observacion text,
    fecha_creacion date DEFAULT (now() at time zone 'America/Lima')
);

drop table if exists development.dt_contactos_pacientes;
create table development.dt_contactos_pacientes(
    dni_contacto varchar(16) references development.dt_contactos(dni),
    dni_paciente varchar(16) references development.dt_pacientes(dni),
    fecha_creacion date DEFAULT (now() at time zone 'America/Lima'),
    flag boolean default true
);



--- Select Contactos

select * from development.dt_contactos_pacientes as cp
inner join development.dt_contactos as c
on cp.dni_contacto = c.dni
where cp.dni_paciente = $2;

-- Validar si el contacto existe

select * from development.dt_contactos
where dni = $1 limit 1;

--- Insertar nuevo contacto

insert into development.dt_contactos(
    dni,
    parentesco,
    nombre,
    edad,
    factor_riesgo,
    observacion
) values($1, $2, $3, $4, $5, $6);

insert into development.dt_contactos_pacientes(
    dni_contacto,
    dni_paciente
)
values ($1, $2);

--Existe relacion ?
select * from development.dt_contactos_pacientes
where dni_contacto = $1 and dni_paciente = $2; 

-- Desvincular
update development.dt_contactos_pacientes set
    flag = 0
where dni_contacto = $1 and dni_paciente = $2; 


--Actualizar contacto

update development.dt_contactos set
    parentesco = $2,
    nombre = $3,
    edad = $4,
    factor_riesgo = $5,
    observacion = $6
where dni = $1;







update development.dt_contactos set
    dni
    parentesco
    nombre
    edad
    factor_riesgo
    observacion
    fecha_creacion
where dni








/*
A => Asintomatico
S => Sintomatico
H => Hospitalizado
F => Fallecido
*/

drop table if exists development.dt_monitoreo_contactos;
create table development.dt_monitoreo_contactos(
    id serial primary key,
    dni_contacto varchar(16) not null references development.dt_contactos(dni),
    fecha_monitoreo date DEFAULT (now() at time zone 'America/Lima'),
    id_status char(1)
);




-- Obtener combos de contactos

select row_number() over(order by day) , *  FROM  (
   SELECT generate_series(date '2016-10-17', date '2016-10-30', '1 day')::date
   ) d(day)
left join development.dt_monitoreo_contactos as mc
on d.day = mc.fecha_monitoreo
where dni_contacto = $1



-- Agregar Seguimiento Contacto

insert into development.dt_monitoreo_contactos(
    dni_contacto,
    id_status
) values ($1, $2)


--update seguimiento contacto

update development.dt_monitoreo_contactos set
    dni_contacto = $2,
    fecha_monitoreo = $3,
    id_status = $4
where id = $1


-- Validar contacto por dia determinado

select * from development.dt_monitoreo_contactos as mc
where mc.fecha_monitoreo = $1::date

-- Acttualizar contacto

update development.dt_monitoreo_contactos
set id_status = $2
where id = $1;























select * from development.dt_contactos as c
where c.dni_paciente = '$1'




select * from generate_series(date '2016-10-17', date '2016-10-30', '1 day')


-- ('2016-10-30'::date - '2016-10-17'::date)::int  as day_passed



select column_name,
case 
    when domain_name is not null then domain_name
    when data_type='character varying' THEN 'varchar('||character_maximum_length||')'
    when data_type='numeric' THEN 'numeric('||numeric_precision||','||numeric_scale||')'
    else data_type
end as myType
from information_schema.columns
where table_name='dt_pacientes'



--------------------










drop table if exists development.dt_contactos;
create table development.dt_contactos(
    dni varchar(16) primary key not null,
    parentesco varchar(100) not null,
    nombre varchar(100) not null,
    edad int not null,
    factor_riesgo BOOLEAN default false,
    observacion text,
    fecha_creacion date DEFAULT (now() at time zone 'America/Lima')
);

drop table if exists development.dt_contactos_pacientes;
create table development.dt_contactos_pacientes(
    dni_contacto varchar(16) references development.dt_contactos(dni),
    dni_paciente varchar(16) references development.dt_pacientes(dni),
    fecha_creacion date DEFAULT (now() at time zone 'America/Lima'),
    flag boolean default true
);


drop table if exists development.dt_monitoreo_contactos;
create table development.dt_monitoreo_contactos(
    id serial primary key,
    dni_contacto varchar(16) not null references development.dt_contactos(dni),
    fecha_monitoreo date DEFAULT (now() at time zone 'America/Lima'),
    id_status char(1)
);













select *,
dc.fecha_creacion - '2020-10-06'::date as dia,
(select case
    when (select count(*) from development.dt_pacientes where dni = dc.dni)::int > 0 then 'PACIENTE'
    when (select count(*) from development.dt_contactos_pacientes where dni_paciente = dc.dni)::int > 0 then 'CONTACTO'
    else 'NO' end)::text as seguimiento,
(select id_status::char(1) from development.dt_monitoreo_contactos as mc
where mc.dni_contacto = dc.dni)::char(1) as monitoreo
from development.dt_contactos as dc
where dc.dni = '924017549';


------------------
------------------
------------------


select row_number() over(order by day) as idx,
fecha_monitoreo - '2020-06-26'::date as dia,
id_status::char(1) as monitoreo
  FROM  (
   SELECT generate_series(date '2016-10-17', date '2016-10-30', '1 day')::date
   ) d(day)
left join development.dt_monitoreo_contactos as mc
on d.day = mc.fecha_monitoreo
where dni_contacto = $1 and fecha_monitoreo < '2020-06-26'::date;
















select * from development.dt_monitoreo_contactos
where dni_contacto = '' and fecha_monitoreo < '2020-06-26'::date;



select id_status::char(1) from development.dt_monitoreo_contactos as mc
where mc.dni_contacto = dc.dni

(select case
    when )
select case
    when (select count(*) from development.dt_pacientes where dni = '748203')::int > 0 then 'PACIENTE'
    when (select count(*) from development.dt_contactos_pacientes where dni_paciente = '748203')::int > 0 then 'CONTACTO'
    else 'NO' end;








id
id_tratamiento
id_caso_dia
nombre
fecha_desde
fecha_hasta
observacion


drop table if exists development.dt_tratamientos;
create table development.dt_tratamientos_caso_dia(
    id serial primary key,
    id_tratamiento int,
    id_caso_dia int REFERENCES development.dt_casos_dia(id),
    nombre varchar(50) not NULL,
    fecha_desde date,
    fecha_hasta date,
    observacion varchar(250)
);

select * from development.dt_tratamientos_caso_dia



select * from development.dt_tratamientos where id_caso_dia = $1



delete from development.dt_tratamientos where id_caso_dia = $1 and id_tratamiento = $2


insert into development.dt_tratamientos(id_tratamiento, id_caso_dia, nombre, fecha_desde, fecha_hasta, observacion)
values ($1, $2, $3, $4, $5, $6)



update development.dt_tratamientos set
                    nombre = $4,
                    fecha_desde = $5,
                    fecha_hasta = $6,
                    observacion = $7
where id = $1 and id_tratamiento = $2 and id_caso_dia = $3;
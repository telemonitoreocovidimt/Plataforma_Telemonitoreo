--
-- PostgreSQL database dump
--

-- Dumped from database version 12.7
-- Dumped by pg_dump version 13.2

-- Started on 2021-07-22 15:25:21 -05

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE ibmclouddb;
--
-- TOC entry 3661 (class 1262 OID 16471)
-- Name: ibmclouddb; Type: DATABASE; Schema: -; Owner: ibm-cloud-base-user
--

CREATE DATABASE ibmclouddb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'C.UTF-8';


ALTER DATABASE ibmclouddb OWNER TO "ibm-cloud-base-user";

\connect ibmclouddb

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 9 (class 2615 OID 16474)
-- Name: development; Type: SCHEMA; Schema: -; Owner: ibm-cloud-base-user
--

CREATE SCHEMA development;


ALTER SCHEMA development OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 378 (class 1255 OID 17578)
-- Name: sp_add_history(character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_add_history(_dni character varying, _destino character varying, _lugar_destino character varying, "_clasificación" character varying, _evolucion character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare _id int;
begin
	insert into development.dt_historial (dni_paciente, destino, lugar_destino, clasificación, evolucion) 
            values (_dni, _destino, _lugar_destino, _clasificación, _evolucion) returning id into _id;
    return _id;
end;
$$;


ALTER FUNCTION development.sp_add_history(_dni character varying, _destino character varying, _lugar_destino character varying, "_clasificación" character varying, _evolucion character varying) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 401 (class 1255 OID 53592)
-- Name: sp_add_patient_admission(character varying, character varying, timestamp without time zone, timestamp without time zone, character varying, character varying, character varying, character varying, integer); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_add_patient_admission(_dni character varying, _codigo character varying, _fecha_ingreso timestamp without time zone, _fecha_creacion timestamp without time zone, _nombre character varying, _direccion character varying, _celular character varying, _fijo character varying, _id_hospital integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
declare max_days varchar(20) := concat((select param.cantidad_max from development.dm_parametros as param where param.id = 1 limit 1)::int, ' days');
begin
	if not exists (select * from development.dt_pacientes where dni = _dni) then
    	insert into development.dt_pacientes (dni, codigo, fecha_ingreso, fecha_creacion, nombre, direccion, celular, fijo, estado, grupo, factor_riesgo, paso_encuesta_inicial, flag_activo, id_hospital) 
                                    values(_dni, _codigo, _fecha_ingreso, _fecha_creacion, _nombre, _direccion, _celular, _fijo, 1, 'C', null, false, true, _id_hospital);
    end if;
    return true;
end;
$$;


ALTER FUNCTION development.sp_add_patient_admission(_dni character varying, _codigo character varying, _fecha_ingreso timestamp without time zone, _fecha_creacion timestamp without time zone, _nombre character varying, _direccion character varying, _celular character varying, _fijo character varying, _id_hospital integer) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 379 (class 1255 OID 17579)
-- Name: sp_add_patient_excel_01(character varying, character varying, character varying, timestamp without time zone, timestamp without time zone, integer, character varying, character varying, character varying); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_add_patient_excel_01(_dni character varying, _codigo character varying, _nombre character varying, _fecha_ingreso timestamp without time zone, _fecha_creacion timestamp without time zone, _tipo_documento integer, _direccion character varying, _celular character varying, _fijo character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
declare max_days varchar(20) := concat((select param.cantidad_max from development.dm_parametros as param limit 1)::int, ' days');
begin
	if not exists (select * from development.dt_pacientes where dni = _dni) then
    	insert into development.dt_pacientes (dni, codigo, tipo_documento, fecha_ingreso, fecha_creacion, nombre, direccion, celular, fijo, estado, grupo, factor_riesgo, paso_encuesta_inicial, flag_activo) 
                                    values(_dni, _codigo, _tipo_documento, _fecha_ingreso, _fecha_creacion, _nombre, _direccion, _celular, _fijo, 1, 'C', null, false, true);
    else
    	if exists (select * from development.dt_pacientes where dni = _dni and (fecha_creacion + max_days::interval) < _fecha_creacion) then
            update development.dt_pacientes set 
                fecha_ingreso = _fecha_ingreso,
                tipo_documento = _tipo_documento,
                fecha_creacion = _fecha_creacion,
                nombre = _nombre,
                direccion = _direccion,
                celular = _celular,
                fijo = _fijo,
                estado = 1,
                grupo = 'C',
                codigo = _codigo,
                factor_riesgo = null
            where dni = _dni;
        else
        	update development.dt_pacientes set 
                fecha_ingreso = _fecha_ingreso,
                tipo_documento = _tipo_documento,
                nombre = _nombre,
                direccion = _direccion,
                celular = _celular,
                fijo = _fijo,
                estado = 1,
                grupo = 'C',
                codigo = _codigo
            where dni = _dni;
        end if;
    end if;
    return true;
end;
$$;


ALTER FUNCTION development.sp_add_patient_excel_01(_dni character varying, _codigo character varying, _nombre character varying, _fecha_ingreso timestamp without time zone, _fecha_creacion timestamp without time zone, _tipo_documento integer, _direccion character varying, _celular character varying, _fijo character varying) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 380 (class 1255 OID 17580)
-- Name: sp_add_patient_excel_01_test(character varying, character varying, character varying, timestamp without time zone, timestamp without time zone, character varying, character varying, character varying); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_add_patient_excel_01_test(_dni character varying, _codigo character varying, _nombre character varying, _fecha_ingreso timestamp without time zone, _fecha_creacion timestamp without time zone, _direccion character varying, _celular character varying, _fijo character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
declare max_days varchar(20) := concat((select param.cantidad_max from development.dm_parametros as param limit 1)::int, ' days');
begin
	if not exists (select * from development.dt_pacientes where dni = _dni) then
    	insert into development.dt_pacientes (dni, codigo, fecha_ingreso, fecha_creacion, nombre, direccion, celular, fijo, estado, grupo, factor_riesgo, paso_encuesta_inicial, flag_activo) 
                                    values(_dni, _codigo, _fecha_ingreso, _fecha_creacion, _nombre, _direccion, _celular, _fijo, 1, 'C', null, false, true);
    end if;
    return true;
end;
$$;


ALTER FUNCTION development.sp_add_patient_excel_01_test(_dni character varying, _codigo character varying, _nombre character varying, _fecha_ingreso timestamp without time zone, _fecha_creacion timestamp without time zone, _direccion character varying, _celular character varying, _fijo character varying) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 381 (class 1255 OID 17581)
-- Name: sp_add_patient_excel_02(character varying, character varying, character varying, timestamp without time zone, timestamp without time zone, integer, character varying, character varying, character varying, date, integer, date, character varying, date, integer, date, character varying, date, integer, date, character varying, character, character varying, character varying, character varying, timestamp without time zone, boolean); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_add_patient_excel_02(_dni character varying, _codigo character varying, _nombre character varying, _fecha_ingreso timestamp without time zone, _fecha_creacion timestamp without time zone, _tipo_documento integer, _direccion character varying, _celular character varying, _fijo character varying, _fecha_prueba_1 date, _resultado_prueba_1 integer, _fecha_resultado_prueba_1 date, _tipo_prueba_1 character varying, _fecha_prueba_2 date, _resultado_prueba_2 integer, _fecha_resultado_prueba_2 date, _tipo_prueba_2 character varying, _fecha_prueba_3 date, _resultado_prueba_3 integer, _fecha_resultado_prueba_3 date, _tipo_prueba_3 character varying, _sexo character, _pais character varying, _provincia character varying, _distrito character varying, _fecha_inicio_sintomas timestamp without time zone, _positivo boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
declare max_days varchar(20) := concat((select param.cantidad_max from development.dm_parametros as param limit 1)::int, ' days');
begin
	if not exists (select * from development.dt_pacientes where dni = _dni) then
    	insert into development.dt_pacientes (
                dni, codigo, tipo_documento, fecha_ingreso, fecha_creacion, nombre, direccion, celular, fijo, estado, grupo, 
                factor_riesgo, paso_encuesta_inicial, flag_activo, sexo, pais, provincia, distrito, fecha_inicio_sintomas,
                fecha_prueba_1, resultado_prueba_1, fecha_resultado_prueba_1, tipo_prueba_1, fecha_prueba_2, resultado_prueba_2, 
                fecha_resultado_prueba_2, tipo_prueba_2, fecha_prueba_3, resultado_prueba_3, fecha_resultado_prueba_3, tipo_prueba_3) 
            values(
                _dni, _codigo, _tipo_documento, _fecha_ingreso, _fecha_creacion, _nombre, _direccion, _celular, _fijo, 1, 'B', 
                null, false, true, _sexo, _pais, _provincia, _distrito, _fecha_inicio_sintomas, 
                _fecha_prueba_1, _resultado_prueba_1, _fecha_resultado_prueba_1, _tipo_prueba_1, _fecha_prueba_2, _resultado_prueba_2, 
                _fecha_resultado_prueba_2, _tipo_prueba_2, _fecha_prueba_3, _resultado_prueba_3, _fecha_resultado_prueba_3, _tipo_prueba_3);
    else
    	if _positivo then
        	update development.dt_pacientes set
                codigo = _codigo,
                fecha_ingreso = _fecha_ingreso,
                tipo_documento = _tipo_documento,
                nombre = _nombre,
                direccion = _direccion,
                celular = _celular,
                fijo = _fijo,
                grupo = 'A',
                sexo = _sexo,
                pais = _pais,
                provincia = _provincia,
                distrito = _distrito,
                fecha_inicio_sintomas = _fecha_inicio_sintomas,
                fecha_prueba_1 = _fecha_prueba_1,
                resultado_prueba_1 = _resultado_prueba_1,
                fecha_resultado_prueba_1 = _fecha_resultado_prueba_1,
                tipo_prueba_1 = _tipo_prueba_1,
                fecha_prueba_2 = _fecha_prueba_2,
                resultado_prueba_2 = _resultado_prueba_2,
                fecha_resultado_prueba_2 = _fecha_resultado_prueba_2,
                tipo_prueba_2 = _tipo_prueba_2,
                fecha_prueba_3 = _fecha_prueba_3,
                resultado_prueba_3 = _resultado_prueba_3,
                fecha_resultado_prueba_3 = _fecha_resultado_prueba_3,
                tipo_prueba_3 = _tipo_prueba_3
            where dni = _dni;
            return true;
       	end if;
    	if exists (select * from development.dt_pacientes where dni = _dni and estado = 4) then
            update development.dt_pacientes set 
                codigo = _codigo,
                fecha_ingreso = _fecha_ingreso,
                fecha_creacion = _fecha_creacion,
                tipo_documento = _tipo_documento,
                nombre = _nombre,
                direccion = _direccion,
                celular = _celular,
                fijo = _fijo,
                estado =  2,
                grupo = 'B',
                sexo = _sexo,
                pais = _pais,
                provincia = _provincia,
                distrito = _distrito,
                fecha_inicio_sintomas = _fecha_inicio_sintomas,
                fecha_prueba_1 = _fecha_prueba_1,
                resultado_prueba_1 = _resultado_prueba_1,
                fecha_resultado_prueba_1 = _fecha_resultado_prueba_1,
                tipo_prueba_1 = _tipo_prueba_1,
                fecha_prueba_2 = _fecha_prueba_2,
                resultado_prueba_2 = _resultado_prueba_2,
                fecha_resultado_prueba_2 = _fecha_resultado_prueba_2,
                tipo_prueba_2 = _tipo_prueba_2,
                fecha_prueba_3 = _fecha_prueba_3,
                resultado_prueba_3 = _resultado_prueba_3,
                fecha_resultado_prueba_3 = _fecha_resultado_prueba_3,
                tipo_prueba_3 = _tipo_prueba_3
            where dni = _dni;
        else
        	update development.dt_pacientes set 
                codigo = _codigo,
                fecha_ingreso = _fecha_ingreso,
                tipo_documento = _tipo_documento,
                nombre = _nombre,
                direccion = _direccion,
                celular = _celular,
                fijo = _fijo,
                grupo = 'B',
                sexo = _sexo,
                pais = _pais,
                provincia = _provincia,
                distrito = _distrito,
                fecha_inicio_sintomas = _fecha_inicio_sintomas,
                fecha_prueba_1 = _fecha_prueba_1,
                resultado_prueba_1 = _resultado_prueba_1,
                fecha_resultado_prueba_1 = _fecha_resultado_prueba_1,
                tipo_prueba_1 = _tipo_prueba_1,
                fecha_prueba_2 = _fecha_prueba_2,
                resultado_prueba_2 = _resultado_prueba_2,
                fecha_resultado_prueba_2 = _fecha_resultado_prueba_2,
                tipo_prueba_2 = _tipo_prueba_2,
                fecha_prueba_3 = _fecha_prueba_3,
                resultado_prueba_3 = _resultado_prueba_3,
                fecha_resultado_prueba_3 = _fecha_resultado_prueba_3,
                tipo_prueba_3 = _tipo_prueba_3
            where dni = _dni;
        end if;
        
        if exists (select * from development.dt_pacientes where dni = _dni and grupo = 'B' and paso_encuesta_inicial = true and estado = 1) then
        	update development.dt_pacientes set estado = 2 where dni = _dni;
        end if;
    end if;
    return true;
end;
$$;


ALTER FUNCTION development.sp_add_patient_excel_02(_dni character varying, _codigo character varying, _nombre character varying, _fecha_ingreso timestamp without time zone, _fecha_creacion timestamp without time zone, _tipo_documento integer, _direccion character varying, _celular character varying, _fijo character varying, _fecha_prueba_1 date, _resultado_prueba_1 integer, _fecha_resultado_prueba_1 date, _tipo_prueba_1 character varying, _fecha_prueba_2 date, _resultado_prueba_2 integer, _fecha_resultado_prueba_2 date, _tipo_prueba_2 character varying, _fecha_prueba_3 date, _resultado_prueba_3 integer, _fecha_resultado_prueba_3 date, _tipo_prueba_3 character varying, _sexo character, _pais character varying, _provincia character varying, _distrito character varying, _fecha_inicio_sintomas timestamp without time zone, _positivo boolean) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 382 (class 1255 OID 17582)
-- Name: sp_add_patient_excel_02_test(character varying, character varying, character varying, timestamp without time zone, timestamp without time zone, character varying, character varying, character varying, date, integer, date, character varying, integer, date, character varying, integer, date, character varying, character, character varying, character varying, character varying, timestamp without time zone, boolean); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_add_patient_excel_02_test(_dni character varying, _codigo character varying, _nombre character varying, _fecha_ingreso timestamp without time zone, _fecha_creacion timestamp without time zone, _direccion character varying, _celular character varying, _fijo character varying, _fecha_prueba date, _resultado_prueba_1 integer, _fecha_resultado_prueba_1 date, _tipo_prueba_1 character varying, _resultado_prueba_2 integer, _fecha_resultado_prueba_2 date, _tipo_prueba_2 character varying, _resultado_prueba_3 integer, _fecha_resultado_prueba_3 date, _tipo_prueba_3 character varying, _sexo character, _pais character varying, _provincia character varying, _distrito character varying, _fecha_inicio_sintomas timestamp without time zone, _positivo boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
declare max_days varchar(20) := concat((select param.cantidad_max from development.dm_parametros as param limit 1)::int, ' days');
begin
	if not exists (select * from development.dt_pacientes where dni = _dni) then
    
    	if _positivo then
        	insert into development.dt_pacientes (
                    dni, codigo, fecha_ingreso, fecha_creacion, nombre, direccion, celular, fijo, estado, grupo, 
                    factor_riesgo, paso_encuesta_inicial, flag_activo, sexo, pais, provincia, distrito, fecha_inicio_sintomas,
                    resultado_prueba_1, fecha_resultado_prueba_1, tipo_prueba_1, resultado_prueba_2, 
                    fecha_resultado_prueba_2, tipo_prueba_2, resultado_prueba_3, fecha_resultado_prueba_3, tipo_prueba_3, fecha_prueba) 
                values(
                    _dni, _codigo, _fecha_ingreso, _fecha_creacion, _nombre, _direccion, _celular, _fijo, 1, 'A', 
                    null, false, true, _sexo, _pais, _provincia, _distrito, _fecha_inicio_sintomas, 
                    _resultado_prueba_1, _fecha_resultado_prueba_1, _tipo_prueba_1, _resultado_prueba_2, 
                    _fecha_resultado_prueba_2, _tipo_prueba_2, _resultado_prueba_3, _fecha_resultado_prueba_3, _tipo_prueba_3, _fecha_prueba);
        else
            insert into development.dt_pacientes (
                    dni, codigo, fecha_ingreso, fecha_creacion, nombre, direccion, celular, fijo, estado, grupo, 
                    factor_riesgo, paso_encuesta_inicial, flag_activo, sexo, pais, provincia, distrito, fecha_inicio_sintomas,
                    resultado_prueba_1, fecha_resultado_prueba_1, tipo_prueba_1, resultado_prueba_2, 
                    fecha_resultado_prueba_2, tipo_prueba_2, resultado_prueba_3, fecha_resultado_prueba_3, tipo_prueba_3, fecha_prueba) 
                values(
                    _dni, _codigo, _fecha_ingreso, _fecha_creacion, _nombre, _direccion, _celular, _fijo, 1, 'B', 
                    null, false, true, _sexo, _pais, _provincia, _distrito, _fecha_inicio_sintomas, 
                    _resultado_prueba_1, _fecha_resultado_prueba_1, _tipo_prueba_1, _resultado_prueba_2, 
                    _fecha_resultado_prueba_2, _tipo_prueba_2, _resultado_prueba_3, _fecha_resultado_prueba_3, _tipo_prueba_3, _fecha_prueba);
         end if;
    else
    	if _positivo then
        	update development.dt_pacientes set
                codigo = _codigo,
                fecha_ingreso = _fecha_ingreso,
                nombre = _nombre,
                direccion = _direccion,
                celular = _celular,
                fijo = _fijo,
                grupo = 'A',
                sexo = _sexo,
                pais = _pais,
                provincia = _provincia,
                distrito = _distrito,
                fecha_inicio_sintomas = _fecha_inicio_sintomas,
                resultado_prueba_1 = _resultado_prueba_1,
                fecha_resultado_prueba_1 = _fecha_resultado_prueba_1,
                tipo_prueba_1 = _tipo_prueba_1,
                resultado_prueba_2 = _resultado_prueba_2,
                fecha_resultado_prueba_2 = _fecha_resultado_prueba_2,
                tipo_prueba_2 = _tipo_prueba_2,
                resultado_prueba_3 = _resultado_prueba_3,
                fecha_resultado_prueba_3 = _fecha_resultado_prueba_3,
                tipo_prueba_3 = _tipo_prueba_3,
                fecha_prueba = _fecha_prueba
            where dni = _dni;
            return true;
       	end if;
    	if exists (select * from development.dt_pacientes where dni = _dni and estado = 4) then
            update development.dt_pacientes set 
                codigo = _codigo,
                fecha_ingreso = _fecha_ingreso,
                fecha_creacion = _fecha_creacion,
                nombre = _nombre,
                direccion = _direccion,
                celular = _celular,
                fijo = _fijo,
                estado =  2,
                grupo = 'B',
                sexo = _sexo,
                pais = _pais,
                provincia = _provincia,
                distrito = _distrito,
                fecha_inicio_sintomas = _fecha_inicio_sintomas,
                resultado_prueba_1 = _resultado_prueba_1,
                fecha_resultado_prueba_1 = _fecha_resultado_prueba_1,
                tipo_prueba_1 = _tipo_prueba_1,
                resultado_prueba_2 = _resultado_prueba_2,
                fecha_resultado_prueba_2 = _fecha_resultado_prueba_2,
                tipo_prueba_2 = _tipo_prueba_2,
                resultado_prueba_3 = _resultado_prueba_3,
                fecha_resultado_prueba_3 = _fecha_resultado_prueba_3,
                tipo_prueba_3 = _tipo_prueba_3,
                fecha_prueba = _fecha_prueba
            where dni = _dni;
        else
        	update development.dt_pacientes set 
                codigo = _codigo,
                fecha_ingreso = _fecha_ingreso,
                nombre = _nombre,
                direccion = _direccion,
                celular = _celular,
                fijo = _fijo,
                grupo = 'B',
                sexo = _sexo,
                pais = _pais,
                provincia = _provincia,
                distrito = _distrito,
                fecha_inicio_sintomas = _fecha_inicio_sintomas,
                resultado_prueba_1 = _resultado_prueba_1,
                fecha_resultado_prueba_1 = _fecha_resultado_prueba_1,
                tipo_prueba_1 = _tipo_prueba_1,
                resultado_prueba_2 = _resultado_prueba_2,
                fecha_resultado_prueba_2 = _fecha_resultado_prueba_2,
                tipo_prueba_2 = _tipo_prueba_2,
                resultado_prueba_3 = _resultado_prueba_3,
                fecha_resultado_prueba_3 = _fecha_resultado_prueba_3,
                tipo_prueba_3 = _tipo_prueba_3,
                fecha_prueba = _fecha_prueba
            where dni = _dni;
        end if;
        
        if exists (select * from development.dt_pacientes where dni = _dni and grupo = 'B' and paso_encuesta_inicial = true and estado = 1) then
        	update development.dt_pacientes set estado = 2 where dni = _dni;
        end if;
    end if;
    return true;
end;
$$;


ALTER FUNCTION development.sp_add_patient_excel_02_test(_dni character varying, _codigo character varying, _nombre character varying, _fecha_ingreso timestamp without time zone, _fecha_creacion timestamp without time zone, _direccion character varying, _celular character varying, _fijo character varying, _fecha_prueba date, _resultado_prueba_1 integer, _fecha_resultado_prueba_1 date, _tipo_prueba_1 character varying, _resultado_prueba_2 integer, _fecha_resultado_prueba_2 date, _tipo_prueba_2 character varying, _resultado_prueba_3 integer, _fecha_resultado_prueba_3 date, _tipo_prueba_3 character varying, _sexo character, _pais character varying, _provincia character varying, _distrito character varying, _fecha_inicio_sintomas timestamp without time zone, _positivo boolean) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 402 (class 1255 OID 53603)
-- Name: sp_add_patient_tamizaje(character varying, character varying, character varying, timestamp without time zone, timestamp without time zone, character varying, character varying, character varying, date, integer, date, character varying, integer, date, character varying, integer, date, character varying, character, character varying, character varying, character varying, timestamp without time zone, boolean, integer); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_add_patient_tamizaje(_dni character varying, _codigo character varying, _nombre character varying, _fecha_ingreso timestamp without time zone, _fecha_creacion timestamp without time zone, _direccion character varying, _celular character varying, _fijo character varying, _fecha_prueba date, _resultado_prueba_1 integer, _fecha_resultado_prueba_1 date, _tipo_prueba_1 character varying, _resultado_prueba_2 integer, _fecha_resultado_prueba_2 date, _tipo_prueba_2 character varying, _resultado_prueba_3 integer, _fecha_resultado_prueba_3 date, _tipo_prueba_3 character varying, _sexo character, _pais character varying, _provincia character varying, _distrito character varying, _fecha_inicio_sintomas timestamp without time zone, _positivo boolean, _id_hospital integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
declare max_days varchar(20) := concat((select param.cantidad_max from development.dm_parametros as param where param.id = 1 limit 1)::int, ' days');
begin
	if not exists (select * from development.dt_pacientes where dni = _dni) then
    	if _positivo then
        	insert into development.dt_pacientes (
                    dni, codigo, fecha_ingreso, fecha_creacion, nombre, direccion, celular, fijo, estado, grupo, 
                    factor_riesgo, paso_encuesta_inicial, flag_activo, sexo, pais, provincia, distrito, fecha_inicio_sintomas,
                    resultado_prueba_1, fecha_resultado_prueba_1, tipo_prueba_1, resultado_prueba_2, 
                    fecha_resultado_prueba_2, tipo_prueba_2, resultado_prueba_3, fecha_resultado_prueba_3, tipo_prueba_3, fecha_prueba, id_hospital) 
                values(
                    _dni, _codigo, _fecha_ingreso, _fecha_creacion, _nombre, _direccion, _celular, _fijo, 1, 'A', 
                    null, false, true, _sexo, _pais, _provincia, _distrito, _fecha_inicio_sintomas, 
                    _resultado_prueba_1, _fecha_resultado_prueba_1, _tipo_prueba_1, _resultado_prueba_2, 
                    _fecha_resultado_prueba_2, _tipo_prueba_2, _resultado_prueba_3, _fecha_resultado_prueba_3, _tipo_prueba_3, _fecha_prueba, _id_hospital);
        else
            insert into development.dt_pacientes (
                    dni, codigo, fecha_ingreso, fecha_creacion, nombre, direccion, celular, fijo, estado, grupo, 
                    factor_riesgo, paso_encuesta_inicial, flag_activo, sexo, pais, provincia, distrito, fecha_inicio_sintomas,
                    resultado_prueba_1, fecha_resultado_prueba_1, tipo_prueba_1, resultado_prueba_2, 
                    fecha_resultado_prueba_2, tipo_prueba_2, resultado_prueba_3, fecha_resultado_prueba_3, tipo_prueba_3, fecha_prueba, id_hospital) 
                values(
                    _dni, _codigo, _fecha_ingreso, _fecha_creacion, _nombre, _direccion, _celular, _fijo, 1, 'B', 
                    null, false, true, _sexo, _pais, _provincia, _distrito, _fecha_inicio_sintomas, 
                    _resultado_prueba_1, _fecha_resultado_prueba_1, _tipo_prueba_1, _resultado_prueba_2, 
                    _fecha_resultado_prueba_2, _tipo_prueba_2, _resultado_prueba_3, _fecha_resultado_prueba_3, _tipo_prueba_3, _fecha_prueba, _id_hospital);
         end if;
    else
    	if _positivo then
        	update development.dt_pacientes set
                codigo = _codigo,
                fecha_ingreso = _fecha_ingreso,
                nombre = _nombre,
                direccion = _direccion,
                celular = _celular,
                fijo = _fijo,
                grupo = 'A',
                sexo = _sexo,
                pais = _pais,
                provincia = _provincia,
                distrito = _distrito,
                fecha_inicio_sintomas = _fecha_inicio_sintomas,
                resultado_prueba_1 = _resultado_prueba_1,
                fecha_resultado_prueba_1 = _fecha_resultado_prueba_1,
                tipo_prueba_1 = _tipo_prueba_1,
                resultado_prueba_2 = _resultado_prueba_2,
                fecha_resultado_prueba_2 = _fecha_resultado_prueba_2,
                tipo_prueba_2 = _tipo_prueba_2,
                resultado_prueba_3 = _resultado_prueba_3,
                fecha_resultado_prueba_3 = _fecha_resultado_prueba_3,
                tipo_prueba_3 = _tipo_prueba_3,
                fecha_prueba = _fecha_prueba,
				id_hospital = _id_hospital
            where dni = _dni;
            return true;
       	end if;
    	if exists (select * from development.dt_pacientes where dni = _dni and estado = 4) then
            update development.dt_pacientes set 
                codigo = _codigo,
                fecha_ingreso = _fecha_ingreso,
                fecha_creacion = _fecha_creacion,
                nombre = _nombre,
                direccion = _direccion,
                celular = _celular,
                fijo = _fijo,
                estado =  2,
                grupo = 'B',
                sexo = _sexo,
                pais = _pais,
                provincia = _provincia,
                distrito = _distrito,
                fecha_inicio_sintomas = _fecha_inicio_sintomas,
                resultado_prueba_1 = _resultado_prueba_1,
                fecha_resultado_prueba_1 = _fecha_resultado_prueba_1,
                tipo_prueba_1 = _tipo_prueba_1,
                resultado_prueba_2 = _resultado_prueba_2,
                fecha_resultado_prueba_2 = _fecha_resultado_prueba_2,
                tipo_prueba_2 = _tipo_prueba_2,
                resultado_prueba_3 = _resultado_prueba_3,
                fecha_resultado_prueba_3 = _fecha_resultado_prueba_3,
                tipo_prueba_3 = _tipo_prueba_3,
                fecha_prueba = _fecha_prueba,
				id_hospital = _id_hospital
            where dni = _dni;
        else
        	update development.dt_pacientes set 
                codigo = _codigo,
                fecha_ingreso = _fecha_ingreso,
                nombre = _nombre,
                direccion = _direccion,
                celular = _celular,
                fijo = _fijo,
                grupo = 'B',
                sexo = _sexo,
                pais = _pais,
                provincia = _provincia,
                distrito = _distrito,
                fecha_inicio_sintomas = _fecha_inicio_sintomas,
                resultado_prueba_1 = _resultado_prueba_1,
                fecha_resultado_prueba_1 = _fecha_resultado_prueba_1,
                tipo_prueba_1 = _tipo_prueba_1,
                resultado_prueba_2 = _resultado_prueba_2,
                fecha_resultado_prueba_2 = _fecha_resultado_prueba_2,
                tipo_prueba_2 = _tipo_prueba_2,
                resultado_prueba_3 = _resultado_prueba_3,
                fecha_resultado_prueba_3 = _fecha_resultado_prueba_3,
                tipo_prueba_3 = _tipo_prueba_3,
                fecha_prueba = _fecha_prueba,
				id_hospital = _id_hospital
            where dni = _dni;
        end if;
        
        if exists (select * from development.dt_pacientes where dni = _dni and grupo = 'B' and paso_encuesta_inicial = true and estado = 1) then
        	update development.dt_pacientes set estado = 2 where dni = _dni;
        end if;
    end if;
    return true;
end;
$$;


ALTER FUNCTION development.sp_add_patient_tamizaje(_dni character varying, _codigo character varying, _nombre character varying, _fecha_ingreso timestamp without time zone, _fecha_creacion timestamp without time zone, _direccion character varying, _celular character varying, _fijo character varying, _fecha_prueba date, _resultado_prueba_1 integer, _fecha_resultado_prueba_1 date, _tipo_prueba_1 character varying, _resultado_prueba_2 integer, _fecha_resultado_prueba_2 date, _tipo_prueba_2 character varying, _resultado_prueba_3 integer, _fecha_resultado_prueba_3 date, _tipo_prueba_3 character varying, _sexo character, _pais character varying, _provincia character varying, _distrito character varying, _fecha_inicio_sintomas timestamp without time zone, _positivo boolean, _id_hospital integer) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 390 (class 1255 OID 17687)
-- Name: sp_add_scheduled_case(character varying, character varying, date); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_add_scheduled_case(_dni_medico character varying, _dni_paciente character varying, _fecha date) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN

    IF EXISTS(select * from development.dt_casos_programados as cp 
        where cp.dni_paciente = _dni_paciente and cp.fecha = _fecha and cp.estado = 1) THEN
        
        IF EXISTS(select * from development.dt_casos_programados as cp 
        where not cp.dni_medico = _dni_medico and cp.dni_paciente = _dni_paciente and cp.fecha = _fecha and cp.estado = 1) THEN
            
            RETURN FALSE;

        END IF;

    ELSE
        
        IF EXISTS(select * from development.dt_casos_programados as cp 
        where cp.dni_medico = _dni_medico and cp.dni_paciente = _dni_paciente and cp.fecha = _fecha and cp.estado = 0) THEN
            
            UPDATE development.dt_casos_programados SET estado = 1 
            WHERE dni_medico = _dni_medico 
            and dni_paciente = _dni_paciente 
            and fecha = _fecha;

        ELSE

            INSERT INTO development.dt_casos_programados(dni_paciente, dni_medico, fecha) VALUES (_dni_paciente, _dni_medico, _fecha);
        
        END IF;

    END IF;
    RETURN true;
END;
$$;


ALTER FUNCTION development.sp_add_scheduled_case(_dni_medico character varying, _dni_paciente character varying, _fecha date) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 370 (class 1255 OID 18381)
-- Name: sp_get_nota_patient(character varying); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_get_nota_patient(_dni character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
begin
    return (select nota_grupo from development.dt_pacientes where dni = _dni limit 1)::varchar(100);
end;
$$;


ALTER FUNCTION development.sp_get_nota_patient(_dni character varying) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 375 (class 1255 OID 17583)
-- Name: sp_insert_test(character varying, timestamp without time zone, character varying, timestamp without time zone, character varying); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_insert_test(_dni character varying, _fecha_prueba timestamp without time zone, _resultado character varying, _fecha_resultado_prueba timestamp without time zone, _tipo character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare _id int;
begin
	if not exists (select * from development.dt_pruebas where dni_paciente = _dni and fecha_prueba = _fecha_prueba) then
    	insert into development.dt_pruebas (dni_paciente, fecha_prueba, resultado, fecha_resultado_prueba, tipo) 
                         values(_dni, _fecha_prueba, _resultado, _fecha_resultado_prueba, _tipo) returning id into _id;
        return _id;
    else
    	update development.dt_pruebas set
            resultado = _resultado, 
            fecha_resultado_prueba = _fecha_resultado_prueba,
            tipo = _tipo
            where dni_paciente = _dni and fecha_prueba = _fecha_prueba;
        return (select id from development.dt_pruebas where dni_paciente = _dni and fecha_prueba = _fecha_prueba)::int;
    end if;
end;
$$;


ALTER FUNCTION development.sp_insert_test(_dni character varying, _fecha_prueba timestamp without time zone, _resultado character varying, _fecha_resultado_prueba timestamp without time zone, _tipo character varying) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 314 (class 1255 OID 17584)
-- Name: sp_list_patients_survey01(date); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_list_patients_survey01(_date date) RETURNS TABLE(codigo character varying, dni character varying, nombre character varying, celular character varying)
    LANGUAGE plpgsql
    AS $$declare max_days varchar(20) := concat((select param.cantidad_max from development.dm_parametros as param limit 1)::int, ' days');
begin
	return query select p.codigo, p.dni, p.nombre, p.celular from development.dt_pacientes as p
			where p.paso_encuesta_inicial = false and p.estado = 1 and 
			(p.fecha_creacion + max_days::interval) > _date and 
			p.fecha_creacion < _date; 
			--and p.flag_activo = true;
end;
$$;


ALTER FUNCTION development.sp_list_patients_survey01(_date date) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 394 (class 1255 OID 17959)
-- Name: sp_list_patients_survey02(date); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_list_patients_survey02(_date date) RETURNS TABLE(codigo character varying, dni character varying, nombre character varying, celular character varying)
    LANGUAGE plpgsql
    AS $$
declare max_days varchar(20) := concat((select param.cantidad_max from development.dm_parametros as param limit 1)::int, ' days');
begin
	return query select p.codigo, p.dni, p.nombre, p.celular from development.dt_pacientes as p
        where p.grupo = 'C'
        and p.is_doctor = false
        and p.factor_riesgo = false
		and p.estado = 1
        and p.paso_encuesta_inicial = true
		and (p.fecha_creacion + max_days::interval) >= _date and 
		p.fecha_creacion < _date; 
		--and p.flag_activo = true;
end;
$$;


ALTER FUNCTION development.sp_list_patients_survey02(_date date) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 395 (class 1255 OID 17961)
-- Name: sp_list_patients_survey03(date); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_list_patients_survey03(_date date) RETURNS TABLE(codigo character varying, dni character varying, nombre character varying, celular character varying)
    LANGUAGE plpgsql
    AS $$
declare max_days varchar(20) := concat((select param.cantidad_max + 1 from development.dm_parametros as param limit 1)::int, ' days');
begin
	return query select p.codigo, p.dni, p.nombre, p.celular from development.dt_pacientes as p
        where p.grupo = 'C'
        and p.is_doctor = false
        and p.factor_riesgo = false
		and p.estado = 1
        and p.paso_encuesta_inicial = true
		and (p.fecha_creacion + max_days::interval) = _date;
end;
$$;


ALTER FUNCTION development.sp_list_patients_survey03(_date date) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 311 (class 1255 OID 16753)
-- Name: sp_patient_change_age(character varying, integer); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_patient_change_age(_patient_id character varying, _age integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
	declare rows_affected integer;
	begin
	
		UPDATE development.dt_pacientes SET edad = _age, paso_encuesta_inicial = true WHERE dni = _patient_id;
		GET DIAGNOSTICS rows_affected = ROW_COUNT;
		return rows_affected;
	end;

$$;


ALTER FUNCTION development.sp_patient_change_age(_patient_id character varying, _age integer) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 387 (class 1255 OID 17637)
-- Name: sp_patient_change_risk_factor(character varying, boolean); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_patient_change_risk_factor(_patient_id character varying, _is_risk_factor boolean) RETURNS integer
    LANGUAGE plpgsql
    AS $$declare rows_affected integer;
    begin
    	if exists(select * from development.dt_pacientes where dni = _patient_id and grupo in ('A')) then
        	UPDATE development.dt_pacientes SET factor_riesgo = _is_risk_factor, estado = 2 WHERE dni = _patient_id;
            GET DIAGNOSTICS rows_affected = ROW_COUNT;
            return rows_affected;
        else
        	if _is_risk_factor then
        	    UPDATE development.dt_pacientes SET factor_riesgo = _is_risk_factor, estado = 2 WHERE dni = _patient_id;
                GET DIAGNOSTICS rows_affected = ROW_COUNT;
                return rows_affected;
            else
                 UPDATE development.dt_pacientes SET factor_riesgo = _is_risk_factor WHERE dni = _patient_id;
                	GET DIAGNOSTICS rows_affected = ROW_COUNT;
                	return rows_affected;
            end if;
        end if;
    end;$$;


ALTER FUNCTION development.sp_patient_change_risk_factor(_patient_id character varying, _is_risk_factor boolean) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 316 (class 1255 OID 16644)
-- Name: sp_patient_change_status(character varying, integer); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_patient_change_status(_patient_id character varying, _patient_status_id integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
	declare rows_affected integer;
	begin
	
		UPDATE development.dt_pacientes SET estado = _patient_status_id WHERE dni = _patient_id;
		GET DIAGNOSTICS rows_affected = ROW_COUNT;
		return rows_affected;
	end;

$$;


ALTER FUNCTION development.sp_patient_change_status(_patient_id character varying, _patient_status_id integer) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 322 (class 1255 OID 17640)
-- Name: sp_patient_is_doctor(character varying); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_patient_is_doctor(_dni_patient character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
begin
    update development.dt_pacientes set is_doctor = true where dni = _dni_patient;
    return true;
end;
$$;


ALTER FUNCTION development.sp_patient_is_doctor(_dni_patient character varying) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 391 (class 1255 OID 17688)
-- Name: sp_remove_scheduled_case(character varying, character varying, date); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_remove_scheduled_case(_dni_medico character varying, _dni_paciente character varying, _fecha date) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN

    IF EXISTS(select * from development.dt_casos_programados as cp 
        where cp.dni_paciente = _dni_paciente and cp.fecha = _fecha and cp.estado = 1) THEN
        
        IF EXISTS(select * from development.dt_casos_programados as cp 
        where cp.dni_medico = _dni_medico and cp.dni_paciente = _dni_paciente and cp.fecha = _fecha and cp.estado = 1) THEN
            
            UPDATE development.dt_casos_programados SET estado = 0
            WHERE dni_medico = _dni_medico 
            and dni_paciente = _dni_paciente 
            and fecha = _fecha;
        
        END IF;
    END IF;

    RETURN true;
END;
$$;


ALTER FUNCTION development.sp_remove_scheduled_case(_dni_medico character varying, _dni_paciente character varying, _fecha date) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 317 (class 1255 OID 16645)
-- Name: sp_save_answer(character varying, character varying, character varying, timestamp without time zone, timestamp without time zone); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_save_answer(_patient_id character varying, _question_id character varying, _answer_value character varying, _asked_at timestamp without time zone, _answered_at timestamp without time zone) RETURNS integer
    LANGUAGE plpgsql
    AS $$
	declare rows_affected integer;
	begin
		INSERT INTO development.dt_respuestas(dni_paciente,id_pregunta,respuesta_string,fecha_pregunta,fecha_respuesta) VALUES(_patient_id,_question_id,_answer_value,_asked_at,_answered_at);
		GET DIAGNOSTICS rows_affected = ROW_COUNT;
		return rows_affected;
	end;

$$;


ALTER FUNCTION development.sp_save_answer(_patient_id character varying, _question_id character varying, _answer_value character varying, _asked_at timestamp without time zone, _answered_at timestamp without time zone) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 315 (class 1255 OID 17586)
-- Name: sp_take_case(character varying, integer); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_take_case(_dni_medico character varying, _id_case integer) RETURNS TABLE(pasa boolean, message character varying)
    LANGUAGE plpgsql
    AS $$
begin
	if exists (select * from development.dt_casos_dia  as c where c.estado_caso = 1 and c.id = _id_case) then
    	return query select true, 'Caso aun no tomado.'::varchar(100);
    else
    	if exists (select * from development.dt_casos_dia  as c where c.estado_caso in (3, 4) and c.id = _id_case) then
            return query select false, 'El caso ya fue cerrado.'::varchar(100);
        else
        	if exists (select * from development.dt_casos_dia  as c where c.estado_caso = 2 and c.id = _id_case and c.dni_medico = _dni_medico) then
                return query select true, 'Si es un caso tomado por el medico.'::varchar(100);
            else
            	return query select false, 'El caso ha sido tomado por otro médico.'::varchar(100);
            end if;
        end if;
    end if;
end;
$$;


ALTER FUNCTION development.sp_take_case(_dni_medico character varying, _id_case integer) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 383 (class 1255 OID 17587)
-- Name: sp_terminate_case(character varying, integer); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_terminate_case(_dni_medico character varying, _id_case integer) RETURNS TABLE(pasa boolean, message character varying)
    LANGUAGE plpgsql
    AS $$
begin
	if exists (select * from development.dt_casos_dia  as c where c.estado_caso  = 1 and c.id = _id_case) then
    	return query select false, 'Caso aun no tomado.'::varchar(100);
    else
    	if exists (select * from development.dt_casos_dia  as c where c.estado_caso in (3, 4) and c.id = _id_case) then
            return query select false, 'El caso ya fue cerrado.'::varchar(100);
        else
        	if exists (select * from development.dt_casos_dia  as c where c.estado_caso = 2 and c.id = _id_case and c.dni_medico = _dni_medico) then
                return query select true, 'Si es un caso tomado por el medico.'::varchar(100);
            else
            	return query select false, 'El caso esta tomado por otro medico.'::varchar(100);
            end if;
        end if;
    end if;
end;
$$;


ALTER FUNCTION development.sp_terminate_case(_dni_medico character varying, _id_case integer) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 384 (class 1255 OID 17588)
-- Name: sp_update_case(integer, character, boolean, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, character varying, timestamp without time zone); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_update_case(_id_caso integer, _grupo character, _factor boolean, _bandeja integer, _resultado_1 integer, _resultado_2 integer, _resultado_3 integer, _fiebre integer, _respirar integer, _pecho integer, _alteracion integer, _coloracion integer, _tos integer, _garganta integer, _nasal integer, _malestar integer, _cefalea integer, _nauses integer, _diarea integer, _comentario character varying, _fecha_inicio_sintomas timestamp without time zone) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
declare _dni_paciente varchar(16) := (select dni_paciente from development.dt_casos_dia where id = _id_caso limit 1)::varchar(16);
begin
    update development.dt_pacientes set 
        grupo = _grupo,
        estado = _bandeja,
        factor_riesgo = _factor,
        resultado_prueba_1 = _resultado_1,
        resultado_prueba_2 = _resultado_2,
        resultado_prueba_3 = _resultado_3,
        fecha_inicio_sintomas = _fecha_inicio_sintomas
        where dni = _dni_paciente;

    update development.dt_casos_dia set
        fiebre = _fiebre,
        dificultad_respitar = _respirar,
        dolor_pecho = _pecho,
        alteracion_sensorio = _alteracion,
        colaboracion_azul_labios = _coloracion,
        tos = _tos,
        dolor_garganta = _garganta,
        congestion_nasal = _nasal,
        malestar_general = _malestar,
        cefalea = _cefalea,
        nauseas = _nauses,
        diarrea = _diarea,
        comentario = _comentario
    	where id = _id_caso;
    return true;

end;
$$;


ALTER FUNCTION development.sp_update_case(_id_caso integer, _grupo character, _factor boolean, _bandeja integer, _resultado_1 integer, _resultado_2 integer, _resultado_3 integer, _fiebre integer, _respirar integer, _pecho integer, _alteracion integer, _coloracion integer, _tos integer, _garganta integer, _nasal integer, _malestar integer, _cefalea integer, _nauses integer, _diarea integer, _comentario character varying, _fecha_inicio_sintomas timestamp without time zone) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 396 (class 1255 OID 18099)
-- Name: sp_update_case(integer, character, boolean, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer, character varying, timestamp without time zone, character varying, integer); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_update_case(_id_caso integer, _grupo character, _factor boolean, _bandeja integer, _resultado_1 integer, _resultado_2 integer, _resultado_3 integer, _fiebre integer, _respirar integer, _pecho integer, _alteracion integer, _coloracion integer, _tos integer, _garganta integer, _nasal integer, _malestar integer, _cefalea integer, _nauses integer, _diarea integer, _comentario character varying, _fecha_inicio_sintomas timestamp without time zone, _nota_grupo character varying, _condicion_egreso integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
declare _dni_paciente varchar(16) := (select dni_paciente from development.dt_casos_dia where id = _id_caso limit 1)::varchar(16);
begin
    update development.dt_pacientes set 
        grupo = _grupo,
        estado = _bandeja,
        factor_riesgo = _factor,
        resultado_prueba_1 = _resultado_1,
        resultado_prueba_2 = _resultado_2,
        resultado_prueba_3 = _resultado_3,
        fecha_inicio_sintomas = _fecha_inicio_sintomas,
		condicion_egreso = _condicion_egreso,
		nota_grupo =_nota_grupo
        where dni = _dni_paciente;

    update development.dt_casos_dia set
        fiebre = _fiebre,
        dificultad_respitar = _respirar,
        dolor_pecho = _pecho,
        alteracion_sensorio = _alteracion,
        colaboracion_azul_labios = _coloracion,
        tos = _tos,
        dolor_garganta = _garganta,
        congestion_nasal = _nasal,
        malestar_general = _malestar,
        cefalea = _cefalea,
        nauseas = _nauses,
        diarrea = _diarea,
        comentario = _comentario
    	where id = _id_caso;
    return true;

end;
$$;


ALTER FUNCTION development.sp_update_case(_id_caso integer, _grupo character, _factor boolean, _bandeja integer, _resultado_1 integer, _resultado_2 integer, _resultado_3 integer, _fiebre integer, _respirar integer, _pecho integer, _alteracion integer, _coloracion integer, _tos integer, _garganta integer, _nasal integer, _malestar integer, _cefalea integer, _nauses integer, _diarea integer, _comentario character varying, _fecha_inicio_sintomas timestamp without time zone, _nota_grupo character varying, _condicion_egreso integer) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 386 (class 1255 OID 18383)
-- Name: sp_update_nota_patient(character varying, character varying); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_update_nota_patient(_dni character varying, _note character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
begin
    update development.dt_pacientes set nota_grupo = _note where dni = _dni;
    return true;
end;
$$;


ALTER FUNCTION development.sp_update_nota_patient(_dni character varying, _note character varying) OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 403 (class 1255 OID 17638)
-- Name: sp_validate_create_case(character varying, date); Type: FUNCTION; Schema: development; Owner: ibm-cloud-base-user
--

CREATE FUNCTION development.sp_validate_create_case(_patient_id character varying, _date date) RETURNS integer
    LANGUAGE plpgsql
    AS $$declare rows_affected integer;
	begin
    	if not exists(select * from development.dt_casos_dia where fecha_caso = _date and dni_paciente = _patient_id) then
            if exists (select * from development.dt_pacientes where dni = _patient_id and grupo in ('A')) or 
            	exists(select * from development.dt_pacientes where dni = _patient_id and grupo in ('B', 'C') and factor_riesgo = true) THEN
                    INSERT INTO development.dt_casos_dia(dni_paciente,estado_caso,fiebre,dificultad_respitar,dolor_pecho,
                    alteracion_sensorio,colaboracion_azul_labios,tos,dolor_garganta,congestion_nasal,malestar_general,cefalea,
                    nauseas,diarrea,comentario,fecha_caso)
                    SELECT _patient_id, 1, 0,0,0,0,0,0,0,0,0,0,0,0,'', _date;
            END IF;
        end if;
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        return rows_affected;
	end;
$$;


ALTER FUNCTION development.sp_validate_create_case(_patient_id character varying, _date date) OWNER TO "ibm-cloud-base-user";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 255 (class 1259 OID 53552)
-- Name: dm_administradores; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dm_administradores (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    id_hospital integer
);


ALTER TABLE development.dm_administradores OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 254 (class 1259 OID 53550)
-- Name: dm_administradores_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dm_administradores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dm_administradores_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3662 (class 0 OID 0)
-- Dependencies: 254
-- Name: dm_administradores_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dm_administradores_id_seq OWNED BY development.dm_administradores.id;


--
-- TOC entry 207 (class 1259 OID 16482)
-- Name: dm_estados_casos; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dm_estados_casos (
    id integer NOT NULL,
    descripcion character varying(50) NOT NULL,
    flag boolean DEFAULT true
);


ALTER TABLE development.dm_estados_casos OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 206 (class 1259 OID 16480)
-- Name: dm_estados_casos_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dm_estados_casos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dm_estados_casos_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3663 (class 0 OID 0)
-- Dependencies: 206
-- Name: dm_estados_casos_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dm_estados_casos_id_seq OWNED BY development.dm_estados_casos.id;


--
-- TOC entry 209 (class 1259 OID 16491)
-- Name: dm_estados_pacientes; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dm_estados_pacientes (
    id integer NOT NULL,
    descripcion character varying(50) NOT NULL,
    flag boolean DEFAULT true
);


ALTER TABLE development.dm_estados_pacientes OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 208 (class 1259 OID 16489)
-- Name: dm_estados_pacientes_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dm_estados_pacientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dm_estados_pacientes_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3664 (class 0 OID 0)
-- Dependencies: 208
-- Name: dm_estados_pacientes_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dm_estados_pacientes_id_seq OWNED BY development.dm_estados_pacientes.id;


--
-- TOC entry 253 (class 1259 OID 53544)
-- Name: dm_hospitales; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dm_hospitales (
    id integer NOT NULL,
    descripcion character varying(250),
    id_tipo_seguimiento integer
);


ALTER TABLE development.dm_hospitales OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 252 (class 1259 OID 53542)
-- Name: dm_hospitales_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dm_hospitales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dm_hospitales_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3665 (class 0 OID 0)
-- Dependencies: 252
-- Name: dm_hospitales_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dm_hospitales_id_seq OWNED BY development.dm_hospitales.id;


--
-- TOC entry 205 (class 1259 OID 16475)
-- Name: dm_medicos_voluntarios; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dm_medicos_voluntarios (
    dni character varying(16) NOT NULL,
    nombre character varying(50) NOT NULL,
    apellido character varying(100) NOT NULL,
    correo character varying(100) NOT NULL,
    password character varying(50) NOT NULL,
    celular character varying(50),
    numero_colegiatura character varying(50),
    graduacion character(4),
    especialidad character varying(150),
    centro_laboral character varying(250),
    centro_laboral_principal character varying(250),
    disponibilidad character varying(50),
    distrito character varying(100),
    fecha_registro timestamp without time zone,
    fecha_carga timestamp without time zone,
    id_hospital integer
);


ALTER TABLE development.dm_medicos_voluntarios OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 259 (class 1259 OID 54736)
-- Name: dm_motivo_prueba; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dm_motivo_prueba (
    id character(2) NOT NULL,
    descripcion character varying(250)
);


ALTER TABLE development.dm_motivo_prueba OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 216 (class 1259 OID 16538)
-- Name: dm_parametros; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dm_parametros (
    id integer NOT NULL,
    cantidad_max integer NOT NULL,
    cantidad_max_dias_bot integer,
    cantidad_max_dias_bot_init integer
);


ALTER TABLE development.dm_parametros OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 215 (class 1259 OID 16536)
-- Name: dm_parametros_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dm_parametros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dm_parametros_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3666 (class 0 OID 0)
-- Dependencies: 215
-- Name: dm_parametros_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dm_parametros_id_seq OWNED BY development.dm_parametros.id;


--
-- TOC entry 257 (class 1259 OID 54063)
-- Name: dm_parametros_maestros_hospital; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dm_parametros_maestros_hospital (
    id integer NOT NULL,
    grupo_parametro integer,
    id_hospital integer,
    descripcion text
);


ALTER TABLE development.dm_parametros_maestros_hospital OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 256 (class 1259 OID 54061)
-- Name: dm_parametros_maestros_hospital_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dm_parametros_maestros_hospital_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dm_parametros_maestros_hospital_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3667 (class 0 OID 0)
-- Dependencies: 256
-- Name: dm_parametros_maestros_hospital_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dm_parametros_maestros_hospital_id_seq OWNED BY development.dm_parametros_maestros_hospital.id;


--
-- TOC entry 219 (class 1259 OID 16579)
-- Name: dm_preguntas; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dm_preguntas (
    id character varying(50) NOT NULL,
    descripcion character varying(250) NOT NULL
);


ALTER TABLE development.dm_preguntas OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 258 (class 1259 OID 54725)
-- Name: dm_tipo_registro; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dm_tipo_registro (
    id integer NOT NULL,
    descripcion character varying(250)
);


ALTER TABLE development.dm_tipo_registro OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 285 (class 1259 OID 56554)
-- Name: dm_tipo_seguimiento; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dm_tipo_seguimiento (
    id integer NOT NULL,
    descripcion character varying(100)
);


ALTER TABLE development.dm_tipo_seguimiento OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 284 (class 1259 OID 56552)
-- Name: dm_tipo_seguimiento_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dm_tipo_seguimiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dm_tipo_seguimiento_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3668 (class 0 OID 0)
-- Dependencies: 284
-- Name: dm_tipo_seguimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dm_tipo_seguimiento_id_seq OWNED BY development.dm_tipo_seguimiento.id;


--
-- TOC entry 218 (class 1259 OID 16546)
-- Name: dt_casos_dia; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_casos_dia (
    id integer NOT NULL,
    dni_paciente character varying(16) NOT NULL,
    estado_caso integer NOT NULL,
    fiebre integer,
    dificultad_respitar integer,
    dolor_pecho integer,
    alteracion_sensorio integer,
    colaboracion_azul_labios integer,
    tos integer,
    dolor_garganta integer,
    congestion_nasal integer,
    malestar_general integer,
    cefalea integer,
    nauseas integer,
    diarrea integer,
    comentario text,
    fecha_caso date DEFAULT now(),
    fecha_cierre_caso date,
    dni_medico character varying(16),
    fecha_tomado timestamp without time zone,
    disnea_sa boolean DEFAULT false,
    taqui_sa boolean DEFAULT false,
    saturacion_sa boolean DEFAULT false,
    alteracion_sa boolean DEFAULT false,
    otros_sa boolean DEFAULT false,
    otros boolean DEFAULT false,
    estado_evo integer DEFAULT 0,
    temp_fv double precision,
    fr_fv double precision,
    fc_fv double precision,
    sat_fv double precision,
    CONSTRAINT dt_casos_dia_alteracion_sensorio_check CHECK ((alteracion_sensorio <= 3)),
    CONSTRAINT dt_casos_dia_cefalea_check CHECK ((cefalea <= 3)),
    CONSTRAINT dt_casos_dia_colaboracion_azul_labios_check CHECK ((colaboracion_azul_labios <= 3)),
    CONSTRAINT dt_casos_dia_congestion_nasal_check CHECK ((congestion_nasal <= 3)),
    CONSTRAINT dt_casos_dia_diarrea_check CHECK ((diarrea <= 3)),
    CONSTRAINT dt_casos_dia_dificultad_respitar_check CHECK ((dificultad_respitar <= 3)),
    CONSTRAINT dt_casos_dia_dolor_garganta_check CHECK ((dolor_garganta <= 3)),
    CONSTRAINT dt_casos_dia_dolor_pecho_check CHECK ((dolor_pecho <= 3)),
    CONSTRAINT dt_casos_dia_fiebre_check CHECK ((fiebre <= 3)),
    CONSTRAINT dt_casos_dia_malestar_general_check CHECK ((malestar_general <= 3)),
    CONSTRAINT dt_casos_dia_nauseas_check CHECK ((nauseas <= 3)),
    CONSTRAINT dt_casos_dia_tos_check CHECK ((tos <= 3))
);


ALTER TABLE development.dt_casos_dia OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 217 (class 1259 OID 16544)
-- Name: dt_casos_dia_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dt_casos_dia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dt_casos_dia_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3669 (class 0 OID 0)
-- Dependencies: 217
-- Name: dt_casos_dia_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dt_casos_dia_id_seq OWNED BY development.dt_casos_dia.id;


--
-- TOC entry 239 (class 1259 OID 17667)
-- Name: dt_casos_programados; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_casos_programados (
    id integer NOT NULL,
    dni_paciente character varying(16) NOT NULL,
    dni_medico character varying(16) NOT NULL,
    fecha date DEFAULT now() NOT NULL,
    estado integer DEFAULT 1 NOT NULL
);


ALTER TABLE development.dt_casos_programados OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 238 (class 1259 OID 17665)
-- Name: dt_casos_programados_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dt_casos_programados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dt_casos_programados_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3670 (class 0 OID 0)
-- Dependencies: 238
-- Name: dt_casos_programados_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dt_casos_programados_id_seq OWNED BY development.dt_casos_programados.id;


--
-- TOC entry 278 (class 1259 OID 56111)
-- Name: dt_casos_vacuna; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_casos_vacuna (
    id integer NOT NULL,
    documento_identidad_paciente_vacuna character varying(16),
    fecha_creacion date,
    comentario text,
    estado integer DEFAULT 0,
    fecha_tomado timestamp without time zone,
    fecha_cierre timestamp without time zone,
    dni_medico character varying(16),
    tipo_caso integer DEFAULT 1
);


ALTER TABLE development.dt_casos_vacuna OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 276 (class 1259 OID 56088)
-- Name: dt_casos_vacuna_form; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_casos_vacuna_form (
    id integer NOT NULL,
    documento_identidad_paciente_vacuna character varying(16),
    fecha_creacion date,
    dolor integer DEFAULT 0,
    fiebre integer DEFAULT 0,
    fatiga integer DEFAULT 0,
    cabeza integer DEFAULT 0,
    confusion integer DEFAULT 0,
    adormecimiento integer DEFAULT 0,
    diarrea integer DEFAULT 0,
    otros integer DEFAULT 0,
    fecha_respondido timestamp without time zone,
    estado integer DEFAULT 0,
    puntuacion integer DEFAULT 0,
    piel integer DEFAULT 0
);


ALTER TABLE development.dt_casos_vacuna_form OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 275 (class 1259 OID 56086)
-- Name: dt_casos_vacuna_form_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dt_casos_vacuna_form_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dt_casos_vacuna_form_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3671 (class 0 OID 0)
-- Dependencies: 275
-- Name: dt_casos_vacuna_form_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dt_casos_vacuna_form_id_seq OWNED BY development.dt_casos_vacuna_form.id;


--
-- TOC entry 277 (class 1259 OID 56109)
-- Name: dt_casos_vacuna_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dt_casos_vacuna_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dt_casos_vacuna_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3672 (class 0 OID 0)
-- Dependencies: 277
-- Name: dt_casos_vacuna_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dt_casos_vacuna_id_seq OWNED BY development.dt_casos_vacuna.id;


--
-- TOC entry 244 (class 1259 OID 19879)
-- Name: dt_contactos; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_contactos (
    dni character varying(16) NOT NULL,
    parentesco character varying(100) NOT NULL,
    nombre character varying(100) NOT NULL,
    edad integer,
    factor_riesgo boolean DEFAULT false,
    observacion text,
    fecha_creacion date DEFAULT timezone('America/Lima'::text, now()),
    celular character varying(20)
);


ALTER TABLE development.dt_contactos OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 245 (class 1259 OID 19889)
-- Name: dt_contactos_pacientes; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_contactos_pacientes (
    dni_contacto character varying(16),
    dni_paciente character varying(16),
    fecha_creacion date DEFAULT timezone('America/Lima'::text, now()),
    flag boolean DEFAULT true,
    parentesco character varying(50)
);


ALTER TABLE development.dt_contactos_pacientes OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 214 (class 1259 OID 16525)
-- Name: dt_historial; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_historial (
    id integer NOT NULL,
    dni_paciente character varying(16) NOT NULL,
    destino character varying(100) NOT NULL,
    lugar_destino character varying(100) NOT NULL,
    "clasificación" character varying(100) NOT NULL,
    evolucion character varying(100) NOT NULL
);


ALTER TABLE development.dt_historial OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 213 (class 1259 OID 16523)
-- Name: dt_historial_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dt_historial_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dt_historial_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3673 (class 0 OID 0)
-- Dependencies: 213
-- Name: dt_historial_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dt_historial_id_seq OWNED BY development.dt_historial.id;


--
-- TOC entry 247 (class 1259 OID 19909)
-- Name: dt_monitoreo_contactos; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_monitoreo_contactos (
    id integer NOT NULL,
    dni_contacto character varying(16) NOT NULL,
    fecha_monitoreo date DEFAULT timezone('America/Lima'::text, now()),
    id_status character(1)
);


ALTER TABLE development.dt_monitoreo_contactos OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 246 (class 1259 OID 19907)
-- Name: dt_monitoreo_contactos_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dt_monitoreo_contactos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dt_monitoreo_contactos_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3674 (class 0 OID 0)
-- Dependencies: 246
-- Name: dt_monitoreo_contactos_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dt_monitoreo_contactos_id_seq OWNED BY development.dt_monitoreo_contactos.id;


--
-- TOC entry 210 (class 1259 OID 16498)
-- Name: dt_pacientes; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_pacientes (
    dni character varying(16) NOT NULL,
    nombre character varying(50) NOT NULL,
    fecha_ingreso timestamp without time zone NOT NULL,
    direccion character varying(100),
    celular character varying(12) NOT NULL,
    fijo character varying(10),
    edad integer,
    sexo character(1),
    pais character varying(50),
    provincia character varying(50),
    distrito character varying(50),
    fecha_inicio_sintomas timestamp without time zone,
    estado integer,
    grupo character(1),
    factor_riesgo boolean,
    dias_atencion integer,
    flag_activo boolean,
    paso_encuesta_inicial boolean DEFAULT false,
    codigo character varying(50),
    fecha_creacion timestamp without time zone DEFAULT now(),
    tipo_documento integer,
    fecha_prueba_1 date,
    fecha_resultado_prueba_1 date,
    tipo_prueba_1 character varying(30),
    fecha_prueba_2 date,
    fecha_resultado_prueba_2 date,
    tipo_prueba_2 character varying(30),
    fecha_prueba_3 date,
    fecha_resultado_prueba_3 date,
    tipo_prueba_3 character varying(30),
    resultado_prueba_1 integer,
    resultado_prueba_2 integer,
    resultado_prueba_3 integer,
    fecha_prueba date,
    is_doctor boolean DEFAULT false,
    condicion_egreso integer,
    nota_grupo character varying(100),
    id_hospital integer,
    id_tipo_registro integer DEFAULT 1,
    id_motivo_prueba character(2),
    acepto_terminos integer DEFAULT 0,
    acepto_terminos_datos integer DEFAULT 0,
    fecha_respuesta_terminos timestamp without time zone,
    fecha_ultima_actualizacion timestamp without time zone,
    cantidad_subidas integer DEFAULT 1,
    CONSTRAINT dt_pacientes_grupo_check CHECK (((grupo = 'A'::bpchar) OR (grupo = 'B'::bpchar) OR (grupo = 'C'::bpchar))),
    CONSTRAINT dt_pacientes_sexo_check CHECK (((sexo = 'M'::bpchar) OR (sexo = 'F'::bpchar)))
);


ALTER TABLE development.dt_pacientes OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 274 (class 1259 OID 56065)
-- Name: dt_pacientes_vacuna; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_pacientes_vacuna (
    documento_identidad character varying(16) NOT NULL,
    tipo_documento integer,
    nombre character varying(150),
    cargo text,
    condicion text,
    hospital character varying(100),
    nota_grupo text,
    estado integer,
    email text,
    celular character varying(12),
    fecha_creacion timestamp without time zone,
    trabajo_presencial integer DEFAULT 0,
    celular_validado integer DEFAULT 0,
    fecha_validacion timestamp without time zone,
    fecha_ultima_modificacion timestamp without time zone,
    puntuacion integer DEFAULT 0,
    id_hospital integer,
    fecha_respuesta_registro timestamp without time zone,
    fill_document_esavi integer DEFAULT 0
);


ALTER TABLE development.dt_pacientes_vacuna OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 212 (class 1259 OID 16512)
-- Name: dt_pruebas; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_pruebas (
    id integer NOT NULL,
    dni_paciente character varying(16) NOT NULL,
    fecha_prueba timestamp without time zone,
    resultado character varying(50) NOT NULL,
    fecha_resultado_prueba timestamp without time zone,
    tipo character varying(100) NOT NULL
);


ALTER TABLE development.dt_pruebas OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 211 (class 1259 OID 16510)
-- Name: dt_pruebas_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dt_pruebas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dt_pruebas_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3675 (class 0 OID 0)
-- Dependencies: 211
-- Name: dt_pruebas_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dt_pruebas_id_seq OWNED BY development.dt_pruebas.id;


--
-- TOC entry 221 (class 1259 OID 16586)
-- Name: dt_respuestas; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_respuestas (
    id integer NOT NULL,
    dni_paciente character varying(16) NOT NULL,
    id_pregunta character varying(50),
    respuesta_boolean boolean,
    respuesta_entero integer,
    respuesta_decimal double precision,
    respuesta_string character varying(50),
    fecha_pregunta timestamp without time zone,
    fecha_respuesta timestamp without time zone
);


ALTER TABLE development.dt_respuestas OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 220 (class 1259 OID 16584)
-- Name: dt_respuestas_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dt_respuestas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dt_respuestas_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3676 (class 0 OID 0)
-- Dependencies: 220
-- Name: dt_respuestas_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dt_respuestas_id_seq OWNED BY development.dt_respuestas.id;


--
-- TOC entry 243 (class 1259 OID 19376)
-- Name: dt_tratamientos_caso_dia; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.dt_tratamientos_caso_dia (
    id integer NOT NULL,
    id_tratamiento integer,
    id_caso_dia integer,
    nombre character varying(50) NOT NULL,
    fecha_desde date,
    fecha_hasta date,
    observacion character varying(250),
    id_razon integer,
    id_detalle integer,
    usando boolean DEFAULT false
);


ALTER TABLE development.dt_tratamientos_caso_dia OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 242 (class 1259 OID 19374)
-- Name: dt_tratamientos_caso_dia_id_seq; Type: SEQUENCE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE SEQUENCE development.dt_tratamientos_caso_dia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE development.dt_tratamientos_caso_dia_id_seq OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3677 (class 0 OID 0)
-- Dependencies: 242
-- Name: dt_tratamientos_caso_dia_id_seq; Type: SEQUENCE OWNED BY; Schema: development; Owner: ibm-cloud-base-user
--

ALTER SEQUENCE development.dt_tratamientos_caso_dia_id_seq OWNED BY development.dt_tratamientos_caso_dia.id;


--
-- TOC entry 222 (class 1259 OID 16704)
-- Name: session; Type: TABLE; Schema: development; Owner: ibm-cloud-base-user
--

CREATE TABLE development.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE development.session OWNER TO "ibm-cloud-base-user";

--
-- TOC entry 3431 (class 2604 OID 53555)
-- Name: dm_administradores id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_administradores ALTER COLUMN id SET DEFAULT nextval('development.dm_administradores_id_seq'::regclass);


--
-- TOC entry 3381 (class 2604 OID 16485)
-- Name: dm_estados_casos id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_estados_casos ALTER COLUMN id SET DEFAULT nextval('development.dm_estados_casos_id_seq'::regclass);


--
-- TOC entry 3383 (class 2604 OID 16494)
-- Name: dm_estados_pacientes id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_estados_pacientes ALTER COLUMN id SET DEFAULT nextval('development.dm_estados_pacientes_id_seq'::regclass);


--
-- TOC entry 3430 (class 2604 OID 53547)
-- Name: dm_hospitales id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_hospitales ALTER COLUMN id SET DEFAULT nextval('development.dm_hospitales_id_seq'::regclass);


--
-- TOC entry 3396 (class 2604 OID 16541)
-- Name: dm_parametros id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_parametros ALTER COLUMN id SET DEFAULT nextval('development.dm_parametros_id_seq'::regclass);


--
-- TOC entry 3432 (class 2604 OID 54066)
-- Name: dm_parametros_maestros_hospital id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_parametros_maestros_hospital ALTER COLUMN id SET DEFAULT nextval('development.dm_parametros_maestros_hospital_id_seq'::regclass);


--
-- TOC entry 3452 (class 2604 OID 56557)
-- Name: dm_tipo_seguimiento id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_tipo_seguimiento ALTER COLUMN id SET DEFAULT nextval('development.dm_tipo_seguimiento_id_seq'::regclass);


--
-- TOC entry 3397 (class 2604 OID 16549)
-- Name: dt_casos_dia id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_dia ALTER COLUMN id SET DEFAULT nextval('development.dt_casos_dia_id_seq'::regclass);


--
-- TOC entry 3419 (class 2604 OID 17670)
-- Name: dt_casos_programados id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_programados ALTER COLUMN id SET DEFAULT nextval('development.dt_casos_programados_id_seq'::regclass);


--
-- TOC entry 3449 (class 2604 OID 56114)
-- Name: dt_casos_vacuna id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_vacuna ALTER COLUMN id SET DEFAULT nextval('development.dt_casos_vacuna_id_seq'::regclass);


--
-- TOC entry 3437 (class 2604 OID 56091)
-- Name: dt_casos_vacuna_form id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_vacuna_form ALTER COLUMN id SET DEFAULT nextval('development.dt_casos_vacuna_form_id_seq'::regclass);


--
-- TOC entry 3395 (class 2604 OID 16528)
-- Name: dt_historial id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_historial ALTER COLUMN id SET DEFAULT nextval('development.dt_historial_id_seq'::regclass);


--
-- TOC entry 3428 (class 2604 OID 19912)
-- Name: dt_monitoreo_contactos id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_monitoreo_contactos ALTER COLUMN id SET DEFAULT nextval('development.dt_monitoreo_contactos_id_seq'::regclass);


--
-- TOC entry 3394 (class 2604 OID 16515)
-- Name: dt_pruebas id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_pruebas ALTER COLUMN id SET DEFAULT nextval('development.dt_pruebas_id_seq'::regclass);


--
-- TOC entry 3418 (class 2604 OID 16589)
-- Name: dt_respuestas id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_respuestas ALTER COLUMN id SET DEFAULT nextval('development.dt_respuestas_id_seq'::regclass);


--
-- TOC entry 3422 (class 2604 OID 19379)
-- Name: dt_tratamientos_caso_dia id; Type: DEFAULT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_tratamientos_caso_dia ALTER COLUMN id SET DEFAULT nextval('development.dt_tratamientos_caso_dia_id_seq'::regclass);


--
-- TOC entry 3487 (class 2606 OID 53562)
-- Name: dm_administradores dm_administradores_email_key; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_administradores
    ADD CONSTRAINT dm_administradores_email_key UNIQUE (email);


--
-- TOC entry 3489 (class 2606 OID 53560)
-- Name: dm_administradores dm_administradores_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_administradores
    ADD CONSTRAINT dm_administradores_pkey PRIMARY KEY (id);


--
-- TOC entry 3456 (class 2606 OID 16488)
-- Name: dm_estados_casos dm_estados_casos_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_estados_casos
    ADD CONSTRAINT dm_estados_casos_pkey PRIMARY KEY (id);


--
-- TOC entry 3458 (class 2606 OID 16497)
-- Name: dm_estados_pacientes dm_estados_pacientes_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_estados_pacientes
    ADD CONSTRAINT dm_estados_pacientes_pkey PRIMARY KEY (id);


--
-- TOC entry 3485 (class 2606 OID 53549)
-- Name: dm_hospitales dm_hospitales_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_hospitales
    ADD CONSTRAINT dm_hospitales_pkey PRIMARY KEY (id);


--
-- TOC entry 3454 (class 2606 OID 16479)
-- Name: dm_medicos_voluntarios dm_medicos_voluntarios_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_medicos_voluntarios
    ADD CONSTRAINT dm_medicos_voluntarios_pkey PRIMARY KEY (dni);


--
-- TOC entry 3495 (class 2606 OID 54740)
-- Name: dm_motivo_prueba dm_motivo_prueba_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_motivo_prueba
    ADD CONSTRAINT dm_motivo_prueba_pkey PRIMARY KEY (id);


--
-- TOC entry 3491 (class 2606 OID 54071)
-- Name: dm_parametros_maestros_hospital dm_parametros_maestros_hospital_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_parametros_maestros_hospital
    ADD CONSTRAINT dm_parametros_maestros_hospital_pkey PRIMARY KEY (id);


--
-- TOC entry 3466 (class 2606 OID 16543)
-- Name: dm_parametros dm_parametros_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_parametros
    ADD CONSTRAINT dm_parametros_pkey PRIMARY KEY (id);


--
-- TOC entry 3470 (class 2606 OID 16583)
-- Name: dm_preguntas dm_preguntas_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_preguntas
    ADD CONSTRAINT dm_preguntas_pkey PRIMARY KEY (id);


--
-- TOC entry 3493 (class 2606 OID 54729)
-- Name: dm_tipo_registro dm_tipo_registro_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_tipo_registro
    ADD CONSTRAINT dm_tipo_registro_pkey PRIMARY KEY (id);


--
-- TOC entry 3503 (class 2606 OID 56559)
-- Name: dm_tipo_seguimiento dm_tipo_seguimiento_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_tipo_seguimiento
    ADD CONSTRAINT dm_tipo_seguimiento_pkey PRIMARY KEY (id);


--
-- TOC entry 3468 (class 2606 OID 16563)
-- Name: dt_casos_dia dt_casos_dia_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_dia
    ADD CONSTRAINT dt_casos_dia_pkey PRIMARY KEY (id);


--
-- TOC entry 3477 (class 2606 OID 17674)
-- Name: dt_casos_programados dt_casos_programados_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_programados
    ADD CONSTRAINT dt_casos_programados_pkey PRIMARY KEY (id);


--
-- TOC entry 3499 (class 2606 OID 56103)
-- Name: dt_casos_vacuna_form dt_casos_vacuna_form_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_vacuna_form
    ADD CONSTRAINT dt_casos_vacuna_form_pkey PRIMARY KEY (id);


--
-- TOC entry 3501 (class 2606 OID 56120)
-- Name: dt_casos_vacuna dt_casos_vacuna_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_vacuna
    ADD CONSTRAINT dt_casos_vacuna_pkey PRIMARY KEY (id);


--
-- TOC entry 3481 (class 2606 OID 19888)
-- Name: dt_contactos dt_contactos_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_contactos
    ADD CONSTRAINT dt_contactos_pkey PRIMARY KEY (dni);


--
-- TOC entry 3464 (class 2606 OID 16530)
-- Name: dt_historial dt_historial_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_historial
    ADD CONSTRAINT dt_historial_pkey PRIMARY KEY (id);


--
-- TOC entry 3483 (class 2606 OID 19915)
-- Name: dt_monitoreo_contactos dt_monitoreo_contactos_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_monitoreo_contactos
    ADD CONSTRAINT dt_monitoreo_contactos_pkey PRIMARY KEY (id);


--
-- TOC entry 3460 (class 2606 OID 16504)
-- Name: dt_pacientes dt_pacientes_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_pacientes
    ADD CONSTRAINT dt_pacientes_pkey PRIMARY KEY (dni);


--
-- TOC entry 3497 (class 2606 OID 56075)
-- Name: dt_pacientes_vacuna dt_pacientes_vacuna_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_pacientes_vacuna
    ADD CONSTRAINT dt_pacientes_vacuna_pkey PRIMARY KEY (documento_identidad);


--
-- TOC entry 3462 (class 2606 OID 16517)
-- Name: dt_pruebas dt_pruebas_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_pruebas
    ADD CONSTRAINT dt_pruebas_pkey PRIMARY KEY (id);


--
-- TOC entry 3472 (class 2606 OID 16591)
-- Name: dt_respuestas dt_respuestas_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_respuestas
    ADD CONSTRAINT dt_respuestas_pkey PRIMARY KEY (id);


--
-- TOC entry 3479 (class 2606 OID 19381)
-- Name: dt_tratamientos_caso_dia dt_tratamientos_caso_dia_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_tratamientos_caso_dia
    ADD CONSTRAINT dt_tratamientos_caso_dia_pkey PRIMARY KEY (id);


--
-- TOC entry 3475 (class 2606 OID 16711)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3473 (class 1259 OID 16712)
-- Name: idx_session_expire; Type: INDEX; Schema: development; Owner: ibm-cloud-base-user
--

CREATE INDEX idx_session_expire ON development.session USING btree (expire);


--
-- TOC entry 3523 (class 2606 OID 53563)
-- Name: dm_administradores dm_administradores_id_hospital_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_administradores
    ADD CONSTRAINT dm_administradores_id_hospital_fkey FOREIGN KEY (id_hospital) REFERENCES public.dm_hospitales(id);


--
-- TOC entry 3522 (class 2606 OID 56560)
-- Name: dm_hospitales dm_hospitales_id_tipo_seguimiento_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_hospitales
    ADD CONSTRAINT dm_hospitales_id_tipo_seguimiento_fkey FOREIGN KEY (id_tipo_seguimiento) REFERENCES development.dm_tipo_seguimiento(id);


--
-- TOC entry 3504 (class 2606 OID 56254)
-- Name: dm_medicos_voluntarios dm_medicos_voluntarios_id_hospital_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_medicos_voluntarios
    ADD CONSTRAINT dm_medicos_voluntarios_id_hospital_fkey FOREIGN KEY (id_hospital) REFERENCES development.dm_hospitales(id) ON DELETE CASCADE;


--
-- TOC entry 3524 (class 2606 OID 54072)
-- Name: dm_parametros_maestros_hospital dm_parametros_maestros_hospital_id_hospital_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dm_parametros_maestros_hospital
    ADD CONSTRAINT dm_parametros_maestros_hospital_id_hospital_fkey FOREIGN KEY (id_hospital) REFERENCES development.dm_hospitales(id);


--
-- TOC entry 3511 (class 2606 OID 16604)
-- Name: dt_casos_dia dt_casos_dia_dni_medico_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_dia
    ADD CONSTRAINT dt_casos_dia_dni_medico_fkey FOREIGN KEY (dni_medico) REFERENCES development.dm_medicos_voluntarios(dni);


--
-- TOC entry 3512 (class 2606 OID 16564)
-- Name: dt_casos_dia dt_casos_dia_dni_paciente_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_dia
    ADD CONSTRAINT dt_casos_dia_dni_paciente_fkey FOREIGN KEY (dni_paciente) REFERENCES development.dt_pacientes(dni);


--
-- TOC entry 3513 (class 2606 OID 16574)
-- Name: dt_casos_dia dt_casos_dia_estado_caso_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_dia
    ADD CONSTRAINT dt_casos_dia_estado_caso_fkey FOREIGN KEY (estado_caso) REFERENCES development.dm_estados_casos(id);


--
-- TOC entry 3517 (class 2606 OID 17680)
-- Name: dt_casos_programados dt_casos_programados_dni_medico_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_programados
    ADD CONSTRAINT dt_casos_programados_dni_medico_fkey FOREIGN KEY (dni_medico) REFERENCES development.dm_medicos_voluntarios(dni);


--
-- TOC entry 3516 (class 2606 OID 17675)
-- Name: dt_casos_programados dt_casos_programados_dni_paciente_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_programados
    ADD CONSTRAINT dt_casos_programados_dni_paciente_fkey FOREIGN KEY (dni_paciente) REFERENCES development.dt_pacientes(dni);


--
-- TOC entry 3528 (class 2606 OID 56126)
-- Name: dt_casos_vacuna dt_casos_vacuna_dni_medico_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_vacuna
    ADD CONSTRAINT dt_casos_vacuna_dni_medico_fkey FOREIGN KEY (dni_medico) REFERENCES development.dm_medicos_voluntarios(dni);


--
-- TOC entry 3529 (class 2606 OID 56121)
-- Name: dt_casos_vacuna dt_casos_vacuna_documento_identidad_paciente_vacuna_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_vacuna
    ADD CONSTRAINT dt_casos_vacuna_documento_identidad_paciente_vacuna_fkey FOREIGN KEY (documento_identidad_paciente_vacuna) REFERENCES development.dt_pacientes_vacuna(documento_identidad);


--
-- TOC entry 3527 (class 2606 OID 56104)
-- Name: dt_casos_vacuna_form dt_casos_vacuna_form_documento_identidad_paciente_vacuna_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_casos_vacuna_form
    ADD CONSTRAINT dt_casos_vacuna_form_documento_identidad_paciente_vacuna_fkey FOREIGN KEY (documento_identidad_paciente_vacuna) REFERENCES development.dt_pacientes_vacuna(documento_identidad);


--
-- TOC entry 3519 (class 2606 OID 19894)
-- Name: dt_contactos_pacientes dt_contactos_pacientes_dni_contacto_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_contactos_pacientes
    ADD CONSTRAINT dt_contactos_pacientes_dni_contacto_fkey FOREIGN KEY (dni_contacto) REFERENCES development.dt_contactos(dni);


--
-- TOC entry 3520 (class 2606 OID 19899)
-- Name: dt_contactos_pacientes dt_contactos_pacientes_dni_paciente_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_contactos_pacientes
    ADD CONSTRAINT dt_contactos_pacientes_dni_paciente_fkey FOREIGN KEY (dni_paciente) REFERENCES development.dt_pacientes(dni);


--
-- TOC entry 3510 (class 2606 OID 16531)
-- Name: dt_historial dt_historial_dni_paciente_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_historial
    ADD CONSTRAINT dt_historial_dni_paciente_fkey FOREIGN KEY (dni_paciente) REFERENCES development.dt_pacientes(dni);


--
-- TOC entry 3521 (class 2606 OID 19916)
-- Name: dt_monitoreo_contactos dt_monitoreo_contactos_dni_contacto_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_monitoreo_contactos
    ADD CONSTRAINT dt_monitoreo_contactos_dni_contacto_fkey FOREIGN KEY (dni_contacto) REFERENCES development.dt_contactos(dni);


--
-- TOC entry 3505 (class 2606 OID 16505)
-- Name: dt_pacientes dt_pacientes_estado_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_pacientes
    ADD CONSTRAINT dt_pacientes_estado_fkey FOREIGN KEY (estado) REFERENCES development.dm_estados_pacientes(id);


--
-- TOC entry 3506 (class 2606 OID 53573)
-- Name: dt_pacientes dt_pacientes_id_hospital_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_pacientes
    ADD CONSTRAINT dt_pacientes_id_hospital_fkey FOREIGN KEY (id_hospital) REFERENCES public.dm_hospitales(id);


--
-- TOC entry 3508 (class 2606 OID 54741)
-- Name: dt_pacientes dt_pacientes_id_motivo_prueba_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_pacientes
    ADD CONSTRAINT dt_pacientes_id_motivo_prueba_fkey FOREIGN KEY (id_motivo_prueba) REFERENCES development.dm_motivo_prueba(id);


--
-- TOC entry 3507 (class 2606 OID 54731)
-- Name: dt_pacientes dt_pacientes_id_tipo_registro_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_pacientes
    ADD CONSTRAINT dt_pacientes_id_tipo_registro_fkey FOREIGN KEY (id_tipo_registro) REFERENCES development.dm_tipo_registro(id);


--
-- TOC entry 3525 (class 2606 OID 56076)
-- Name: dt_pacientes_vacuna dt_pacientes_vacuna_estado_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_pacientes_vacuna
    ADD CONSTRAINT dt_pacientes_vacuna_estado_fkey FOREIGN KEY (estado) REFERENCES development.dm_estados_pacientes(id);


--
-- TOC entry 3526 (class 2606 OID 56081)
-- Name: dt_pacientes_vacuna dt_pacientes_vacuna_id_hospital_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_pacientes_vacuna
    ADD CONSTRAINT dt_pacientes_vacuna_id_hospital_fkey FOREIGN KEY (id_hospital) REFERENCES development.dm_hospitales(id);


--
-- TOC entry 3509 (class 2606 OID 16518)
-- Name: dt_pruebas dt_pruebas_dni_paciente_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_pruebas
    ADD CONSTRAINT dt_pruebas_dni_paciente_fkey FOREIGN KEY (dni_paciente) REFERENCES development.dt_pacientes(dni);


--
-- TOC entry 3514 (class 2606 OID 16592)
-- Name: dt_respuestas dt_respuestas_dni_paciente_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_respuestas
    ADD CONSTRAINT dt_respuestas_dni_paciente_fkey FOREIGN KEY (dni_paciente) REFERENCES development.dt_pacientes(dni);


--
-- TOC entry 3515 (class 2606 OID 16597)
-- Name: dt_respuestas dt_respuestas_id_pregunta_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_respuestas
    ADD CONSTRAINT dt_respuestas_id_pregunta_fkey FOREIGN KEY (id_pregunta) REFERENCES development.dm_preguntas(id);


--
-- TOC entry 3518 (class 2606 OID 19382)
-- Name: dt_tratamientos_caso_dia dt_tratamientos_caso_dia_id_caso_dia_fkey; Type: FK CONSTRAINT; Schema: development; Owner: ibm-cloud-base-user
--

ALTER TABLE ONLY development.dt_tratamientos_caso_dia
    ADD CONSTRAINT dt_tratamientos_caso_dia_id_caso_dia_fkey FOREIGN KEY (id_caso_dia) REFERENCES development.dt_casos_dia(id);


-- Completed on 2021-07-22 15:26:40 -05

--
-- PostgreSQL database dump complete
--


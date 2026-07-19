-- ==========================================================
-- DOJOIA - Tabla de Manuales PDF (Instructor y Participante)
-- ==========================================================

-- 1. Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear la tabla de manuales si no existe
CREATE TABLE IF NOT EXISTS public.manuales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('instructor', 'participante')), -- 'instructor' or 'participante'
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER DEFAULT 0, -- Tamaño en bytes
    nivel VARCHAR(50) DEFAULT 'Todos los niveles', -- 'Todos los niveles', 'Cintas Blancas y Amarillas', 'Avanzados', etc.
    autor TEXT DEFAULT 'Sensei Carlos Martínez',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) para manuales
ALTER TABLE public.manuales ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para manuales
-- Permite lectura pública de manuales
DROP POLICY IF EXISTS "Lectura pública de manuales" ON public.manuales;
CREATE POLICY "Lectura pública de manuales" ON public.manuales
    FOR SELECT USING (true);

-- Permite gestión a instructores / senseis
DROP POLICY IF EXISTS "Senseis pueden gestionar manuales" ON public.manuales;
CREATE POLICY "Senseis pueden gestionar manuales" ON public.manuales
    FOR ALL USING (true);

-- 3. Crear el bucket 'manuales' de Storage en Supabase si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('manuales', 'manuales', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Políticas de RLS de Storage para el bucket 'manuales'
-- Lectura pública de archivos en el bucket 'manuales'
DROP POLICY IF EXISTS "Acceso público de lectura de manuales" ON storage.objects;
CREATE POLICY "Acceso público de lectura de manuales" ON storage.objects
    FOR SELECT USING (bucket_id = 'manuales');

-- Permitir subida/inserción en el bucket 'manuales'
DROP POLICY IF EXISTS "Permitir subida a manuales" ON storage.objects;
CREATE POLICY "Permitir subida a manuales" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'manuales');

-- Permitir actualización en el bucket 'manuales'
DROP POLICY IF EXISTS "Permitir actualización de manuales" ON storage.objects;
CREATE POLICY "Permitir actualización de manuales" ON storage.objects
    FOR UPDATE USING (bucket_id = 'manuales');

-- Permitir eliminación en el bucket 'manuales'
DROP POLICY IF EXISTS "Permitir borrar manuales" ON storage.objects;
CREATE POLICY "Permitir borrar manuales" ON storage.objects
    FOR DELETE USING (bucket_id = 'manuales');

-- 5. Semilla de Manuales por Defecto
INSERT INTO public.manuales (id, titulo, descripcion, tipo, file_url, file_name, file_size, nivel, autor) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Manual de Pedagogía Marcial y Didáctica Shito-Ryu',
    'Guía completa para instructores sobre la metodología de enseñanza infantil, estructura de clases y principios biomecánicos de las posturas.',
    'instructor',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'Manual_Instructor_Didactica_ShitoRyu.pdf',
    1048576,
    'Instructores y Sempais',
    'Sensei Carlos Martínez'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Manual del Participante: Fundamentos Kyus Iniciales (Cintas Blancas y Amarillas)',
    'Manual de estudio teórico-práctico para alumnos principiantes. Incluye etiquetas del dojo, nomenclaturas en japonés y diagramas de Katas Pinan Shodan.',
    'participante',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'Manual_Participante_Kyu_Principiantes.pdf',
    2097152,
    'Cintas Blancas y Amarillas',
    'Sensei Carlos Martínez'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Manual del Participante: Kumite Táctico y Reglamento WKF',
    'Guía del estudiante para la preparación física y táctica en combate, distancia Ma-ai, combinaciones de ataque y reglamento internacional de juzgamiento.',
    'participante',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'Manual_Participante_Kumite_WKF.pdf',
    1572864,
    'Cintas Naranjas a Negras',
    'Sensei Carlos Martínez'
)
ON CONFLICT (id) DO NOTHING;

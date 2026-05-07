import Link from "next/link";
import { signup } from "../login/actions";
import styles from "../auth.module.css";
import { ArrowLeft } from "lucide-react";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBackground}></div>
      
      <div className={styles.authCard}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--dojo-white-dim)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <span>DOJO</span><span>IA</span>
          </div>
        </div>
        
        <h1 className={styles.title}>Comienza tu Entrenamiento</h1>
        <p className={styles.subtitle}>Crea una cuenta familiar para acceder a todos los módulos.</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form action={signup}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="fullName">Nombre Completo del Padre/Tutor</label>
            <input 
              className={styles.input}
              id="fullName" 
              name="fullName" 
              type="text" 
              placeholder="Ej. Carlos Mendoza"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Correo Electrónico</label>
            <input 
              className={styles.input}
              id="email" 
              name="email" 
              type="email" 
              placeholder="tu@correo.com"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Contraseña (Mínimo 6 caracteres)</label>
            <input 
              className={styles.input}
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••"
              required 
              minLength={6}
            />
          </div>

          <button className={styles.submitBtn} type="submit">
            Crear Cuenta Gratis
          </button>
        </form>

        <div className={styles.linkText}>
          ¿Ya tienes una cuenta? <Link href="/login">Inicia Sesión</Link>
        </div>
      </div>
    </div>
  );
}

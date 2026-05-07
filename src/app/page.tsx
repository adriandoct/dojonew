"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Calculator, 
  MessageSquare, 
  Code2, 
  Cpu, 
  Gamepad2, 
  BookOpen, 
  PenTool, 
  Bot,
  ChevronRight,
  CheckCircle2,
  PlayCircle
} from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const modules = [
    { icon: <Calculator />, title: "DOJO MATH", desc: "Sistema matemático progresivo con ejercicios diarios adaptativos.", color: "#FF3366", level: "White to Black" },
    { icon: <MessageSquare />, title: "DOJO ENGLISH", desc: "Inglés práctico con speaking IA y reconocimiento de pronunciación.", color: "#00F0FF", level: "All Levels" },
    { icon: <Code2 />, title: "DOJO CODE", desc: "Aprende programación desde Scratch hasta Python avanzado.", color: "#10B981", level: "Logic + Syntax" },
    { icon: <Cpu />, title: "DOJO ROBOTICS", desc: "Robótica con simuladores 3D interactivos y kits físicos.", color: "#FFB800", level: "Engineering" },
    { icon: <Gamepad2 />, title: "DOJO KARATE", desc: "Valores, disciplina y defensa personal con movimientos guiados.", color: "#FF3366", level: "Mind & Body" },
    { icon: <BookOpen />, title: "DOJO READ", desc: "Lectura rápida, comprensión profunda y cuentos interactivos.", color: "#8B5CF6", level: "Comprehension" },
    { icon: <PenTool />, title: "DOJO WRITE", desc: "Escritura creativa, ensayos estructurados y concursos.", color: "#FF3366", level: "Creativity" },
    { icon: <Bot />, title: "DOJO AI COACH", desc: "Tutor IA personal 24/7 que motiva, explica y adapta tu contenido.", color: "#00F0FF", level: "Personalized" },
  ];

  const plans = [
    {
      name: "Familiar Básico",
      price: "$29",
      desc: "Perfecto para iniciar el camino del aprendizaje continuo.",
      features: ["1 Alumno", "Acceso a 3 módulos base", "Reportes mensuales", "Soporte estándar"],
      popular: false
    },
    {
      name: "Familiar Plus",
      price: "$69",
      desc: "La experiencia completa para toda la familia.",
      features: ["Hasta 3 alumnos", "Acceso a todos los módulos", "Tutor IA 24/7", "Reportes semanales en vivo", "Avatar personalizado"],
      popular: true
    },
    {
      name: "Premium Sensei",
      price: "$149",
      desc: "Para quienes buscan la máxima excelencia y acompañamiento.",
      features: ["Clases en vivo", "Mentoría personalizada", "Torneos nacionales", "Kit físico de robótica anual", "Prioridad en soporte"],
      popular: false
    }
  ];

  return (
    <main className={styles.main}>
      <header className={styles.header} style={{ background: scrolled ? 'rgba(11, 14, 20, 0.95)' : 'transparent', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
        <div className={`container ${styles.headerContent}`}>
          <div className={styles.logo}>
            <span>DOJO</span><span>IA</span>
          </div>
          <nav className={styles.nav}>
            <Link href="#como-funciona" className={styles.navLink}>Cómo funciona</Link>
            <Link href="#modulos" className={styles.navLink}>Módulos</Link>
            <Link href="#planes" className={styles.navLink}>Planes</Link>
            <Link href="#escuelas" className={styles.navLink}>Soy Escuela</Link>
          </nav>
          <div className={styles.nav}>
            <Link href="/login" className={styles.btnSecondary}>Iniciar Sesión</Link>
            <Link href="/register" className={styles.btnPrimary}>Prueba Gratis</Link>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className={`container ${styles.heroContent}`}>
          <div className={`${styles.heroText} animate-fade-in`}>
            <h1>Forma <span className="text-gradient">campeones</span><br />para el futuro</h1>
            <p>
              La evolución del aprendizaje. Combinamos la disciplina tradicional con inteligencia artificial, 
              gamificación y formación integral para desarrollar mentes brillantes y resilientes.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/register" className={styles.btnPrimary}>
                Inscribir hijo <ChevronRight size={20} />
              </Link>
              <button className={styles.btnSecondary}>
                <PlayCircle size={20} className="mr-2" /> Ver Demo
              </button>
            </div>
          </div>
          
          <div className={`${styles.heroVisual} animate-float delay-200`}>
            <div className={styles.heroDecor1}></div>
            <div className={styles.heroDecor2}></div>
            
            <div className={styles.heroCard}>
              <div className={styles.statsRow}>
                <div className={styles.stat}>
                  <div className={styles.statValue}>Black</div>
                  <div className={styles.statLabel}>Current Level</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>1,450</div>
                  <div className={styles.statLabel}>Dojicoins</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>Top 5%</div>
                  <div className={styles.statLabel}>Ranking</div>
                </div>
              </div>
              
              <div className={styles.aiCoach}>
                <div className={styles.aiIcon}>
                  <Bot size={24} />
                </div>
                <div className={styles.aiText}>
                  <h4>AI Sensei dice:</h4>
                  <p>¡Excelente trabajo en Álgebra hoy! Estás a solo 3 misiones de desbloquear la insignia de "Master Logic". ¿Continuamos con Programación?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modulos" className={styles.modules}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>8 Caminos hacia la <span className="text-gradient">Excelencia</span></h2>
            <p>Rutas progresivas por niveles donde cada alumno avanza a su propio ritmo, desbloqueando retos e insignias.</p>
          </div>
          
          <div className={styles.modulesGrid}>
            {modules.map((mod, i) => (
              <div key={i} className={`${styles.moduleCard} animate-fade-in`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.moduleIcon} style={{ background: `${mod.color}15`, color: mod.color }}>
                  {mod.icon}
                </div>
                <h3>{mod.title}</h3>
                <p>{mod.desc}</p>
                <div className={styles.moduleLevel}>
                  <div className={styles.levelDot} style={{ background: mod.color }}></div>
                  {mod.level}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className={styles.philosophy}>
        <div className={`container ${styles.philGrid}`}>
          <div className={styles.philImage}>
            <div className={styles.philImageCircle}></div>
            <div className={styles.philImageCircleInner}></div>
            <div className={styles.philLogo}>
              DOJO<span style={{color: 'var(--dojo-red)'}}>IA</span>
            </div>
          </div>
          
          <div className={styles.philContent}>
            <h2>Disciplina + Conocimiento + <span className="text-gradient-blue">Futuro</span></h2>
            <p>
              Inspirados en la constancia de Kumon, el engagement de Duolingo y la tecnología del futuro. 
              Formamos niños y jóvenes fuertes en mente, cuerpo y conocimiento.
            </p>
            
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Bot size={24} />
                </div>
                <div className={styles.featureText}>
                  <h4>IA Personalizada</h4>
                  <p>Un tutor 24/7 que adapta la dificultad, explica conceptos fallidos y motiva constantemente.</p>
                </div>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.featureIcon} style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--dojo-blue)'}}>
                  <Gamepad2 size={24} />
                </div>
                <div className={styles.featureText}>
                  <h4>Gamificación Extrema</h4>
                  <p>Cintas virtuales, torneos nacionales, monedas DOJICOIN y avatares para máxima retención.</p>
                </div>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.featureIcon} style={{ background: 'rgba(255, 184, 0, 0.1)', color: 'var(--dojo-gold)'}}>
                  <CheckCircle2 size={24} />
                </div>
                <div className={styles.featureText}>
                  <h4>Reportes para Padres</h4>
                  <p>Dashboard en tiempo real con progresos, tiempo de estudio y recomendaciones algorítmicas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="planes" className={styles.plans}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Invierte en su <span className="text-gradient">Futuro</span></h2>
            <p>Planes diseñados para adaptarse a cada familia o institución educativa.</p>
          </div>
          
          <div className={styles.plansGrid}>
            {plans.map((plan, i) => (
              <div key={i} className={`${styles.planCard} ${plan.popular ? styles.popular : ''}`}>
                {plan.popular && <div className={styles.popularBadge}>MÁS ELEGIDO</div>}
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  {plan.price}<span>/mes</span>
                </div>
                <p style={{ color: 'var(--dojo-white-dim)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                  {plan.desc}
                </p>
                <ul className={styles.planFeatures}>
                  {plan.features.map((feat, j) => (
                    <li key={j}>
                      <CheckCircle2 size={20} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button className={plan.popular ? styles.btnPrimary : styles.btnSecondary}>
                  Seleccionar Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaInner}>
            <h2>¿Listo para el primer paso en el <span className="text-gradient">DOJO</span>?</h2>
            <p>Únete a miles de padres que están transformando la educación de sus hijos con el modelo del futuro.</p>
            <div className={styles.ctaButtons}>
              <Link href="/register" className={styles.btnPrimary} style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
                Comenzar Prueba Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div>
              <div className={styles.footerLogo}>
                <span>DOJO</span><span>IA</span>
              </div>
              <p>Formando niños y jóvenes fuertes en mente, cuerpo y conocimiento a través de IA y disciplina.</p>
            </div>
            
            <div className={styles.footerCol}>
              <h4>Plataforma</h4>
              <ul>
                <li><Link href="#">Módulos</Link></li>
                <li><Link href="#">Metodología</Link></li>
                <li><Link href="#">Precios</Link></li>
                <li><Link href="#">App Móvil</Link></li>
              </ul>
            </div>
            
            <div className={styles.footerCol}>
              <h4>Recursos</h4>
              <ul>
                <li><Link href="#">Para Padres</Link></li>
                <li><Link href="#">Para Escuelas</Link></li>
                <li><Link href="#">Blog</Link></li>
                <li><Link href="#">Soporte</Link></li>
              </ul>
            </div>
            
            <div className={styles.footerCol}>
              <h4>Legal</h4>
              <ul>
                <li><Link href="#">Términos de Servicio</Link></li>
                <li><Link href="#">Privacidad</Link></li>
                <li><Link href="#">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <p>&copy; {new Date().getFullYear()} DOJOIA Education. Todos los derechos reservados.</p>
            <p>Made with ⚡ for the future.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

import { createClient } from "@/utils/supabase/server";
import styles from "../dashboard.module.css";
import { Bot, Calculator, MessageSquare, Code2, Cpu, Gamepad2, BookOpen, PenTool, Play } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // En una app real, traeríamos el progreso de student_progress
  const modules = [
    { icon: <Calculator />, title: "DOJO MATH", belt: "Yellow Belt", progress: 65, color: "#FF3366" },
    { icon: <MessageSquare />, title: "DOJO ENGLISH", belt: "White Belt", progress: 20, color: "#00F0FF" },
    { icon: <Code2 />, title: "DOJO CODE", belt: "White Belt", progress: 10, color: "#10B981" },
    { icon: <Cpu />, title: "DOJO ROBOTICS", belt: "Locked", progress: 0, color: "#FFB800" },
    { icon: <Gamepad2 />, title: "DOJO KARATE", belt: "Orange Belt", progress: 85, color: "#FF3366" },
    { icon: <BookOpen />, title: "DOJO READ", belt: "White Belt", progress: 40, color: "#8B5CF6" },
    { icon: <PenTool />, title: "DOJO WRITE", belt: "Locked", progress: 0, color: "#FF3366" },
  ];

  return (
    <div>
      <div className={styles.topbar}>
        <div className={styles.greeting}>
          <h1>Hola, {user?.user_metadata?.full_name?.split(' ')[0] || "Campeón"}</h1>
          <p>Tu entrenamiento de hoy te espera.</p>
        </div>
        
        <div className={styles.statsBar}>
          <div className={`${styles.statBadge} ${styles.belt}`}>
            <div className={styles.beltCircle}></div>
            Cinta Blanca Avanzada
          </div>
          <div className={`${styles.statBadge} ${styles.coins}`}>
            <span style={{ fontSize: '1.2rem' }}>🪙</span>
            1,450 DJC
          </div>
        </div>
      </div>

      <div className={styles.aiWidget}>
        <div className={styles.aiIcon}>
          <Bot size={32} />
        </div>
        <div className={styles.aiContent}>
          <h3>Sensei IA dice:</h3>
          <p>
            ¡Gran trabajo ayer en Matemáticas! Estás muy cerca de conseguir tu Cinta Amarilla. 
            Te he preparado un reto especial de 5 minutos. ¿Te atreves?
          </p>
        </div>
        <button className={styles.aiActionBtn}>
          Aceptar Reto
        </button>
      </div>

      <div className={styles.modulesHeader}>
        <h2>Los 8 Caminos</h2>
      </div>

      <div className={styles.grid}>
        {modules.map((mod, i) => (
          <div key={i} className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <div className={styles.moduleIcon} style={{ background: `${mod.color}20`, color: mod.color }}>
                {mod.icon}
              </div>
              <div className={styles.moduleBelt}>
                {mod.belt}
              </div>
            </div>
            
            <h3 className={styles.moduleTitle}>{mod.title}</h3>
            
            <div className={styles.progressBarContainer}>
              <div className={styles.progressHeader}>
                <span>Progreso hacia siguiente nivel</span>
                <span>{mod.progress}%</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${mod.progress}%`, background: mod.progress > 0 ? mod.color : 'rgba(255,255,255,0.1)' }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

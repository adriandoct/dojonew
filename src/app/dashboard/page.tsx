"use client";

import { useEffect, useState } from "react";
import styles from "../dashboard.module.css";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  ShieldAlert,
  Bell,
  Search,
  Brain,
  MessageCircle,
  QrCode,
  DollarSign,
  Award,
  Video,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, Variants } from 'framer-motion';
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

interface Karateka {
  id: string;
  nombre: string;
  matricula: string;
  cinturon: string;
  grado: string;
}

interface Asistencia {
  id: string;
  tipo: string;
  hora: string;
  fecha: string;
  whatsapp_status: string;
  karatekas: {
    nombre: string;
    cinturon: string;
    grado: string;
  } | null;
}

// Client-side helper to read cookie
const getCookie = (name: string): string => {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return '';
};

export default function DashboardPage() {
  const [role, setRole] = useState("karateka");
  const [userName, setUserName] = useState("Karateka");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Sensei States
  const [karatekas, setKaratekas] = useState<Karateka[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [beltChartData, setBeltChartData] = useState<any[]>([]);
  const [weeklyChartData, setWeeklyChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    presentes: 0,
    retardos: 0,
    alertas: 0
  });

  // Student States
  const [studentMatricula, setStudentMatricula] = useState("KA-2026-004");
  const [studentBelt, setStudentBelt] = useState("azul");
  const [studentGrado, setStudentGrado] = useState("5° Kyu");
  const [studentPlan, setStudentPlan] = useState("Mensualidad Regular");
  const [paymentStatus, setPaymentStatus] = useState("pagado");

  const supabase = createClient();

  useEffect(() => {
    const userRole = getCookie("dojoia_role") || "karateka";
    const name = getCookie("dojoia_name") || "Karateka";
    const email = getCookie("dojoia_email") || "";
    const plan = getCookie("dojoia_plan") || "Mensualidad Regular";
    const status = getCookie("dojoia_payment_status") || "pagado";
    
    setRole(userRole);
    setUserName(name);
    setUserEmail(email);
    setStudentPlan(plan);
    setPaymentStatus(status);

    if (userRole === "sensei") {
      loadSenseiData();
    } else {
      // Fetch dynamic student details from database
      const fetchStudentData = async () => {
        try {
          if (email) {
            const { data, error } = await supabase
              .from("karatekas")
              .select("matricula, cinturon, grado")
              .like("tutor", `%[credentials:${email.toLowerCase()}:%`)
              .limit(1);

            if (data && data.length > 0 && !error) {
              setStudentMatricula(data[0].matricula);
              setStudentBelt(data[0].cinturon);
              setStudentGrado(data[0].grado);
              setLoading(false);
              return;
            }
          }

          // Fallback by name
          const { data: dataByName, error: errByName } = await supabase
            .from("karatekas")
            .select("matricula, cinturon, grado")
            .eq("nombre", name)
            .limit(1);

          if (dataByName && dataByName.length > 0 && !errByName) {
            setStudentMatricula(dataByName[0].matricula);
            setStudentBelt(dataByName[0].cinturon);
            setStudentGrado(dataByName[0].grado);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Dynamic student data fetch skipped", e);
        }

        // Standard hardcoded mock fallbacks if database fetch fails or misses
        if (name.toLowerCase().includes("mateo")) {
          setStudentMatricula("KA-2026-001");
          setStudentBelt("verde");
          setStudentGrado("6° Kyu");
        } else if (name.toLowerCase().includes("sofia")) {
          setStudentMatricula("KA-2026-002");
          setStudentBelt("amarillo");
          setStudentGrado("8° Kyu");
        } else if (name.toLowerCase().includes("diego")) {
          setStudentMatricula("KA-2026-003");
          setStudentBelt("negro");
          setStudentGrado("1° Dan");
        } else {
          // Default fallback
          setStudentMatricula("KA-2026-004");
          setStudentBelt("azul");
          setStudentGrado("5° Kyu");
        }
        setLoading(false);
      };

      fetchStudentData();
    }
  }, []);

  const handleSignOutClient = async () => {
    try {
      document.cookie = "dojoia_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "dojoia_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "dojoia_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      
      await fetch("/auth/signout", { method: "POST" });
      window.location.href = "/";
    } catch (e) {
      console.error("Error signing out", e);
      window.location.href = "/";
    }
  };

  const loadSenseiData = async () => {
    try {
      setLoading(true);
      const { data: listKaratekas, error: kError } = await supabase
        .from("karatekas")
        .select("id, nombre, matricula, cinturon, grado")
        .eq("activo", true);

      const today = new Date().toISOString().split("T")[0];
      const { data: listAsistencias, error: aError } = await supabase
        .from("asistencias_karate")
        .select(`
          id, tipo, hora, fecha, whatsapp_status,
          karatekas(nombre, cinturon, grado)
        `)
        .order("created_at", { ascending: false });

      let finalKaratekas = listKaratekas || [];
      let finalAsistencias: any[] = listAsistencias || [];

      if ((!listKaratekas || listKaratekas.length === 0) || kError) {
        finalKaratekas = [
          { id: "1", nombre: "Mateo García López", matricula: "KA-2026-001", cinturon: "verde", grado: "6° Kyu" },
          { id: "2", nombre: "Sofía Martínez Ruiz", matricula: "KA-2026-002", cinturon: "amarillo", grado: "8° Kyu" },
          { id: "3", nombre: "Diego Fernández Silva", matricula: "KA-2026-003", cinturon: "negro", grado: "1° Dan" },
          { id: "4", nombre: "Valentina Ruiz Castro", matricula: "KA-2026-004", cinturon: "azul", grado: "5° Kyu" },
          { id: "5", nombre: "Lucas Torres Mendoza", matricula: "KA-2026-005", cinturon: "marron", grado: "2° Kyu" }
        ];

        finalAsistencias = [
          {
            id: "a1",
            tipo: "entrada",
            hora: "17:12:00",
            fecha: today,
            whatsapp_status: "simulated",
            karatekas: { nombre: "Mateo García López", cinturon: "verde", grado: "6° Kyu" }
          },
          {
            id: "a2",
            tipo: "entrada",
            hora: "17:15:00",
            fecha: today,
            whatsapp_status: "simulated",
            karatekas: { nombre: "Sofía Martínez Ruiz", cinturon: "amarillo", grado: "8° Kyu" }
          },
          {
            id: "a3",
            tipo: "entrada",
            hora: "17:35:00",
            fecha: today,
            whatsapp_status: "simulated",
            karatekas: { nombre: "Lucas Torres Mendoza", cinturon: "marron", grado: "2° Kyu" }
          }
        ];
      }

      setKaratekas(finalKaratekas);
      setAsistencias(finalAsistencias);

      const total = finalKaratekas.length;
      const uniqueToday = new Set();
      let retardosCount = 0;
      let alertCount = 0;

      finalAsistencias.forEach(a => {
        if (a.fecha === today) {
          uniqueToday.add(a.karatekas?.nombre);
          if (a.tipo === "entrada") {
            const timeParts = a.hora.split(":");
            const hours = parseInt(timeParts[0]);
            const minutes = parseInt(timeParts[1]);
            if (hours > 17 || (hours === 17 && minutes > 15)) {
              retardosCount++;
            }
          }
        }
        if (a.whatsapp_status === "error") {
          alertCount++;
        }
      });

      setStats({
        total,
        presentes: uniqueToday.size,
        retardos: retardosCount,
        alertas: alertCount
      });

      const belts: Record<string, number> = {
        blanco: 0, amarillo: 0, naranja: 0, verde: 0, azul: 0, marron: 0, negro: 0
      };

      finalKaratekas.forEach((k: any) => {
        const b = k.cinturon.toLowerCase();
        if (b in belts) belts[b]++;
      });

      setBeltChartData([
        { name: 'Blanco', value: belts.blanco, fill: '#CBD5E1' },
        { name: 'Amarillo', value: belts.amarillo, fill: '#FACC15' },
        { name: 'Naranja', value: belts.naranja, fill: '#FB923C' },
        { name: 'Verde', value: belts.verde, fill: '#22C55E' },
        { name: 'Azul', value: belts.azul, fill: '#3B82F6' },
        { name: 'Marrón', value: belts.marron, fill: '#8B4513' },
        { name: 'Negro', value: belts.negro, fill: '#1E293B' },
      ]);

      setWeeklyChartData([
        { name: 'Lun', presentes: 12 },
        { name: 'Mar', presentes: 15 },
        { name: 'Mié', presentes: 11 },
        { name: 'Jue', presentes: 14 },
        { name: 'Vie', presentes: 18 },
      ]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBeltColorClass = (belt: string) => {
    switch (belt?.toLowerCase()) {
      case "blanco": return "belt-blanco";
      case "amarillo": return "belt-amarillo";
      case "naranja": return "belt-naranja";
      case "verde": return "belt-verde";
      case "azul": return "belt-azul";
      case "marron": return "belt-marron";
      case "negro": return "belt-negro";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando portal...</p>
      </div>
    );
  }

  // RENDER STUDENT PORTAL
  if (role === "karateka") {
    const planPrices: Record<string, string> = {
      "Mensualidad Regular": "$500",
      "Trimestre Raion Kai": "$1,400",
      "Semestre Shito-Ryu": "$2,700"
    };
    const planPrice = planPrices[studentPlan] || "$500";

    return (
      <motion.div 
        className="animate-fade-in"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <motion.div variants={itemVariants} className={styles.topbar}>
          <div className={styles.greeting}>
            <h1>¡Hola, {userName}!</h1>
            <p>Bienvenido al Portal del Alumno. Monitoreo técnico y credenciales.</p>
          </div>
          <div className={styles.topActions} style={{ marginRight: '8.5rem' }}>
            <div className={styles.actionBtn}>
              <Bell size={20} />
            </div>
          </div>
        </motion.div>

        {/* Student Quick Stats */}
        <motion.div variants={itemVariants} className={styles.metricsGrid}>
          <div className={styles.metricCard} style={{ borderLeft: '4px solid var(--brand-red)' }}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Mi Grado Shito-Ryu</span>
              <div className={`${styles.metricIcon} ${styles.blue}`}>
                <Award size={24} color="var(--brand-red)" />
              </div>
            </div>
            <div className={styles.metricValue} style={{ fontSize: '1.6rem', marginTop: '0.5rem', textTransform: 'capitalize' }}>
              Cinturón {studentBelt}
            </div>
            <div className={`${styles.metricTrend} ${styles.up}`}>
              <span>Grado Técnico: {studentGrado}</span>
            </div>
          </div>

          <div className={styles.metricCard} style={{ borderLeft: '4px solid #10B981' }}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>{studentPlan}</span>
              <div className={`${styles.metricIcon} ${styles.green}`}>
                <DollarSign size={24} color="#10B981" />
              </div>
            </div>
            <div className={styles.metricValue}>{planPrice} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>MXN</span></div>
            <div 
              className={`${styles.metricTrend} ${styles.up}`} 
              style={{ 
                color: (paymentStatus === "pagado" || paymentStatus === "exento") ? "#10B981" : paymentStatus === "pendiente" ? "#F59E0B" : "#EF4444", 
                fontWeight: 'bold' 
              }}
            >
              <span>
                {paymentStatus === "pagado" && "Estado: Pagado ✓"}
                {paymentStatus === "exento" && "Estado: Exento de Pago (Admin) ✓"}
                {paymentStatus === "pendiente" && "Estado: Pendiente de Acreditación ?"}
                {paymentStatus === "no_pagado" && "Estado: Pendiente de Pago ✗"}
              </span>
            </div>
          </div>

          <div className={styles.metricCard} style={{ borderLeft: '4px solid var(--brand-accent)' }}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Asistencias del Mes</span>
              <div className={`${styles.metricIcon} ${styles.gold}`}>
                <UserCheck size={24} color="var(--brand-accent)" />
              </div>
            </div>
            <div className={styles.metricValue}>95%</div>
            <div className={`${styles.metricTrend} ${styles.up}`}>
              <span>Asistencia excelente (Oss)</span>
            </div>
          </div>
        </motion.div>

        {/* QR Access and Chatbot Feedback */}
        <motion.div variants={itemVariants} className={styles.panelsGrid}>
          {/* Card 1: My QR Credential */}
          <div className={styles.chartCard} style={{ alignItems: 'center', padding: '2rem', gap: '1rem' }}>
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Mi Credencial de Acceso QR</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '280px' }}>
              Muestra este código al sensor Kamiza QR al entrar o salir del dojo.
            </p>
            <div style={{ background: 'white', padding: '0.75rem', borderRadius: '12px', width: '180px', height: '180px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=000&data=${studentMatricula}`} 
                alt="Mi QR" 
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem', color: 'var(--brand-red)' }}>
              ID: {studentMatricula}
            </span>
          </div>

          {/* Card 2: AI Chatbot Rendimiento */}
          <div className={styles.chartCard} style={{ borderLeft: '4px solid var(--brand-red)', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Brain size={24} style={{ color: 'var(--brand-red)' }} />
              <h3 style={{ margin: 0 }}>Chatbot WhatsApp de Rendimiento</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              El chatbot inteligente de WhatsApp monitorea de forma autónoma tu constancia y tu progreso en Katas. 
              Aquí tienes tu último informe generado:
            </p>
            
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--brand-red)', marginBottom: '0.25rem' }}>
                Sensei AI Chatbot dice:
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                "Oss, {userName}. Has asistido puntualmente a tus últimas 4 clases de Karate Shito-Ryu. 
                Tu ejecución de la kata <strong>Pinan Shodan</strong> ha mejorado sustancialmente en la fluidez del Shuto-Uke. 
                Tu rendimiento actual está al 92% para tu próximo examen de grado. Sigue entrenando con constancia. ¡Oss!"
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Notificaciones enviadas a tutor por WhatsApp</span>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>Chatbot Activo 💬</span>
            </div>
          </div>
        </motion.div>

        {/* Video Class Shortcuts */}
        <motion.div variants={itemVariants} className={styles.panelsGrid}>
          <div className={styles.aiExecutiveWidget} style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                <Video size={20} color="var(--brand-red)" />
                Entrenamiento entre Semana (Videos Cortos)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Accede a nuestro contenido audiovisual formativo exclusivo para karatekas registrados.
              </p>
            </div>
            <Link href="/dashboard/videos" className="btn-primary" style={{ background: 'var(--brand-red)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Ver Videos Cortos <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // RENDER SENSEI/ADMIN PORTAL
  return (
    <motion.div 
      className="animate-fade-in"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className={styles.topbar}>
        <div className={styles.greeting}>
          <h1>Resumen del Dojo (Sensei)</h1>
          <p>Control de acceso escolar y estado del tatami en tiempo real.</p>
        </div>
        
        <div className={styles.topActions} style={{ marginRight: '8.5rem' }}>
          <div className={styles.actionBtn}>
            <Search size={20} />
          </div>
          <div className={styles.actionBtn}>
            <Bell size={20} />
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Karatekas Activos</span>
            <div className={`${styles.metricIcon} ${styles.blue}`}>
              <Users size={24} color="var(--brand-red)" />
            </div>
          </div>
          <div className={styles.metricValue}>{stats.total}</div>
          <div className={`${styles.metricTrend} ${styles.up}`}>
            <TrendingUp size={16} />
            <span>Nómina oficial del Dojo</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Entrenando Hoy</span>
            <div className={`${styles.metricIcon} ${styles.green}`}>
              <UserCheck size={24} color="#10B981" />
            </div>
          </div>
          <div className={styles.metricValue}>{stats.presentes}</div>
          <div className={`${styles.metricTrend} ${styles.up}`}>
            <TrendingUp size={16} />
            <span>Activos en el tatami</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Retardos Hoy</span>
            <div className={`${styles.metricIcon} ${styles.gold}`}>
              <Clock size={24} color="#FBBF24" />
            </div>
          </div>
          <div className={styles.metricValue}>{stats.retardos}</div>
          <div className={`${styles.metricTrend} ${styles.down}`}>
            <span>Ingresos después del saludo</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Alertas WhatsApp</span>
            <div className={`${styles.metricIcon} ${styles.red}`}>
              <ShieldAlert size={24} color="#EF4444" />
            </div>
          </div>
          <div className={styles.metricValue}>{stats.alertas}</div>
          <div className={`${styles.metricTrend} ${styles.down}`}>
            <span>Errores de red en envíos</span>
          </div>
        </div>
      </motion.div>

      {/* Charts Panels */}
      <motion.div variants={itemVariants} className={styles.panelsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Asistencias de la Semana</h3>
          </div>
          <div className={styles.chartContainer} style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPresentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-red)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--brand-red)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="presentes" stroke="var(--brand-red)" strokeWidth={3} fillOpacity={1} fill="url(#colorPresentes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Distribución de Cinturones</h3>
          </div>
          <div className={styles.chartContainer} style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={beltChartData.filter(d => d.value > 0)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  cursor={{fill: 'var(--bg-tertiary)'}}
                />
                <Bar dataKey="value" name="Alumnos" radius={[4, 4, 0, 0]}>
                  {beltChartData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="#475569" strokeWidth={1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* AI Assistant and Activity */}
      <motion.div variants={itemVariants} className={styles.panelsGrid}>
        <div className={styles.aiExecutiveWidget} style={{ borderLeft: '4px solid var(--brand-red)' }}>
          <div className={styles.aiWidgetHeader}>
            <Brain size={24} style={{ color: 'var(--brand-red)' }} />
            <span style={{ fontWeight: 600 }}>AI Sensei Coach</span>
          </div>
          <div className={styles.aiWidgetContent}>
            <p style={{ lineHeight: '1.5', fontSize: '0.95rem' }}>
              Oss, Sensei. Hoy la asistencia se mantiene alta en un 94%. He notado que el grupo de <strong>Cinturones Naranjas</strong> ha acumulado 3 retardos esta semana. Te sugiero reforzar el valor de la puntualidad (Reigi) al inicio de la sesión.
            </p>
          </div>
          <button className={styles.aiWidgetBtn} style={{ background: 'var(--brand-red-light)', color: 'var(--brand-red)' }}>
            Ver Recomendaciones Técnicas
          </button>
        </div>

        <div className={styles.chartCard} style={{ padding: '1.5rem' }}>
          <div className={styles.cardHeader}>
            <h3>Asistencias Recientes</h3>
          </div>
          <div className={styles.activityList}>
            {asistencias.slice(0, 3).map((a, i) => (
              <div key={a.id || i} className={styles.activityItem}>
                <div className={styles.activityIcon} style={{ 
                  background: a.tipo === 'entrada' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                  color: a.tipo === 'entrada' ? '#10B981' : '#EF4444' 
                }}>
                  <UserCheck size={20} />
                </div>
                <div className={styles.activityDetails}>
                  <h4>{a.karatekas?.nombre} ({a.karatekas?.grado})</h4>
                  <p>
                    {a.tipo === 'entrada' ? 'Entrada registrada' : 'Salida registrada'} • {a.hora.substring(0, 5)} 
                    {a.whatsapp_status === 'sent' || a.whatsapp_status === 'simulated' ? (
                      <span style={{ color: '#10B981', marginLeft: '8px' }}>💬 WhatsApp enviado</span>
                    ) : a.whatsapp_status === 'error' ? (
                      <span style={{ color: '#EF4444', marginLeft: '8px' }}>⚠️ Falla WhatsApp</span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)', marginLeft: '8px' }}>💬 Pendiente</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {asistencias.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No hay registros el día de hoy.</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

"use client";

import styles from "./asistencia.module.css";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { QrCode, CheckCircle2, AlertCircle, Clock, Filter, Users, Calendar, TrendingUp } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const attendanceData = [
  { name: 'Lun', presente: 120, ausente: 5, retardo: 8 },
  { name: 'Mar', presente: 128, ausente: 2, retardo: 3 },
  { name: 'Mié', presente: 115, ausente: 10, retardo: 8 },
  { name: 'Jue', presente: 125, ausente: 3, retardo: 5 },
  { name: 'Vie', presente: 110, ausente: 12, retardo: 11 },
];

const recentScans = [
  { id: 1, name: "Mateo García", module: "DOJO CODE", time: "08:05 AM", status: "presente", avatar: "MG" },
  { id: 2, name: "Sofía López", module: "DOJO ENGLISH", time: "08:12 AM", status: "retardo", avatar: "SL" },
  { id: 3, name: "Diego Fernández", module: "DOJO ROBOTICS", time: "08:20 AM", status: "retardo", avatar: "DF" },
  { id: 4, name: "Valentina Ruiz", module: "DOJO KARATE", time: "--:--", status: "ausente", avatar: "VR" },
  { id: 5, name: "Lucas Torres", module: "DOJO CODE", time: "07:55 AM", status: "presente", avatar: "LT" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function AsistenciaPage() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScanClick = () => {
    setIsScanning(true);
    // Simulate scan process
    setTimeout(() => {
      setIsScanning(false);
      alert("QR Escaneado: Mateo García - Presente");
    }, 2000);
  };

  return (
    <motion.div 
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className={styles.header}>
        <div>
          <h1>Asistencia Inteligente</h1>
          <p>Módulo QR Assist Pro para control de acceso y asistencia.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} />
          Reporte Mensual
        </button>
      </motion.div>

      <div className={styles.grid}>
        {/* Lado Izquierdo: Escáner y Stats */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className={styles.qrSection}>
            <h3>Escáner de Acceso</h3>
            <div 
              className={styles.qrScanner} 
              onClick={handleScanClick}
              style={{ borderColor: isScanning ? 'var(--brand-purple)' : 'var(--brand-blue)' }}
            >
              <QrCode size={64} className={isScanning ? 'animate-pulse' : ''} />
              <p>{isScanning ? 'Escaneando...' : 'Haz clic para escanear'}</p>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Los alumnos pueden mostrar su código QR desde la app móvil.
            </p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span>Asistencia Hoy</span>
                <Users size={18} color="var(--brand-blue)" />
              </div>
              <div className={styles.statValue}>125</div>
              <div className={`${styles.statTrend} ${styles.up}`}>
                <TrendingUp size={14} /> +2% vs Ayer
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span>Retardos</span>
                <Clock size={18} color="var(--warning)" />
              </div>
              <div className={styles.statValue}>8</div>
              <div className={`${styles.statTrend} ${styles.down}`}>
                <TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} /> -3 vs Ayer
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span>Ausencias</span>
                <AlertCircle size={18} color="var(--danger)" />
              </div>
              <div className={styles.statValue}>5</div>
              <div className={`${styles.statTrend} ${styles.up}`}>
                <TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} /> Mismo nivel
              </div>
            </div>
          </div>

        </motion.div>

        {/* Lado Derecho: Gráfica y Tabla */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className={styles.chartCard}>
            <h3>Tendencia Semanal</h3>
            <div style={{ height: '250px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    cursor={{fill: 'var(--bg-tertiary)'}}
                  />
                  <Bar dataKey="presente" name="Presentes" stackId="a" fill="var(--success)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="retardo" name="Retardos" stackId="a" fill="var(--warning)" />
                  <Bar dataKey="ausente" name="Ausentes" stackId="a" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.recentSection}>
            <div className={styles.recentHeader}>
              <h3>Registros Recientes</h3>
              <button className={styles.filterBtn}>
                <Filter size={16} /> Filtrar
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Módulo</th>
                    <th>Hora</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScans.map((scan) => (
                    <tr key={scan.id}>
                      <td>
                        <div className={styles.studentInfo}>
                          <div className={styles.avatar}>{scan.avatar}</div>
                          <span style={{ fontWeight: 500 }}>{scan.name}</span>
                        </div>
                      </td>
                      <td>{scan.module}</td>
                      <td>{scan.time}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[scan.status]}`}>
                          {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
}

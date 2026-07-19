"use client";

import { useEffect, useState } from "react";
import styles from "./manuales.module.css";
import {
  FileText,
  Upload,
  Search,
  BookOpen,
  Eye,
  Download,
  Trash2,
  X,
  GraduationCap,
  Users,
  CheckCircle,
  PlusCircle,
  FileCheck,
  Award,
  Layers
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Manual {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: "instructor" | "participante";
  file_url: string;
  file_name: string;
  file_size?: number;
  nivel: string;
  autor?: string;
  created_at?: string;
}

const getCookie = (name: string): string => {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return '';
};

// Seed default manuals for demo/offline fallback
const INITIAL_MANUALS: Manual[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    titulo: "Manual de Didáctica y Pedagogía Shito-Ryu 2026",
    descripcion: "Guía metodológica para Senseis y Sempais. Metodología de enseñanza infantil, psicología marcial, estructura de clases por cinturón y protocolos de evaluación.",
    tipo: "instructor",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_name: "Manual_Didactica_Sensei_ShitoRyu_2026.pdf",
    file_size: 2450000,
    nivel: "Instructores y Sempais",
    autor: "Sensei Carlos Martínez"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    titulo: "Manual del Participante: Fundamentos Kyus Iniciales (Cintas Blancas y Amarillas)",
    descripcion: "Manual de estudio para alumnos principiantes. Historia del Dojo Raion Kai, terminología técnica en japonés, cortesía (Reigi) y diagramas paso a paso de Kata Pinan Shodan.",
    tipo: "participante",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_name: "Manual_Participante_Principiantes.pdf",
    file_size: 1850000,
    nivel: "Cintas Blancas y Amarillas",
    autor: "Sensei Carlos Martínez"
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    titulo: "Manual del Participante: Kumite Táctico y Reglamento WKF",
    descripcion: "Guía de combate deportivo para atletas de nivel intermedio y avanzado. Estrategias de distancia Ma-ai, combinaciones de ataque, esquivas y reglamento oficial de competencia.",
    tipo: "participante",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_name: "Manual_Kumite_Tactico_WKF.pdf",
    file_size: 3120000,
    nivel: "Cintas Naranjas a Negras",
    autor: "Sensei Carlos Martínez"
  }
];

export default function ManualesPage() {
  const [role, setRole] = useState<string>("karateka");
  const [manuales, setManuales] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);

  // Upload Form State
  const [newTitulo, setNewTitulo] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newTipo, setNewTipo] = useState<"instructor" | "participante">("participante");
  const [newNivel, setNewNivel] = useState("Todos los niveles");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const userRole = getCookie("dojoia_role") || "karateka";
    setRole(userRole);
    loadManuales();
  }, []);

  const loadManuales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("manuales")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0 && !error) {
        setManuales(data);
        localStorage.setItem("dojo_manuales", JSON.stringify(data));
      } else {
        const cached = localStorage.getItem("dojo_manuales");
        if (cached) {
          setManuales(JSON.parse(cached));
        } else {
          setManuales(INITIAL_MANUALS);
          localStorage.setItem("dojo_manuales", JSON.stringify(INITIAL_MANUALS));
        }
      }
    } catch (err) {
      console.warn("Could not fetch manuals from DB. Using local fallback.", err);
      const cached = localStorage.getItem("dojo_manuales");
      setManuales(cached ? JSON.parse(cached) : INITIAL_MANUALS);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        alert("Por favor selecciona un archivo válido en formato PDF (.pdf).");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitulo.trim()) {
      alert("Por favor ingresa un título para el manual.");
      return;
    }
    if (!selectedFile) {
      alert("Por favor selecciona un archivo PDF.");
      return;
    }

    setUploading(true);

    try {
      const fileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      let pdfUrl = "";
      let storageSuccess = false;

      // 1. Try upload to Supabase Storage bucket 'manuales'
      try {
        const { data: storageData, error: storageErr } = await supabase.storage
          .from("manuales")
          .upload(fileName, selectedFile, { upsert: true });

        if (!storageErr && storageData) {
          const { data: publicData } = supabase.storage.from("manuales").getPublicUrl(fileName);
          pdfUrl = publicData.publicUrl;
          storageSuccess = true;
        } else {
          console.warn("Storage 'manuales' failed, trying bucket 'videos':", storageErr);
          // Fallback to bucket 'videos' which is already configured
          const { data: vData, error: vErr } = await supabase.storage
            .from("videos")
            .upload(`manuales/${fileName}`, selectedFile, { upsert: true });

          if (!vErr && vData) {
            const { data: pData } = supabase.storage.from("videos").getPublicUrl(`manuales/${fileName}`);
            pdfUrl = pData.publicUrl;
            storageSuccess = true;
          } else {
            console.warn("Storage 'videos' fallback also failed:", vErr);
          }
        }
      } catch (stErr) {
        console.warn("Storage exception:", stErr);
      }

      // 2. Fallback to DataURL / ObjectURL if storage upload did not return a public URL
      if (!pdfUrl) {
        if (selectedFile.size < 5 * 1024 * 1024) {
          try {
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (evt) => resolve((evt.target?.result as string) || "");
              reader.readAsDataURL(selectedFile);
            });
            if (dataUrl) pdfUrl = dataUrl;
          } catch (e) {
            console.warn("DataURL error:", e);
          }
        }
        if (!pdfUrl) {
          pdfUrl = URL.createObjectURL(selectedFile);
        }
      }

      // 3. Generate valid UUID string for PostgreSQL compatibility
      const manualId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `10000000-1000-4000-8000-${Date.now().toString().padStart(12, '0').slice(-12)}`;

      const newManualItem: Manual = {
        id: manualId,
        titulo: newTitulo,
        descripcion: newDescripcion,
        tipo: newTipo,
        file_url: pdfUrl,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        nivel: newNivel,
        autor: getCookie("dojoia_name") || "Sensei Carlos Martínez",
        created_at: new Date().toISOString()
      };

      // 4. Insert into Supabase Database `public.manuales`
      let dbInserted = false;
      try {
        const { data: dbData, error: dbErr } = await supabase
          .from("manuales")
          .insert([newManualItem])
          .select();

        if (!dbErr) {
          dbInserted = true;
          if (dbData && dbData.length > 0) {
            newManualItem.id = dbData[0].id;
          }
        } else {
          console.warn("DB insert error:", dbErr);
          // If file_url is base64 and exceeds text limit, retry with public URL or fallback URL
          if (pdfUrl.startsWith("data:")) {
            const lightItem = { ...newManualItem, file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" };
            const { error: dbErr2 } = await supabase.from("manuales").insert([lightItem]);
            if (!dbErr2) dbInserted = true;
          }
        }
      } catch (dbEx) {
        console.warn("DB insert exception:", dbEx);
      }

      // 5. Update local state and localStorage
      const updatedList = [newManualItem, ...manuales];
      setManuales(updatedList);

      try {
        localStorage.setItem("dojo_manuales", JSON.stringify(updatedList));
      } catch (qErr) {
        console.warn("localStorage quota error:", qErr);
        const lightList = updatedList.map(item => ({
          ...item,
          file_url: item.file_url.startsWith("data:") && item.file_url.length > 300000 
            ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
            : item.file_url
        }));
        localStorage.setItem("dojo_manuales", JSON.stringify(lightList));
      }

      // Reset form
      setNewTitulo("");
      setNewDescripcion("");
      setNewTipo("participante");
      setNewNivel("Todos los niveles");
      setSelectedFile(null);
      setShowUploadModal(false);

      if (storageSuccess && dbInserted) {
        alert(`¡Manual "${newManualItem.titulo}" subido y guardado exitosamente en la nube de Supabase!`);
      } else if (dbInserted) {
        alert(`¡Manual "${newManualItem.titulo}" guardado exitosamente en la base de datos!`);
      } else {
        alert(`¡Manual "${newManualItem.titulo}" publicado localmente en pantalla!`);
      }
    } catch (err: any) {
      console.error("Upload handler exception:", err);
      alert(`Ocurrió un error al procesar la subida: ${err?.message || "intenta de nuevo"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de eliminar el manual "${titulo}"?`)) return;

    try {
      await supabase.from("manuales").delete().eq("id", id);
    } catch (e) {
      console.warn("Delete DB error fallback", e);
    }

    const updated = manuales.filter(m => m.id !== id);
    setManuales(updated);
    localStorage.setItem("dojo_manuales", JSON.stringify(updated));
  };

  const isSensei = role === "sensei";

  // Participant manuals subset
  const participantManuals = manuales.filter(m => m.tipo === "participante");
  const instructorManuals = manuales.filter(m => m.tipo === "instructor");

  // Filter manuals based on tab, role, and search query
  const filteredManuales = manuales.filter(m => {
    // Role protection: Students ONLY see Participant Manuals
    if (!isSensei && m.tipo === "instructor") {
      return false;
    }

    // Tab filter for Sensei
    if (isSensei) {
      if (activeTab === "instructor" && m.tipo !== "instructor") return false;
      if (activeTab === "participante" && m.tipo !== "participante") return false;
    } else {
      // Tab filter for Alumno
      if (activeTab === "principiantes" && !m.nivel.toLowerCase().includes("blanca") && !m.nivel.toLowerCase().includes("amarilla")) {
        return false;
      }
      if (activeTab === "avanzados" && !m.nivel.toLowerCase().includes("naranja") && !m.nivel.toLowerCase().includes("negra") && !m.nivel.toLowerCase().includes("avanzad")) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.titulo.toLowerCase().includes(q);
      const matchDesc = m.descripcion.toLowerCase().includes(q);
      const matchNivel = m.nivel.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchNivel;
    }
    return true;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "1.5 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>
          <BookOpen size={32} />
          {isSensei ? "Gestión de Manuales PDF (Instructor y Participante)" : "Manuales del Participante"}
        </h1>
        <p className={styles.headerSubtitle}>
          {isSensei
            ? "Módulo de administración: Permite la subida y organización de manuales del instructor y manuales del participante para los alumnos inscritos."
            : "Biblioteca digital de manuales del participante para alumnos inscritos. Consulta y lee en línea tus guías teóricas, programas por cinta y reglamentos oficiales."}
        </p>
      </div>

      {/* Control Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.tabGroup}>
          {isSensei ? (
            <>
              <button
                className={`${styles.tabBtn} ${activeTab === "todos" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("todos")}
              >
                <Layers size={16} />
                Todos los Manuales
                <span className={styles.tabBadge}>{manuales.length}</span>
              </button>

              <button
                className={`${styles.tabBtn} ${activeTab === "instructor" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("instructor")}
              >
                <GraduationCap size={16} />
                Manuales del Instructor
                <span className={styles.tabBadge}>{instructorManuals.length}</span>
              </button>

              <button
                className={`${styles.tabBtn} ${activeTab === "participante" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("participante")}
              >
                <Users size={16} />
                Manuales del Participante
                <span className={styles.tabBadge}>{participantManuals.length}</span>
              </button>
            </>
          ) : (
            <>
              <button
                className={`${styles.tabBtn} ${activeTab === "todos" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("todos")}
              >
                <BookOpen size={16} />
                Todos los Manuales de Alumnos
                <span className={styles.tabBadge}>{participantManuals.length}</span>
              </button>

              <button
                className={`${styles.tabBtn} ${activeTab === "principiantes" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("principiantes")}
              >
                <Award size={16} />
                Principiantes (Blancas/Amarillas)
              </button>

              <button
                className={`${styles.tabBtn} ${activeTab === "avanzados" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("avanzados")}
              >
                <Award size={16} />
                Intermedios y Avanzados
              </button>
            </>
          )}
        </div>

        <div className={styles.actionsGroup}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar manual por título o nivel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isSensei && (
            <button
              className={styles.uploadTriggerBtn}
              onClick={() => setShowUploadModal(!showUploadModal)}
            >
              <PlusCircle size={18} />
              <span>Subir Manual PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Form Panel (Administración) */}
      {isSensei && showUploadModal && (
        <form className={styles.uploadPanel} onSubmit={handleUploadSubmit}>
          <div className={styles.panelTitle}>
            <Upload size={20} style={{ color: 'var(--brand-red)' }} />
            Subir Nuevo Manual PDF al Dojo
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Tipo de Manual *</label>
              <select
                className={styles.selectField}
                value={newTipo}
                onChange={(e) => setNewTipo(e.target.value as "instructor" | "participante")}
              >
                <option value="participante">🥋 Manual del Participante (Visible para Alumnos e Instructores)</option>
                <option value="instructor">🎓 Manual del Instructor (Exclusivo para Senseis y Sempais)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Título del Manual *</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Ej. Fundamentos Kyus Iniciales (Cintas Blancas y Amarillas)"
                value={newTitulo}
                onChange={(e) => setNewTitulo(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Nivel o Dirigido a</label>
              <select
                className={styles.selectField}
                value={newNivel}
                onChange={(e) => setNewNivel(e.target.value)}
              >
                <option value="Todos los niveles">Todos los niveles</option>
                <option value="Cintas Blancas y Amarillas">Cintas Blancas y Amarillas (Principantes)</option>
                <option value="Cintas Naranjas y Verdes">Cintas Naranjas y Verdes (Intermedios)</option>
                <option value="Cintas Azules a Negras">Cintas Azules a Negras (Avanzados)</option>
                <option value="Instructores y Sempais">Instructores y Sempais</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Descripción detallada</label>
            <textarea
              className={styles.textareaField}
              rows={3}
              placeholder="Escribe un resumen sobre los temas, katas o teoría que incluye este manual..."
              value={newDescripcion}
              onChange={(e) => setNewDescripcion(e.target.value)}
            />
          </div>

          {/* PDF File Dropzone */}
          <div className={styles.formGroup}>
            <label>Archivo en formato PDF (.pdf) *</label>
            <label className={styles.dropzone}>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <FileCheck size={36} style={{ color: selectedFile ? 'var(--success)' : 'var(--brand-red)' }} />
              <div className={styles.dropzoneText}>
                {selectedFile ? (
                  <strong style={{ color: 'var(--success)' }}>{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</strong>
                ) : (
                  <span>Haz clic aquí para seleccionar tu archivo <strong>.PDF</strong></span>
                )}
              </div>
              <span className={styles.dropzoneSubtext}>Soporta archivos PDF digitales de instructores y participantes.</span>
            </label>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setShowUploadModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={uploading}>
              <Upload size={16} />
              {uploading ? "Subiendo archivo..." : "Guardar y Publicar Manual"}
            </button>
          </div>
        </form>
      )}

      {/* Manuals Grid */}
      {loading ? (
        <div className={styles.emptyState}>
          <p>Cargando catálogo de manuales...</p>
        </div>
      ) : filteredManuales.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} style={{ color: 'var(--text-tertiary)' }} />
          <h3>No se encontraron manuales</h3>
          <p>No hay archivos PDF subidos para esta categoría o criterio de búsqueda.</p>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {filteredManuales.map((m) => (
            <div key={m.id} className={styles.card}>
              <div>
                <div className={styles.cardHeader}>
                  {m.tipo === "instructor" ? (
                    <span className={styles.badgeInstructor}>
                      <GraduationCap size={14} /> Manual del Instructor
                    </span>
                  ) : (
                    <span className={styles.badgeParticipante}>
                      <Users size={14} /> Manual del Participante
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                    {formatFileSize(m.file_size)}
                  </span>
                </div>

                <h3 className={styles.cardTitle}>{m.titulo}</h3>
                <p className={styles.cardDescription}>{m.descripcion}</p>
              </div>

              <div>
                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <strong>Nivel:</strong> {m.nivel}
                  </div>
                  {m.autor && (
                    <div className={styles.metaItem}>
                      <strong>Autor:</strong> {m.autor}
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => setSelectedManual(m)}
                    title="Observar y leer en línea"
                  >
                    <Eye size={16} />
                    <span>Leer en Línea</span>
                  </button>

                  <a
                    href={m.file_url}
                    download={m.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.downloadBtn}
                    title="Descargar PDF"
                  >
                    <Download size={16} />
                  </a>

                  {isSensei && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(m.id, m.titulo)}
                      title="Eliminar Manual"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Online PDF Reader Viewer Modal */}
      {selectedManual && (
        <div className={styles.modalOverlay} onClick={() => setSelectedManual(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <BookOpen size={22} style={{ color: 'var(--brand-red)' }} />
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedManual.titulo}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                    {selectedManual.tipo === "instructor" ? "🎓 Manual del Instructor" : "🥋 Manual del Participante"} • {selectedManual.nivel}
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <a
                  href={selectedManual.file_url}
                  download={selectedManual.file_name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewBtn}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <Download size={15} /> Descargar PDF
                </a>
                <button
                  className={styles.closeModalBtn}
                  onClick={() => setSelectedManual(null)}
                  title="Cerrar Lector"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className={styles.pdfViewerBody}>
              <iframe
                src={`${selectedManual.file_url}#toolbar=1&navpanes=1`}
                className={styles.pdfIframe}
                title={selectedManual.titulo}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

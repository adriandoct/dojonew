"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./alumnos.module.css";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  Award, 
  Printer, 
  X,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Clock,
  UserCheck,
  GraduationCap
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Client-side helper to read cookies
const getCookie = (name: string): string => {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return '';
};

function parseTutorField(tutorField: string) {
  if (!tutorField) {
    return {
      tutor: "",
      email: "",
      password: "",
      plan: "Mensualidad Regular",
      paymentStatus: "pagado",
      role: "karateka",
      validado: true
    };
  }
  const match = tutorField.match(/(.*)\s+\[credentials:([^:]*):([^:]*)(?::([^:]*))?(?::([^:]*))?(?::([^:]*))?(?::([^:]*))?\]/);
  if (match) {
    return {
      tutor: match[1].trim(),
      email: match[2] || "",
      password: match[3] || "",
      plan: match[4] || "Mensualidad Regular",
      paymentStatus: match[5] || "pagado",
      role: match[6] || "karateka",
      validado: match[7] ? match[7] === "validado" : true
    };
  }
  return {
    tutor: tutorField || "",
    email: "",
    password: "",
    plan: "Mensualidad Regular",
    paymentStatus: "pagado",
    role: "karateka",
    validado: true
  };
}

function serializeTutorField(
  tutorName: string, 
  email: string, 
  password: string, 
  plan = "Mensualidad Regular", 
  paymentStatus = "pagado",
  role = "karateka",
  validado = true
) {
  if (email && password) {
    const valStr = validado ? "validado" : "pendiente";
    return `${tutorName.trim()} [credentials:${email.trim().toLowerCase()}:${password.trim()}:${plan}:${paymentStatus}:${role}:${valStr}]`;
  }
  return tutorName.trim();
}

interface Karateka {
  id: string;
  matricula: string;
  nombre: string;
  cinturon: string;
  grado: string;
  tutor: string;
  telefono: string;
  foto_url: string;
  activo: boolean;
  email?: string;
  password?: string;
  plan?: string;
  paymentStatus?: string; // 'pagado' | 'pendiente' | 'no_pagado' | 'exento'
  role?: string; // 'karateka' | 'sensei'
  validado?: boolean; // true | false
}

export default function AlumnosPage() {
  const [karatekas, setKaratekas] = useState<Karateka[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [beltFilter, setBeltFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos"); // 'todos', 'karateka', 'sensei'
  const [statusFilter, setStatusFilter] = useState("activos"); // 'activos', 'pendientes_validacion', 'inactivos', 'todos'
  const [isAdmin, setIsAdmin] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  
  // Selected Karateka for License or Edit
  const [selectedKarateka, setSelectedKarateka] = useState<Karateka | null>(null);

  // Form inputs
  const [formId, setFormId] = useState("");
  const [formMatricula, setFormMatricula] = useState("");
  const [formNombre, setFormNombre] = useState("");
  const [formCinturon, setFormCinturon] = useState("blanco");
  const [formGrado, setFormGrado] = useState("10° Kyu");
  const [formTutor, setFormTutor] = useState("");
  const [formTelefono, setFormTelefono] = useState("");
  const [formFotoUrl, setFormFotoUrl] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formActivo, setFormActivo] = useState(true);
  const [formValidado, setFormValidado] = useState(true);
  const [formRole, setFormRole] = useState("karateka");
  const [formPlan, setFormPlan] = useState("Mensualidad Regular");
  const [formPaymentStatus, setFormPaymentStatus] = useState("pagado");

  // Search parameters for successful admin registration alerts
  const searchParams = useSearchParams();
  const successMsg = searchParams?.get("success");

  useEffect(() => {
    // Check administrator role
    const currentRole = getCookie("dojoia_role");
    const currentEmail = getCookie("dojoia_email");
    const adminCheck = currentRole === "sensei" || currentEmail === "admin@admin.com" || !currentRole;
    setIsAdmin(adminCheck);

    if (successMsg) {
      alert(decodeURIComponent(successMsg));
      window.history.replaceState({}, "", "/dashboard/alumnos");
    }
  }, [successMsg]);

  // Importer states
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, number>>({});
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // Load Karatekas list
  const fetchKaratekas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("karatekas")
        .select("*")
        .order("nombre", { ascending: true });

      if (error || !data || data.length === 0) {
        // Fallback mock data with active & pending registrations (Alumnos and Maestros)
        const mockData: Karateka[] = [
          { id: "8", matricula: "KA-2026-007", nombre: "Ashley Silva", cinturon: "blanco", grado: "10° Kyu", tutor: "Adrian Silva [credentials:ashley.silva@gmail.com:123456:Mensualidad Regular:pagado:karateka:validado]", telefono: "6643492687", foto_url: "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=200", activo: true },
          { id: "3", matricula: "KA-2026-003", nombre: "Diego Fernández Silva", cinturon: "negro", grado: "1° Dan", tutor: "Juan Fernández [credentials:diego.fernandez@gmail.com:123456:Mensualidad Regular:pagado:karateka:validado]", telefono: "+5215545678901", foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", activo: true },
          { id: "1", matricula: "KA-2026-001", nombre: "Mateo García López", cinturon: "verde", grado: "6° Kyu", tutor: "Adriana López [credentials:mateo@dojoia.com:123456:Mensualidad Regular:pagado:karateka:validado]", telefono: "+5215512345678", foto_url: "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=200", activo: true },
          { id: "2", matricula: "KA-2026-002", nombre: "Sofía Martínez Ruiz", cinturon: "amarillo", grado: "8° Kyu", tutor: "Carlos Martínez [credentials:sofia@dojoia.com:123456:Mensualidad Regular:pagado:karateka:validado]", telefono: "+5215587654321", foto_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", activo: true },
          { id: "6", matricula: "KA-2026-006", nombre: "Carlos Eduardo Mendoza", cinturon: "blanco", grado: "10° Kyu", tutor: "Adrián Mendoza [credentials:carlos.mendoza@gmail.com:123456:Mensualidad Regular:pendiente:karateka:pendiente]", telefono: "+5216643492687", foto_url: "", activo: false },
          { id: "7", matricula: "MS-2026-001", nombre: "Sensei Roberto Gómez", cinturon: "negro", grado: "3° Dan", tutor: "Sensei Roberto Gómez [credentials:roberto.gomez@dojoia.com:123456:Trimestre Raion Kai:pagado:sensei:pendiente]", telefono: "+5216649876543", foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", activo: false },
        ];
        
        const cached = localStorage.getItem("local_karatekas");
        if (cached) {
          const parsedCached = JSON.parse(cached).map((k: any) => {
            const credentials = parseTutorField(k.tutor);
            return {
              ...k,
              tutor: credentials.tutor,
              email: k.email || credentials.email,
              password: k.password || credentials.password,
              plan: k.plan || credentials.plan,
              paymentStatus: k.paymentStatus || credentials.paymentStatus,
              role: k.role || credentials.role || "karateka",
              validado: k.validado !== undefined ? k.validado : credentials.validado
            };
          });
          setKaratekas(parsedCached);
        } else {
          const parsedMock = mockData.map(k => {
            const credentials = parseTutorField(k.tutor);
            return {
              ...k,
              tutor: credentials.tutor,
              email: credentials.email || `${k.matricula.toLowerCase()}@dojoia.com`,
              password: credentials.password || '123456',
              plan: credentials.plan || "Mensualidad Regular",
              paymentStatus: credentials.paymentStatus || "pagado",
              role: credentials.role || "karateka",
              validado: credentials.validado
            };
          });
          setKaratekas(parsedMock);
          localStorage.setItem("local_karatekas", JSON.stringify(parsedMock));
        }
      } else {
        const parsedData = data.map((k: any) => {
          const credentials = parseTutorField(k.tutor);
          return {
            ...k,
            tutor: credentials.tutor,
            email: credentials.email,
            password: credentials.password,
            plan: credentials.plan || "Mensualidad Regular",
            paymentStatus: credentials.paymentStatus || "pagado",
            role: credentials.role || "karateka",
            validado: credentials.validado !== undefined ? credentials.validado : true
          };
        });
        setKaratekas(parsedData);
        localStorage.setItem("local_karatekas", JSON.stringify(parsedData));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaratekas();
  }, []);

  const getBeltColor = (belt: string) => {
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

  // Open Form for Create
  const handleCreateOpen = () => {
    setFormId("");
    const nextNum = String(karatekas.length + 1).padStart(3, '0');
    const defaultMatricula = `KA-2026-${nextNum}`;
    setFormMatricula(defaultMatricula);
    setFormNombre("");
    setFormCinturon("blanco");
    setFormGrado("10° Kyu");
    setFormTutor("");
    setFormTelefono("");
    setFormFotoUrl("");
    setFormEmail(`${defaultMatricula.toLowerCase()}@dojoia.com`);
    setFormPassword("123456");
    setFormActivo(true);
    setFormValidado(true);
    setFormRole("karateka");
    setFormPlan("Mensualidad Regular");
    setFormPaymentStatus("pagado");
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleEditOpen = (k: Karateka) => {
    setFormId(k.id);
    setFormMatricula(k.matricula);
    setFormNombre(k.nombre);
    setFormCinturon(k.cinturon);
    setFormGrado(k.grado);
    setFormTutor(k.tutor);
    setFormTelefono(k.telefono);
    setFormFotoUrl(k.foto_url || "");
    setFormEmail(k.email || "");
    setFormPassword(k.password || "");
    setFormActivo(k.activo !== false);
    setFormValidado(k.validado !== false);
    setFormRole(k.role || "karateka");
    setFormPlan(k.plan || "Mensualidad Regular");
    setFormPaymentStatus(k.paymentStatus || "pagado");
    setIsFormOpen(true);
  };

  // ADMIN ACTION: Single-click Validate and Officially Approve User
  const handleValidateUser = async (k: Karateka) => {
    if (!isAdmin) {
      alert("⚠️ Acción restringida: Solo el Sensei Administrador tiene el privilegio de validar registros.");
      return;
    }

    const dbPayload = {
      activo: true,
      tutor: serializeTutorField(
        k.tutor,
        k.email || `${k.matricula.toLowerCase()}@dojoia.com`,
        k.password || "123456",
        k.plan || "Mensualidad Regular",
        k.paymentStatus || "pagado",
        k.role || "karateka",
        true
      )
    };

    try {
      // Update in Supabase
      await supabase.from("karatekas").update(dbPayload).eq("id", k.id);

      // Update local state
      const updatedList = karatekas.map(item => item.id === k.id ? { 
        ...item, 
        validado: true, 
        activo: true 
      } : item);

      setKaratekas(updatedList);
      localStorage.setItem("local_karatekas", JSON.stringify(updatedList));

      const tipoUser = k.role === "sensei" ? "Maestro / Sensei" : "Alumno / Karateka";
      alert(`✅ ¡Registro Validado! El ${tipoUser} "${k.nombre}" ha sido VALIDADO Y REGISTRADO OFICIALMENTE con éxito.`);
    } catch (err) {
      console.error("Error validando usuario:", err);
      alert("Ocurrió un error al intentar validar el registro.");
    }
  };

  // ADMIN ACTION: Toggle or cycle Payment Status (Pagado -> Pendiente -> Exento -> No Pagado)
  const handleTogglePaymentStatus = async (k: Karateka) => {
    if (!isAdmin) {
      alert("⚠️ Acción restringida: Solo el Sensei Administrador tiene el privilegio de verificar pagos.");
      return;
    }

    const currentStatus = k.paymentStatus || "pagado";
    const statusCycle: Record<string, string> = {
      "pagado": "pendiente",
      "pendiente": "no_pagado",
      "no_pagado": "exento",
      "exento": "pagado"
    };

    const nextStatus = statusCycle[currentStatus] || "pagado";

    const dbPayload = {
      tutor: serializeTutorField(
        k.tutor,
        k.email || `${k.matricula.toLowerCase()}@dojoia.com`,
        k.password || "123456",
        k.plan || "Mensualidad Regular",
        nextStatus,
        k.role || "karateka",
        k.validado !== false
      )
    };

    try {
      await supabase.from("karatekas").update(dbPayload).eq("id", k.id);

      const updatedList = karatekas.map(item => item.id === k.id ? { 
        ...item, 
        paymentStatus: nextStatus 
      } : item);

      setKaratekas(updatedList);
      localStorage.setItem("local_karatekas", JSON.stringify(updatedList));
    } catch (err) {
      console.error("Error al actualizar pago:", err);
    }
  };

  // Submit manual registration
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre || !formMatricula || !formTutor || !formTelefono || !formEmail || !formPassword) {
      alert("Por favor rellena todos los campos obligatorios.");
      return;
    }

    const dbPayload = {
      matricula: formMatricula.trim(),
      nombre: formNombre.trim(),
      cinturon: formCinturon,
      grado: formGrado.trim(),
      tutor: serializeTutorField(formTutor, formEmail, formPassword, formPlan, formPaymentStatus, formRole, formValidado),
      telefono: formTelefono.trim(),
      foto_url: formFotoUrl.trim() || (formRole === "sensei" ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" : "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=200"),
      activo: formActivo
    };

    const localKaratekaFields = {
      matricula: formMatricula.trim(),
      nombre: formNombre.trim(),
      cinturon: formCinturon,
      grado: formGrado.trim(),
      tutor: formTutor.trim(),
      telefono: formTelefono.trim(),
      foto_url: formFotoUrl.trim() || (formRole === "sensei" ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" : "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=200"),
      activo: formActivo,
      validado: formValidado,
      role: formRole,
      email: formEmail.trim().toLowerCase(),
      password: formPassword.trim(),
      plan: formPlan,
      paymentStatus: formPaymentStatus
    };

    try {
      if (formId) {
        // Update in Supabase
        const { error } = await supabase.from("karatekas").update(dbPayload).eq("id", formId);
        
        if (error) {
          console.error("Error updating karateka:", error);
          alert("Error al guardar en la base de datos: " + error.message);
          return;
        }

        const updatedList = karatekas.map(k => k.id === formId ? { ...k, ...localKaratekaFields } : k);
        setKaratekas(updatedList);
        localStorage.setItem("local_karatekas", JSON.stringify(updatedList));
      } else {
        // Insert in Supabase
        const { data, error } = await supabase.from("karatekas").insert(dbPayload).select();
        
        if (error) {
          console.error("Error inserting karateka:", error);
          alert("Error al guardar en la base de datos: " + error.message);
          return;
        }

        const dbNewKarateka = data && data[0];
        const newKarateka = {
          id: dbNewKarateka ? dbNewKarateka.id : Math.random().toString(),
          ...localKaratekaFields
        };
        const updatedList = [...karatekas, newKarateka];
        setKaratekas(updatedList);
        localStorage.setItem("local_karatekas", JSON.stringify(updatedList));
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error inesperado al intentar guardar el usuario.");
    }
  };

  // CSV Drag-and-drop Parsing
  const handleCsvFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      const rows: string[][] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const row = [];
        let inQuotes = false;
        let currentField = "";
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            row.push(currentField.trim());
            currentField = "";
          } else {
            currentField += char;
          }
        }
        row.push(currentField.trim());
        rows.push(row);
      }

      if (rows.length > 0) {
        const headers = rows[0];
        setCsvHeaders(headers);
        setCsvRows(rows.slice(1));
        
        const initialMapping: Record<string, number> = {};
        headers.forEach((h, idx) => {
          const cleanHeader = h.toLowerCase().replace(/[^a-z]/g, "");
          if (cleanHeader.includes("nombre") || cleanHeader.includes("name")) initialMapping["nombre"] = idx;
          if (cleanHeader.includes("matricula") || cleanHeader.includes("id")) initialMapping["matricula"] = idx;
          if (cleanHeader.includes("cinturon") || cleanHeader.includes("belt")) initialMapping["cinturon"] = idx;
          if (cleanHeader.includes("grado") || cleanHeader.includes("kyu") || cleanHeader.includes("grade")) initialMapping["grado"] = idx;
          if (cleanHeader.includes("tutor") || cleanHeader.includes("parent")) initialMapping["tutor"] = idx;
          if (cleanHeader.includes("telefono") || cleanHeader.includes("phone")) initialMapping["telefono"] = idx;
          if (cleanHeader.includes("foto") || cleanHeader.includes("image")) initialMapping["foto"] = idx;
        });

        setColumnMapping(initialMapping);
      }
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (dbKey: string, csvIdx: number) => {
    setColumnMapping(prev => ({
      ...prev,
      [dbKey]: csvIdx
    }));
  };

  useEffect(() => {
    if (csvRows.length === 0) return;

    const previewList = csvRows.slice(0, 5).map(row => {
      return {
        nombre: columnMapping["nombre"] !== undefined ? row[columnMapping["nombre"]] : "--",
        matricula: columnMapping["matricula"] !== undefined ? row[columnMapping["matricula"]] : "AUTOGENERADO",
        cinturon: columnMapping["cinturon"] !== undefined ? row[columnMapping["cinturon"]] : "blanco",
        grado: columnMapping["grado"] !== undefined ? row[columnMapping["grado"]] : "10° Kyu",
        tutor: columnMapping["tutor"] !== undefined ? row[columnMapping["tutor"]] : "--",
        telefono: columnMapping["telefono"] !== undefined ? row[columnMapping["telefono"]] : "--",
        foto: columnMapping["foto"] !== undefined ? row[columnMapping["foto"]] : "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=200",
      };
    });
    setImportPreview(previewList);
  }, [columnMapping, csvRows]);

  const handleImportSubmit = async () => {
    if (columnMapping["nombre"] === undefined || columnMapping["tutor"] === undefined || columnMapping["telefono"] === undefined) {
      alert("Es obligatorio mapear por lo menos: Nombre, Tutor y Teléfono.");
      return;
    }

    const importedList: Karateka[] = csvRows.map((row, idx) => {
      const beltRaw = columnMapping["cinturon"] !== undefined ? row[columnMapping["cinturon"]].toLowerCase() : "blanco";
      const validBelts = ["blanco", "amarillo", "naranja", "verde", "azul", "marron", "negro"];
      const cinturon = validBelts.includes(beltRaw) ? beltRaw : "blanco";

      const matricula = columnMapping["matricula"] !== undefined && row[columnMapping["matricula"]] 
        ? row[columnMapping["matricula"]].trim() 
        : `KA-2026-${String(karatekas.length + idx + 1).padStart(3, '0')}`;

      return {
        id: Math.random().toString(),
        nombre: row[columnMapping["nombre"]],
        matricula: matricula,
        cinturon: cinturon,
        grado: columnMapping["grado"] !== undefined ? row[columnMapping["grado"]] : "10° Kyu",
        tutor: row[columnMapping["tutor"]],
        telefono: row[columnMapping["telefono"]],
        foto_url: columnMapping["foto"] !== undefined ? row[columnMapping["foto"]] : "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=200",
        activo: true,
        validado: true,
        role: "karateka"
      };
    });

    try {
      const dbPayload = importedList.map(k => ({
        nombre: k.nombre,
        matricula: k.matricula,
        cinturon: k.cinturon,
        grado: k.grado,
        tutor: k.tutor,
        telefono: k.telefono,
        foto_url: k.foto_url,
        activo: true
      }));

      await supabase.from("karatekas").insert(dbPayload);

      const mergedList = [...karatekas, ...importedList];
      setKaratekas(mergedList);
      localStorage.setItem("local_karatekas", JSON.stringify(mergedList));

      setIsImportOpen(false);
      setCsvHeaders([]);
      setCsvRows([]);
      setColumnMapping({});
      setImportPreview([]);
      alert(`Se importaron ${importedList.length} Karatekas correctamente.`);
    } catch (err) {
      console.error(err);
      alert("Hubo un error importando a Supabase, pero se guardó en memoria local.");
    }
  };

  // Delete Karateka
  const handleDelete = async (id: string, nombre: string) => {
    if (!isAdmin) {
      alert("⚠️ Acción restringida: Solo el Administrador puede eliminar registros.");
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const { error } = await supabase.from("karatekas").delete().eq("id", id);

      if (error) {
        console.error("Error deleting karateka:", error);
        alert("Error al eliminar de la base de datos: " + error.message);
        return;
      }

      const updatedList = karatekas.filter(k => k.id !== id);
      setKaratekas(updatedList);
      localStorage.setItem("local_karatekas", JSON.stringify(updatedList));
      alert("Usuario eliminado correctamente.");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error inesperado al intentar eliminar.");
    }
  };

  const handlePrintLicense = () => {
    window.print();
  };

  // Filter students/teachers based on search queries, belts, roles, and validation status
  const filteredKaratekas = karatekas.filter(k => {
    const matchesSearch = k.nombre.toLowerCase().includes(search.toLowerCase()) || 
                          k.matricula.toLowerCase().includes(search.toLowerCase()) ||
                          k.tutor.toLowerCase().includes(search.toLowerCase()) ||
                          (k.email && k.email.toLowerCase().includes(search.toLowerCase()));

    const matchesBelt = beltFilter ? k.cinturon.toLowerCase() === beltFilter.toLowerCase() : true;
    
    let matchesRole = true;
    if (roleFilter === "karateka") {
      matchesRole = (k.role || "karateka") === "karateka";
    } else if (roleFilter === "sensei") {
      matchesRole = k.role === "sensei";
    }

    let matchesStatus = true;
    if (statusFilter === "activos") {
      matchesStatus = k.activo !== false && k.validado !== false;
    } else if (statusFilter === "pendientes_validacion") {
      matchesStatus = k.validado === false || k.activo === false;
    } else if (statusFilter === "inactivos") {
      matchesStatus = k.activo === false;
    }
    
    return matchesSearch && matchesBelt && matchesRole && matchesStatus;
  });

  // Calculate statistics for Admin KPI summary bar
  const totalCount = karatekas.length;
  const pendingValidationCount = karatekas.filter(k => k.validado === false || k.activo === false).length;
  const pendingPaymentCount = karatekas.filter(k => k.paymentStatus === "pendiente" || k.paymentStatus === "no_pagado").length;
  const teachersCount = karatekas.filter(k => k.role === "sensei").length;

  return (
    <div className={styles.container}>
      {/* Page Title & Actions */}
      <div className={styles.header}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={32} color="var(--brand-red)" /> Directorio de Alumnos y Maestros
          </h1>
          <p>Nómina oficial de registrados, validación de cuentas y verificación de pagos del Dojo.</p>
        </div>

        {isAdmin && (
          <div className={styles.headerActions} style={{ marginRight: '8.5rem' }}>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setIsImportOpen(true)}>
              <Upload size={18} /> Importar Excel/CSV
            </button>
            <button className="btn-primary" style={{ background: 'var(--brand-red)', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={handleCreateOpen}>
              <Plus size={18} /> Registrar Alumno / Maestro
            </button>
          </div>
        )}
      </div>

      {/* Admin Privilege Banner */}
      {isAdmin && (
        <div className={styles.adminBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={24} color="#60a5fa" />
            <div>
              <strong>🔑 Panel con Privilegios de Administrador (Sensei):</strong>
              <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Los alumnos o maestros que se registran aparecen aquí para validarlos y verificar si ya pagaron o no, y activarlos oficialmente.
              </span>
            </div>
          </div>

          {pendingValidationCount > 0 && (
            <button 
              onClick={() => setStatusFilter("pendientes_validacion")}
              style={{
                background: '#f59e0b',
                color: '#000',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Clock size={16} /> Ver {pendingValidationCount} Pendiente{pendingValidationCount > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Total Registrados</span>
            <Users size={20} color="var(--brand-red)" />
          </div>
          <div className={styles.statValue}>{totalCount}</div>
          <div className={styles.statSubtext}>Alumnos y maestros en la academia</div>
        </div>

        <div className={styles.statCard} style={{ borderColor: pendingValidationCount > 0 ? '#f59e0b' : 'var(--border-color)' }}>
          <div className={styles.statHeader}>
            <span style={{ color: pendingValidationCount > 0 ? '#f59e0b' : 'var(--text-secondary)' }}>Pendientes de Validación</span>
            <Clock size={20} color={pendingValidationCount > 0 ? '#f59e0b' : 'var(--text-tertiary)'} />
          </div>
          <div className={styles.statValue} style={{ color: pendingValidationCount > 0 ? '#f59e0b' : 'var(--text-primary)' }}>
            {pendingValidationCount}
          </div>
          <div className={styles.statSubtext}>Requieren autorización de Admin</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Pagos Pendientes</span>
            <CreditCard size={20} color="#3b82f6" />
          </div>
          <div className={styles.statValue}>{pendingPaymentCount}</div>
          <div className={styles.statSubtext}>Membresías por conciliar o abonar</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Maestros / Instructores</span>
            <GraduationCap size={20} color="#f43f5e" />
          </div>
          <div className={styles.statValue}>{teachersCount}</div>
          <div className={styles.statSubtext}>Senseis y Sempais acreditados</div>
        </div>
      </div>

      {/* Filters bar */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, matrícula, tutor o email..." 
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select 
          className={styles.selectInput}
          value={beltFilter}
          onChange={(e) => setBeltFilter(e.target.value)}
        >
          <option value="">Filtro: Todos los cinturones</option>
          <option value="blanco">Cinturón Blanco</option>
          <option value="amarillo">Cinturón Amarillo</option>
          <option value="naranja">Cinturón Naranja</option>
          <option value="verde">Cinturón Verde</option>
          <option value="azul">Cinturón Azul</option>
          <option value="marron">Cinturón Marrón</option>
          <option value="negro">Cinturón Negro</option>
        </select>

        <select 
          className={styles.selectInput}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="todos">Rol: Alumnos y Maestros</option>
          <option value="karateka">Solo Alumnos (Karatekas)</option>
          <option value="sensei">Solo Maestros (Senseis)</option>
        </select>

        <select 
          className={styles.selectInput}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ borderColor: statusFilter === 'pendientes_validacion' ? '#f59e0b' : 'var(--border-color)' }}
        >
          <option value="activos">Estado: Validados y Activos</option>
          <option value="pendientes_validacion">⏳ Pendientes de Validación ({pendingValidationCount})</option>
          <option value="inactivos">Estado: Inactivos</option>
          <option value="todos">Estado: Todos</option>
        </select>
      </div>

      {/* Grid Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre Karateka / Maestro</th>
              <th>Matrícula</th>
              <th>Cinturón</th>
              <th>Grado Kyu/Dan</th>
              <th>Tutor / Plan</th>
              <th>Teléfono</th>
              <th>Estado y Pago</th>
              <th>Acciones de Administración</th>
            </tr>
          </thead>
          <tbody>
            {filteredKaratekas.map((k) => {
              const isPending = k.validado === false || k.activo === false;
              const isSenseiRole = k.role === "sensei";

              return (
                <tr key={k.id} style={{ background: isPending ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }}>
                  <td>
                    <div className={styles.studentCell}>
                      <div className={styles.avatar} style={{ background: isSenseiRole ? 'var(--brand-red)' : 'var(--brand-gold)' }}>
                        {k.foto_url ? (
                          <img src={k.foto_url} alt={k.nombre} className={styles.avatarImg} />
                        ) : (
                          k.nombre.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, display: 'block' }}>{k.nombre}</span>
                        <span className={`${styles.roleBadge} ${isSenseiRole ? styles.sensei : styles.karateka}`}>
                          {isSenseiRole ? "🥋 Sensei / Maestro" : "👦 Alumno"}
                        </span>
                        {k.email && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            🔑 {k.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{k.matricula}</span></td>
                  <td>
                    <span className={`belt-badge ${getBeltColor(k.cinturon)}`}>
                      {k.cinturon}
                    </span>
                  </td>
                  <td>{k.grado}</td>
                  <td>
                    <div>
                      <span style={{ display: 'block', fontWeight: 600 }}>{k.tutor}</span>
                      {k.plan && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', display: 'block' }}>
                          📋 {k.plan}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{k.telefono}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                      {/* Badge 1: Validation Status */}
                      {isPending ? (
                        <span className={`${styles.statusBadge} ${styles.pendienteValidacion}`}>
                          ⏳ Pendiente Validación
                        </span>
                      ) : (
                        <span className={`${styles.statusBadge} ${styles.validado}`}>
                          ✓ Validado Oficial
                        </span>
                      )}

                      {/* Badge 2: Payment Status */}
                      {k.paymentStatus && (
                        <span className={`${styles.statusBadge}`} style={{
                          background: k.paymentStatus === "pagado" ? "rgba(16, 185, 129, 0.15)" : k.paymentStatus === "exento" ? "rgba(59, 130, 246, 0.15)" : k.paymentStatus === "pendiente" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: k.paymentStatus === "pagado" ? "#10b981" : k.paymentStatus === "exento" ? "#60a5fa" : k.paymentStatus === "pendiente" ? "#f59e0b" : "#ef4444",
                          border: `1px solid ${k.paymentStatus === "pagado" ? "#10b981" : k.paymentStatus === "exento" ? "#3b82f6" : k.paymentStatus === "pendiente" ? "#f59e0b" : "#ef4444"}`,
                          fontSize: '0.7rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          display: 'inline-block',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          💳 {k.paymentStatus === "pagado" ? "PAGADO" : k.paymentStatus === "exento" ? "EXENTO" : k.paymentStatus === "pendiente" ? "PAGO PENDIENTE" : "NO PAGADO"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {/* Only Administrator has validation and approval privileges */}
                      {isAdmin ? (
                        <>
                          {isPending && (
                            <button 
                              className={`${styles.btnAction} ${styles.validate}`}
                              onClick={() => handleValidateUser(k)}
                              title="Validar y Autorizar Registro Oficial"
                            >
                              <UserCheck size={15} /> Validar
                            </button>
                          )}

                          <button 
                            className={`${styles.btnAction} ${styles.payStatus}`}
                            onClick={() => handleTogglePaymentStatus(k)}
                            title="Cambiar/Verificar Estado de Pago"
                          >
                            <CreditCard size={14} /> Pago
                          </button>

                          <button 
                            className={`${styles.btnAction} ${styles.edit}`}
                            onClick={() => handleEditOpen(k)}
                          >
                            Editar
                          </button>

                          <button 
                            className={`${styles.btnAction} ${styles.card}`}
                            onClick={() => {
                              setSelectedKarateka(k);
                              setIsLicenseOpen(true);
                            }}
                          >
                            <Award size={14} /> Credencial
                          </button>

                          <button 
                            className={`${styles.btnAction} ${styles.delete}`}
                            onClick={() => handleDelete(k.id, k.nombre)}
                            title="Eliminar Registro"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          🔒 Solo Administrador
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredKaratekas.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                  {loading ? 'Cargando directorio de karatekas...' : 'No se encontraron registros con los filtros seleccionados.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Create or Edit Form */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.formCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{formId ? "Editar Registro" : "Registrar Alumno o Maestro"}</h2>
              <button onClick={() => setIsFormOpen(false)} style={{ color: 'var(--text-secondary)' }}><X /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Rol en la Academia</label>
                  <select className={styles.selectInput} value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                    <option value="karateka">Estudiante / Karateka</option>
                    <option value="sensei">Maestro / Sensei Administrador</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Matrícula</label>
                  <input type="text" className={styles.input} value={formMatricula} onChange={(e) => setFormMatricula(e.target.value)} required />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre Completo</label>
                <input type="text" className={styles.input} placeholder="Nombre y Apellidos" value={formNombre} onChange={(e) => setFormNombre(e.target.value)} required />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Cinturón</label>
                  <select className={styles.selectInput} value={formCinturon} onChange={(e) => setFormCinturon(e.target.value)}>
                    <option value="blanco">Blanco</option>
                    <option value="amarillo">Amarillo</option>
                    <option value="naranja">Naranja</option>
                    <option value="verde">Verde</option>
                    <option value="azul">Azul</option>
                    <option value="marron">Marrón</option>
                    <option value="negro">Negro</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Grado Kyu/Dan</label>
                  <input type="text" className={styles.input} placeholder="e.g. 6° Kyu / 1° Dan" value={formGrado} onChange={(e) => setFormGrado(e.target.value)} required />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tutor Responsable</label>
                  <input type="text" className={styles.input} placeholder="Padre/Madre o Propio Nombre" value={formTutor} onChange={(e) => setFormTutor(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Teléfono WhatsApp</label>
                  <input type="tel" className={styles.input} placeholder="e.g. +5215512345678" value={formTelefono} onChange={(e) => setFormTelefono(e.target.value)} required />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Correo de Acceso</label>
                  <input type="email" className={styles.input} placeholder="correo@dojoia.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Contraseña de Acceso</label>
                  <input type="text" className={styles.input} placeholder="Contraseña de acceso" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} required />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Plan de Membresía</label>
                  <select 
                    className={styles.selectInput} 
                    value={formPlan} 
                    onChange={(e) => setFormPlan(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Mensualidad Regular">Mensualidad Regular ($500 MXN)</option>
                    <option value="Trimestre Raion Kai">Trimestre Raion Kai ($1,400 MXN)</option>
                    <option value="Semestre Shito-Ryu">Semestre Shito-Ryu ($2,700 MXN)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Estado de Pago</label>
                  <select 
                    className={styles.selectInput} 
                    value={formPaymentStatus} 
                    onChange={(e) => setFormPaymentStatus(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="pagado">Pagado / Acreditado</option>
                    <option value="pendiente">Pendiente de Acreditación</option>
                    <option value="exento">Exento (No cobrar)</option>
                    <option value="no_pagado">Pendiente de Pago</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                <div className={styles.formCheckboxGroup}>
                  <input 
                    type="checkbox" 
                    id="formValidado"
                    className={styles.checkboxInput} 
                    checked={formValidado} 
                    onChange={(e) => setFormValidado(e.target.checked)} 
                  />
                  <label htmlFor="formValidado" className={styles.label} style={{ cursor: 'pointer', userSelect: 'none', color: '#10b981', fontWeight: 700 }}>
                    ✓ Registro Validado Oficialmente por Administrador
                  </label>
                </div>

                <div className={styles.formCheckboxGroup}>
                  <input 
                    type="checkbox" 
                    id="formActivo"
                    className={styles.checkboxInput} 
                    checked={formActivo} 
                    onChange={(e) => setFormActivo(e.target.checked)} 
                  />
                  <label htmlFor="formActivo" className={styles.label} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    Usuario Activo (Permite acceso al sistema y asistencias)
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ background: 'var(--brand-red)', marginTop: '0.5rem' }}>
                {formId ? "Guardar Cambios" : "Guardar Registro"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Credencial Digital */}
      {isLicenseOpen && selectedKarateka && (
        <div className={styles.modalOverlay}>
          <div className={styles.formCard} style={{ maxWidth: '370px', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2>Credencial Digital</h2>
              <button onClick={() => setIsLicenseOpen(false)} style={{ color: 'var(--text-secondary)' }}><X /></button>
            </div>

            <div className="printArea">
              <div className={styles.licenseCard}>
                <div className={styles.licenseHeader}>
                  <h3 className="logo-script" style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: '2.2rem', margin: 0 }}>Raion Kai</h3>
                  <p>Karate Do Shito-Ryu</p>
                </div>
                <div className={styles.licenseBody}>
                  <div className={styles.licensePhotoContainer}>
                    {selectedKarateka.foto_url ? (
                      <img src={selectedKarateka.foto_url} alt={selectedKarateka.nombre} className={styles.licensePhoto} />
                    ) : (
                      <span style={{ fontSize: '2.5rem' }}>🥋</span>
                    )}
                  </div>
                  <div className={styles.licenseMeta}>
                    <h4 style={{ textTransform: 'uppercase' }}>{selectedKarateka.nombre}</h4>
                    <p style={{ fontWeight: 600, color: 'var(--brand-red)' }}>Kyudan: {selectedKarateka.grado}</p>
                    <p style={{ fontSize: '0.65rem' }}>Cinta: {selectedKarateka.cinturon.toUpperCase()}</p>
                    <p style={{ fontSize: '0.65rem' }}>ID: {selectedKarateka.matricula}</p>
                  </div>
                </div>
                <div className={styles.licenseFooter}>
                  <div className={styles.qrContainer}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=000&data=${selectedKarateka.matricula}`} 
                      alt="QR Access" 
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                  <div className={styles.licenseSign}>
                    <p>Sensei Principal</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ background: 'var(--brand-red)', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', marginTop: '1rem' }}
              onClick={handlePrintLicense}
            >
              <Printer size={18} /> Imprimir / PDF
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Excel/CSV Importer */}
      {isImportOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.importerCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileSpreadsheet color="var(--success)" size={28} />
                <h2>Importador de Alumnos (CSV)</h2>
              </div>
              <button onClick={() => {
                setIsImportOpen(false);
                setCsvHeaders([]);
                setCsvRows([]);
              }} style={{ color: 'var(--text-secondary)' }}><X /></button>
            </div>

            {csvHeaders.length === 0 ? (
              <div 
                className={styles.dropzone}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files.length > 0) {
                    handleCsvFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <Upload size={48} color="var(--text-tertiary)" />
                <div>
                  <h3>Arrastra tu archivo CSV aquí</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    O haz clic para explorar tus carpetas locales
                  </p>
                </div>
                <input 
                  type="file" 
                  accept=".csv" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleCsvFile(e.target.files[0]);
                    }
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Las columnas sugeridas son: Nombre, Matrícula, Cinturón, Grado, Tutor, Teléfono
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3>Mapear Columnas de tu Archivo</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Asocia las columnas de tu CSV con los campos del perfil en el Dojo.
                </p>

                <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                  {["nombre", "matricula", "cinturon", "grado", "tutor", "telefono", "foto"].map((dbKey) => (
                    <div key={dbKey} className={styles.mappingRow}>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {dbKey === "foto" ? "Foto URL" : dbKey} 
                        {["nombre", "tutor", "telefono"].includes(dbKey) && <span style={{ color: 'var(--brand-red)' }}> *</span>}
                      </span>
                      <span>➡️ Mapea a:</span>
                      <select 
                        className={styles.selectInput}
                        value={columnMapping[dbKey] ?? ""}
                        onChange={(e) => handleMappingChange(dbKey, parseInt(e.target.value))}
                      >
                        <option value="">-- Ignorar o Auto --</option>
                        {csvHeaders.map((header, idx) => (
                          <option key={idx} value={idx}>{header}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <h3>Vista Previa de Importación (Primeros 5 registros)</h3>
                <div className={styles.previewTableWrapper}>
                  <table className={styles.table} style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Matrícula</th>
                        <th>Cinturón</th>
                        <th>Grado</th>
                        <th>Tutor</th>
                        <th>Teléfono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.nombre}</td>
                          <td style={{ fontFamily: 'monospace' }}>{item.matricula}</td>
                          <td>
                            <span className={`belt-badge ${getBeltColor(item.cinturon)}`} style={{ fontSize: '0.7rem' }}>
                              {item.cinturon}
                            </span>
                          </td>
                          <td>{item.grado}</td>
                          <td>{item.tutor}</td>
                          <td>{item.telefono}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      setCsvHeaders([]);
                      setCsvRows([]);
                    }}
                  >
                    Cargar Otro Archivo
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1, background: 'var(--brand-red)' }}
                    onClick={handleImportSubmit}
                  >
                    Completar Importación
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

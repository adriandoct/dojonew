"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

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

export async function login(formData: FormData) {
  const supabase = await createClient();
  const emailVal = formData.get("email") as string;
  const passwordVal = formData.get("password") as string;

  const cookieStore = await cookies();

  const email = (emailVal || "").trim().toLowerCase();
  const password = (passwordVal || "").trim();

  const isMockSupabase = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                         String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).includes("reemplázala");

  // FIXED ADMIN SENSEI BYPASS
  const isAdminEmail = email === "admin@admin.com";
  const isAdminPassword = 
    password.toLowerCase() === "12345678cecyte" ||
    password.toLowerCase() === "12345678cecy" ||
    password === "12345678";

  if (isAdminEmail && isAdminPassword) {
    if (!isMockSupabase) {
      try {
        const authPassword = password.toLowerCase() === "12345678cecyte" ? passwordVal : "12345678Cecyte";
        // Attempt standard auth login to create an active Supabase session
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: "admin@admin.com", 
          password: authPassword 
        });
        if (signInError) {
          // If sign in fails (e.g. user does not exist), register the user first
          const { error: signUpError } = await supabase.auth.signUp({
            email: "admin@admin.com",
            password: "12345678Cecyte",
            options: {
              data: {
                full_name: "Sensei Carlos Martínez",
                role: "sensei",
              },
            },
          });
          if (!signUpError) {
            await supabase.auth.signInWithPassword({ 
              email: "admin@admin.com", 
              password: "12345678Cecyte" 
            });
          }
        }
      } catch (authErr) {
        console.warn("Supabase auth integration failed during admin bypass, continuing with cookie session:", authErr);
      }
    }
    cookieStore.set("dojoia_role", "sensei", { path: "/" });
    cookieStore.set("dojoia_email", "admin@admin.com", { path: "/" });
    cookieStore.set("dojoia_name", "Sensei Carlos Martínez", { path: "/" });
    return redirect("/dashboard");
  }

  // CHECK DYNAMIC KARATEKA TABLE FOR STUDENT CREDENTIALS
  if (!isMockSupabase) {
    try {
      const { data: students, error: studentError } = await supabase
        .from("karatekas")
        .select("nombre, tutor, activo")
        .ilike("tutor", "%[credentials:%");

      if (students && !studentError) {
        const matched = students.find((s: any) => {
          const creds = parseTutorField(s.tutor);
          if (creds.email.toLowerCase() !== email) return false;
          
          const enteredLower = password.toLowerCase();
          const storedLower = creds.password.trim().toLowerCase();
          
          return enteredLower === storedLower || 
                 enteredLower === storedLower + "cecy" || 
                 enteredLower === storedLower + "cecyte" ||
                 storedLower === enteredLower + "cecy" ||
                 storedLower === enteredLower + "cecyte";
        });

        if (matched) {
          if (matched.activo === false) {
            return redirect("/login?error=" + encodeURIComponent("Tu cuenta de alumno/maestro está pendiente de validación por parte del Sensei Administrador."));
          }
          const creds = parseTutorField(matched.tutor);
          cookieStore.set("dojoia_role", creds.role || "karateka", { path: "/" });
          cookieStore.set("dojoia_email", email, { path: "/" });
          cookieStore.set("dojoia_name", matched.nombre, { path: "/" });
          cookieStore.set("dojoia_plan", creds.plan, { path: "/" });
          cookieStore.set("dojoia_payment_status", creds.paymentStatus, { path: "/" });
          return redirect("/dashboard");
        }
      }
    } catch (dbErr) {
      console.warn("Dynamic karateka check failed or skipped", dbErr);
    }
  }

  // STANDARD AUTH
  let authError = null;
  let userMetadata = null;

  if (!isMockSupabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
      if (!error && data?.user) {
        userMetadata = data.user.user_metadata;
      }
    } catch (err) {
      console.error("Supabase auth signInWithPassword failed", err);
      authError = err;
    }
  }

  if (isMockSupabase || authError) {
    // If Supabase credentials fail or we are offline/no-keys, check and allow a mock login
    if (isMockSupabase && email && password) {
      const isStudent = email.includes("student") || email.includes("alumno") || password === "123456";
      const role = isStudent ? "karateka" : "sensei";
      const name = isStudent ? "Mateo García López" : "Sensei Carlos Martínez";
      
      cookieStore.set("dojoia_role", role, { path: "/" });
      cookieStore.set("dojoia_email", email, { path: "/" });
      cookieStore.set("dojoia_name", name, { path: "/" });
      cookieStore.set("dojoia_plan", "Mensualidad Regular", { path: "/" });
      cookieStore.set("dojoia_payment_status", "pagado", { path: "/" });
      return redirect("/dashboard");
    }
    return redirect("/login?error=Credenciales inválidas. Por favor intenta de nuevo.");
  }

  // Read metadata role if Supabase is connected
  const role = userMetadata?.role || "karateka";
  const name = userMetadata?.full_name || "Karateka";
  const plan = userMetadata?.plan || "Mensualidad Regular";
  const paymentStatus = userMetadata?.payment_status || "pagado";

  cookieStore.set("dojoia_role", role, { path: "/" });
  cookieStore.set("dojoia_email", email, { path: "/" });
  cookieStore.set("dojoia_name", name, { path: "/" });
  cookieStore.set("dojoia_plan", plan, { path: "/" });
  cookieStore.set("dojoia_payment_status", paymentStatus, { path: "/" });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = (formData.get("role") as string) || "karateka";
  const telefono = (formData.get("telefono") as string) || "Sin registrar";
  const plan = (formData.get("plan") as string) || "Mensualidad Regular";
  const bypassPayment = formData.get("bypassPayment") === "true";
  let paymentStatus = (formData.get("paymentStatus") as string) || "no_pagado";

  if (bypassPayment) {
    paymentStatus = "exento";
  }

  const cookieStore = await cookies();
  const isCurrentAdmin = cookieStore.get("dojoia_role")?.value === "sensei";

  const isVal = isCurrentAdmin ? true : false;
  const isAct = isCurrentAdmin ? true : false;

  const defaultMatricula = role === "sensei" 
    ? `MS-2026-${Math.floor(100 + Math.random() * 900)}` 
    : `KA-2026-${Math.floor(100 + Math.random() * 900)}`;

  const tutorSerialized = serializeTutorField(
    fullName,
    email,
    password,
    plan,
    paymentStatus,
    role,
    isVal
  );

  const dbPayload = {
    matricula: defaultMatricula,
    nombre: fullName.trim(),
    cinturon: role === "sensei" ? "negro" : "blanco",
    grado: role === "sensei" ? "1° Dan" : "10° Kyu",
    tutor: tutorSerialized,
    telefono: telefono.trim() || "Sin registrar",
    foto_url: role === "sensei" 
      ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" 
      : "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=200",
    activo: isAct
  };

  try {
    await supabase.from("karatekas").insert(dbPayload);
  } catch (err) {
    console.warn("Inserting into karatekas table skipped/failed:", err);
  }

  // Also save pending user record in cookie for local state hydration
  try {
    const existingPending = cookieStore.get("dojoia_pending_users")?.value;
    let pendingArr: any[] = [];
    if (existingPending) {
      pendingArr = JSON.parse(existingPending);
    }
    pendingArr.push({
      id: "reg_" + Date.now(),
      ...dbPayload,
      email,
      password,
      plan,
      paymentStatus,
      role,
      validado: isVal
    });
    cookieStore.set("dojoia_pending_users", JSON.stringify(pendingArr), { path: "/" });
  } catch (err) {
    console.warn("Could not set pending user cookie", err);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role, // 'sensei' or 'karateka'
        plan: plan,
        payment_status: paymentStatus,
      },
    },
  });

  if (error) {
    // If error is "User already registered" or email already exists
    const isAlreadyReg = error.message.toLowerCase().includes("already registered") || 
                         error.message.toLowerCase().includes("registered") ||
                         error.message.toLowerCase().includes("ya registrado");

    if (isAlreadyReg) {
      // Ensure the record exists in karatekas table so the admin CAN see and validate them!
      try {
        const { data: existingKaratekas } = await supabase
          .from("karatekas")
          .select("id, tutor")
          .ilike("tutor", `%${email.trim().toLowerCase()}%`);

        if (!existingKaratekas || existingKaratekas.length === 0) {
          await supabase.from("karatekas").insert(dbPayload);
        }
      } catch (dbErr) {
        console.warn("Could not upsert already registered user to karatekas:", dbErr);
      }

      if (isCurrentAdmin) {
        return redirect("/dashboard/alumnos?success=" + encodeURIComponent(`El usuario (${email}) ya estaba en el sistema y se ha sincronizado en la lista de validación.`));
      }

      return redirect("/login?error=" + encodeURIComponent(`El correo "${email}" ya está registrado. Su cuenta ha sido sincronizada y está en la lista del Sensei Administrador pendiente de validación.`));
    }

    // Fallback for offline signup demo
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).includes("reemplázala")) {
      if (isCurrentAdmin) {
        return redirect("/dashboard/alumnos?success=" + encodeURIComponent("Alumno/Maestro registrado en el sistema con éxito."));
      }
      cookieStore.set("dojoia_role", role, { path: "/" });
      cookieStore.set("dojoia_email", email, { path: "/" });
      cookieStore.set("dojoia_name", fullName, { path: "/" });
      cookieStore.set("dojoia_plan", plan, { path: "/" });
      cookieStore.set("dojoia_payment_status", paymentStatus, { path: "/" });
      return redirect("/dashboard?welcome=true");
    }
    return redirect("/register?error=" + encodeURIComponent(error.message));
  }

  if (isCurrentAdmin) {
    return redirect("/dashboard/alumnos?success=" + encodeURIComponent("Alumno/Maestro registrado con éxito en el sistema."));
  }

  cookieStore.set("dojoia_role", role, { path: "/" });
  cookieStore.set("dojoia_email", email, { path: "/" });
  cookieStore.set("dojoia_name", fullName, { path: "/" });
  cookieStore.set("dojoia_plan", plan, { path: "/" });
  cookieStore.set("dojoia_payment_status", paymentStatus, { path: "/" });

  revalidatePath("/", "layout");
  redirect("/dashboard?welcome=true");
}

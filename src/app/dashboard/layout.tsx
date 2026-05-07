import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import styles from "../dashboard.module.css";
import { Compass, Trophy, Store, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Get user profile data
  // In a real app we would query the `profiles` table and `students` table here
  // For the demo layout we will use placeholder data if table is empty

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span>DOJO</span><span>IA</span>
        </div>
        
        <nav className={styles.navMenu}>
          <Link href="/dashboard" className={`${styles.navItem} ${styles.active}`}>
            <Compass size={20} />
            <span>Los 8 Caminos</span>
          </Link>
          <Link href="/dashboard/torneos" className={styles.navItem}>
            <Trophy size={20} />
            <span>Torneos</span>
          </Link>
          <Link href="/dashboard/tienda" className={styles.navItem}>
            <Store size={20} />
            <span>Tienda Dojo</span>
          </Link>
          <Link href="/dashboard/settings" className={styles.navItem}>
            <Settings size={20} />
            <span>Ajustes</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>A</div>
            <div className={styles.userInfo}>
              <h4>{user.user_metadata?.full_name || "Alumno DOJOIA"}</h4>
              <p>Nivel Inicial</p>
            </div>
          </div>
          <form action="/auth/signout" method="post" style={{ marginTop: '1rem' }}>
            <button type="submit" className={styles.navItem} style={{ width: '100%', border: 'none', background: 'transparent' }}>
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

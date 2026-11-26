import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { useRoleStore } from "@/store/useRoleStore";
import "@/styles/globals.css";

// Prevents Next.js HMR TypeError: Cannot read properties of undefined (reading 'components') during dynamic hot-reloading
if (typeof window !== "undefined") {
  // 1. Guard __NEXT_DATA__
  let currentNextData = (window as any).__NEXT_DATA__ || { components: {} };
  if (!currentNextData.components) {
    currentNextData.components = {};
  }
  
  try {
    Object.defineProperty(window, "__NEXT_DATA__", {
      get() {
        return currentNextData;
      },
      set(newVal) {
        if (newVal) {
          if (!newVal.components) {
            newVal.components = {};
          }
          currentNextData = newVal;
        }
      },
      configurable: true,
    });
  } catch (e) {
    // Fallback if defineProperty fails
    (window as any).__NEXT_DATA__ = currentNextData;
  }

  // 2. Guard window.next.router.components for Next.js hot-reloader
  const win = window as any;
  if (!win.next) {
    win.next = {};
  }
  let currentRouter = win.next.router || { components: {}, pathname: "" };
  if (!currentRouter.components) {
    currentRouter.components = {};
  }
  try {
    Object.defineProperty(win.next, "router", {
      get() {
        return currentRouter;
      },
      set(newRouter) {
        if (newRouter) {
          if (!newRouter.components) {
            newRouter.components = {};
          }
          currentRouter = newRouter;
        }
      },
      configurable: true,
    });
  } catch (e) {
    win.next.router = currentRouter;
  }
}

function GlobalInitializer() {
  const setHospitalLogo = useStore((state) => state.setHospitalLogo);
  const setIndicatorProfiles = useStore((state) => state.setIndicatorProfiles);
  const addUnit = useStore((state) => state.addUnit);
  const hydrateRole = useRoleStore((state) => state.hydrateRole);

  useEffect(() => {
    hydrateRole();
    // 1. Auto-migrate any legacy localStorage data to local computer DB
    const migrateLegacyData = async () => {
      try {
        const rawRisiko = localStorage.getItem("manajemen_risiko");
        const rawSurvei = localStorage.getItem("survei_budaya_local");
        const rawSupervisi = localStorage.getItem("supervisi_k3rs_history");
        const rawLogo = localStorage.getItem("hospital_logo");

        const payload: any = {};
        if (rawRisiko) {
          try { payload.manajemen_risiko = JSON.parse(rawRisiko); } catch (e) {}
        }
        if (rawSurvei) {
          try { payload.survei_budaya = JSON.parse(rawSurvei); } catch (e) {}
        }
        if (rawSupervisi) {
          try { payload.supervisi_k3rs = JSON.parse(rawSupervisi); } catch (e) {}
        }
        if (rawLogo) {
          payload.hospital_logo = rawLogo;
        }

        if (Object.keys(payload).length > 0) {
          await fetch("/api/db", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "migrate_localStorage", payload }),
          });
        }
      } catch (e) {
        console.warn("Auto-migrate legacy data skipped:", e);
      }
    };
    migrateLegacyData();

    // 2. Load Logo from Local Database
    const loadGlobalSettings = async () => {
      try {
        const { data } = await supabase
          .from("welcome_settings")
          .select("image_url")
          .eq("id", "logo")
          .single();

        if (data && data.image_url) {
          localStorage.setItem("hospital_logo", data.image_url);
          setHospitalLogo(data.image_url);
        } else {
          const savedLogo = localStorage.getItem("hospital_logo");
          if (savedLogo) setHospitalLogo(savedLogo);
        }
      } catch (err) {}
    };
    loadGlobalSettings();

    // 3. Central Data Synchronization for Master Indikator & Units
    const syncMasterData = async () => {
      try {
        // Sync Units
        const { data: unitsData } = await supabase.from("units").select("*");
        if (unitsData && Array.isArray(unitsData) && unitsData.length > 0) {
          unitsData.forEach((u: any) => addUnit(u));
        }

        // Sync Master Indikator
        const { data, error } = await supabase
          .from("master_indikator")
          .select("*")
          .order("created_at", { ascending: true });

        if (data && !error) {
          const adapted = data.map((d: any) => ({
            id: d.id,
            category: d.category,
            indicator_title: d.title,
            rationale: d.rationale,
            quality_dimension: d.quality_dimension,
            objective: d.purpose,
            operational_definition: d.operational_definition,
            indicator_type: d.indicator_type,
            measurement_unit: d.measurement_unit === "Rasio" ? "Indeks" : d.measurement_unit,
            numerator: d.numerator,
            denominator: d.denominator,
            target: d.target === null || d.target === undefined ? "" : String(d.target),
            criteria: d.criteria,
            formula: d.formula,
            data_collection_method: d.data_collection_method,
            data_source: d.data_source,
            sampling_method: d.sampling_method,
            data_collection_tool: d.data_collection_instrument,
            sample_size: d.sample_size,
            collection_period: d.collection_period,
            analysis_period: d.analysis_period,
            data_presentation: d.data_presentation,
            person_responsible: d.person_in_charge,
            reverse: d.reverse,
            created_at: d.created_at,
            updated_at: d.updated_at
          }));
          setIndicatorProfiles(adapted);
        }
      } catch (err) {}
    };
    syncMasterData();

    // Central Realtime Sync Channel
    const psqlChannel = supabase
      .channel("master-indikator-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "master_indikator" },
        () => {
          syncMasterData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(psqlChannel);
    };
  }, [setHospitalLogo, setIndicatorProfiles, addUnit, hydrateRole]);

  return null;
}

export default function App({ Component, pageProps, router }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const hospitalLogo = useStore((state) => state.hospitalLogo);

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>UOBK RSUD AL-MULK - Sistem Pelaporan Mutu</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={hospitalLogo || "/favicon.png"} />
        <link rel="shortcut icon" href={hospitalLogo || "/favicon.png"} />
        <link rel="apple-touch-icon" href={hospitalLogo || "/favicon.png"} />
      </Head>
      <GlobalInitializer />
      <Layout router={router}>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  );
}

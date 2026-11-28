import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import GlobalFastDatePicker from "@/components/GlobalFastDatePicker";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { useRoleStore } from "@/store/useRoleStore";
import {
  adaptMasterProfileFromDb,
  mapDbInputsToMutuPayloads,
} from "@/lib/mutuSync";
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

  // 2. Ensure window.next.router always resolves safely before/during hydration
  const win = window as any;
  if (!win.__NEXT_PROXY_GUARDED__) {
    win.__NEXT_PROXY_GUARDED__ = true;
    const fallbackRouter = {
      components: {},
      pathname: window.location?.pathname || "/",
    };
    const wrapNext = (obj: any) => {
      if (!obj || typeof obj !== "object") return obj;
      return new Proxy(obj, {
        get(target, prop, receiver) {
          const val = Reflect.get(target, prop, receiver);
          if (prop === "router") {
            if (!val) return fallbackRouter;
            if (!val.components) val.components = {};
            return val;
          }
          return val;
        },
      });
    };
    try {
      let currentNext = wrapNext(win.next || { router: fallbackRouter });
      Object.defineProperty(window, "next", {
        configurable: true,
        enumerable: true,
        get() {
          return currentNext;
        },
        set(v) {
          currentNext = wrapNext(v);
        },
      });
    } catch (e) {}
  }
}

function GlobalInitializer() {
  const setHospitalLogo = useStore((state) => state.setHospitalLogo);
  const setIndicatorProfiles = useStore((state) => state.setIndicatorProfiles);
  const setDataMutuList = useStore((state) => state.setDataMutuList);
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

    // 3. Central Realtime Synchronization for Units, Master Indikator & Indicator Inputs
    const syncAllData = async () => {
      try {
        const [unitsRes, masterRes, inputsRes] = await Promise.all([
          supabase.from("units").select("*"),
          supabase
            .from("master_indikator")
            .select("*")
            .order("created_at", { ascending: true }),
          supabase
            .from("indicator_inputs")
            .select("*")
            .order("created_at", { ascending: true }),
        ]);

        if (Array.isArray(unitsRes.data) && unitsRes.data.length > 0) {
          unitsRes.data.forEach((u: any) => addUnit(u));
        }

        let activeProfiles = useStore.getState().indicatorProfiles;
        if (Array.isArray(masterRes.data) && !masterRes.error) {
          activeProfiles = masterRes.data.map(adaptMasterProfileFromDb);
          setIndicatorProfiles(activeProfiles);
        }

        if (Array.isArray(inputsRes.data) && !inputsRes.error) {
          setDataMutuList(
            mapDbInputsToMutuPayloads(inputsRes.data, activeProfiles),
          );
        }
      } catch (err) {}
    };
    syncAllData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncAllData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Central Realtime Sync Channel across all core tables
    const psqlChannel = supabase
      .channel("global-optimus-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "master_indikator" },
        () => {
          syncAllData();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "indicator_inputs" },
        () => {
          syncAllData();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "units" },
        () => {
          syncAllData();
        },
      )
      .subscribe();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      supabase.removeChannel(psqlChannel);
    };
  }, [setHospitalLogo, setIndicatorProfiles, setDataMutuList, addUnit, hydrateRole]);

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
      <GlobalFastDatePicker />
      <Layout router={router}>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  );
}

import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "شفاخانه تخصصی چشم الشفاء — سیستم مدیریت" },
      { name: "description", content: "سیستم مدیریت شفاخانه تخصصی چشم الشفاء، هرات" },
      { property: "og:title", content: "شفاخانه تخصصی چشم الشفاء" },
      { property: "og:description", content: "سیستم مدیریت شفاخانه تخصصی چشم الشفاء، هرات" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/dashboard" : "/auth" });
  },
});

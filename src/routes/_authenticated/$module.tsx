import { createFileRoute, notFound } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { PLACEHOLDER_MODULES } from "@/lib/nav";
import { Card, EmptyState, PageHeader, StatusBadge } from "@/components/medical/ui";
import { useCurrentUser } from "@/hooks/use-current-user";
import { canAccess } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/$module")({
  loader: ({ params }) => {
    const item = PLACEHOLDER_MODULES.find((m) => m.key === params.module);
    if (!item) throw notFound();
    return { key: item.key };
  },
  head: ({ loaderData }) => {
    const item = PLACEHOLDER_MODULES.find((m) => m.key === loaderData?.key);
    const t = `${item?.title ?? "بخش"} — شفاخانه چشم الشفاء`;
    return { meta: [{ title: t }, { name: "description", content: item?.description ?? "" }, { property: "og:title", content: t }, { property: "og:description", content: item?.description ?? "" }] };
  },
  component: ModulePage,
});

function ModulePage() {
  const { key } = Route.useLoaderData();
  const item = PLACEHOLDER_MODULES.find((m) => m.key === key)!;
  const { data: me } = useCurrentUser();
  if (me && !canAccess(me.roles, item.roles)) {
    return <Card><EmptyState title="دسترسی ندارید" text="این بخش برای نقش شما فعال نیست." /></Card>;
  }
  return (
    <div>
      <PageHeader title={item.title} subtitle={item.description} actions={<StatusBadge tone="warning">مرحله {item.phase}</StatusBadge>} />
      <Card>
        <EmptyState icon={Construction} title="این بخش در مرحله بعدی ساخته می‌شود" text={item.description} />
      </Card>
    </div>
  );
}

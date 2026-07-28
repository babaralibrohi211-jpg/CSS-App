"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth-context";
import { getUserNotifications, markNotificationRead, AppNotification } from "@/lib/notifications";

const typeIcon: Record<string, string> = {
  quiz_result: "quiz",
  plan_ready: "calendar_month",
  streak: "local_fire_department",
};

function groupByRecency(items: AppNotification[]) {
  const today: AppNotification[] = [];
  const thisWeek: AppNotification[] = [];
  const earlier: AppNotification[] = [];
  const now = new Date();
  for (const n of items) {
    const daysAgo = (now.getTime() - n.createdAt.getTime()) / 86400000;
    if (daysAgo < 1) today.push(n);
    else if (daysAgo < 7) thisWeek.push(n);
    else earlier.push(n);
  }
  return { today, thisWeek, earlier };
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setNotifications(await getUserNotifications(user.uid));
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function handleClick(n: AppNotification) {
    if (n.read) return;
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    try {
      await markNotificationRead(n.id);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const { today, thisWeek, earlier } = groupByRecency(notifications);

  function renderGroup(label: string, items: AppNotification[]) {
    if (items.length === 0) return null;
    return (
      <div>
        <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">{label}</h3>
        <Card className="divide-y divide-outline-variant/30">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-surface-container-low"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  n.read ? "bg-surface-container-high text-on-surface-variant" : "bg-primary-container/20 text-primary"
                }`}
              >
                <Icon name={typeIcon[n.type] || "notifications"} filled={!n.read} className="text-[18px]" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm ${n.read ? "text-on-surface-variant" : "text-on-surface font-medium"}`}>
                  {n.title}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">{n.message}</p>
              </div>
              {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
            </button>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Notifications</h1>
      {notifications.length === 0 ? (
        <Card className="p-10 flex flex-col items-center text-center">
          <Icon name="notifications" className="text-[40px] text-on-surface-variant/40 mb-3" />
          <p className="text-sm text-on-surface-variant">
            Nothing yet. You'll see updates here after quizzes and study plan generations.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {renderGroup("Today", today)}
          {renderGroup("This Week", thisWeek)}
          {renderGroup("Earlier", earlier)}
        </div>
      )}
    </div>
  );
}
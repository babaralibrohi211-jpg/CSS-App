import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

export type NotificationType = "quiz_result" | "plan_ready" | "streak";

export async function createNotification(params: {
  uid: string;
  type: NotificationType;
  title: string;
  message: string;
}) {
  await addDoc(collection(db, "notifications"), {
    uid: params.uid,
    type: params.type,
    title: params.title,
    message: params.message,
    read: false,
    createdAt: new Date(),
  });
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export async function getUserNotifications(uid: string): Promise<AppNotification[]> {
  const snap = await getDocs(query(collection(db, "notifications"), where("uid", "==", uid)));
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        type: data.type,
        title: data.title,
        message: data.message,
        read: data.read,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      } as AppNotification;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(db, "notifications", id), { read: true });
}
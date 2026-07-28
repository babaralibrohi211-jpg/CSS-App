import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";

export type BookmarkType = "subject" | "book" | "note" | "pastPaper";

function bookmarkId(uid: string, itemType: BookmarkType, itemId: string) {
  return `${uid}_${itemType}_${itemId}`;
}

export async function isBookmarked(uid: string, itemType: BookmarkType, itemId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "bookmarks", bookmarkId(uid, itemType, itemId)));
  return snap.exists();
}

export async function toggleBookmark(params: {
  uid: string;
  itemType: BookmarkType;
  itemId: string;
  title: string;
  subjectId: string;
  subjectName: string;
  linkUrl: string;
}): Promise<boolean> {
  const id = bookmarkId(params.uid, params.itemType, params.itemId);
  const ref = doc(db, "bookmarks", id);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, {
    uid: params.uid,
    itemType: params.itemType,
    itemId: params.itemId,
    title: params.title,
    subjectId: params.subjectId,
    subjectName: params.subjectName,
    linkUrl: params.linkUrl,
    createdAt: new Date(),
  });
  return true;
}

export interface Bookmark {
  id: string;
  itemType: BookmarkType;
  itemId: string;
  title: string;
  subjectId: string;
  subjectName: string;
  linkUrl: string;
  createdAt: Date;
}

export async function getUserBookmarks(uid: string): Promise<Bookmark[]> {
  const snap = await getDocs(query(collection(db, "bookmarks"), where("uid", "==", uid)));
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        itemType: data.itemType,
        itemId: data.itemId,
        title: data.title,
        subjectId: data.subjectId,
        subjectName: data.subjectName,
        linkUrl: data.linkUrl,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      } as Bookmark;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function removeBookmarkById(id: string): Promise<void> {
  await deleteDoc(doc(db, "bookmarks", id));
}
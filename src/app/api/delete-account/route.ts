import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase";

export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Account deletion isn't available right now. Contact support to delete your account." }, { status: 503 });
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Sign in again to delete your account." }, { status: 401 });
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error: userError } = await admin.auth.getUser(token);
  if (userError || !data.user) {
    return NextResponse.json({ error: "Your session has expired. Sign in again to delete your account." }, { status: 401 });
  }

  const id = data.user.id;
  // Explicit deletes so removal doesn't depend on every foreign key having ON DELETE CASCADE.
  const results = await Promise.all([
    admin.from("watchlist").delete().eq("user_id", id),
    admin.from("recommendations").delete().eq("sender_id", id),
    admin.from("friendships").delete().or(`user_id.eq.${id},friend_id.eq.${id}`),
  ]);
  const profileResult = await admin.from("profiles").delete().eq("id", id);
  const failed = [...results, profileResult].find((r) => r.error);
  const { error: deleteError } = failed ? { error: failed.error } : await admin.auth.admin.deleteUser(id);

  if (deleteError) {
    console.error("Account deletion failed:", deleteError);
    return NextResponse.json({ error: "Unable to delete your account. Try again in a moment." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

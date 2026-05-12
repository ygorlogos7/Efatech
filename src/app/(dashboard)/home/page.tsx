import { auth } from "@/auth";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const session = await auth();
  const userDisplayName =
    session?.user?.name?.trim() ||
    (session?.user?.email
      ? session.user.email.split("@")[0]?.trim() || null
      : null);

  return <HomeClient userDisplayName={userDisplayName} />;
}

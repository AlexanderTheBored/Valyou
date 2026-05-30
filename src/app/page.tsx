import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  // Self-host escape hatch — see src/proxy.ts. Skip the login gate when
  // NEXT_PUBLIC_DISABLE_AUTH=true and go straight into the app.
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === "true") {
    redirect("/map");
  }

  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("valyou_auth");

  if (isAuthenticated) {
    redirect("/map");
  } else {
    redirect("/auth");
  }

  // Homepage placeholder — kept for future use
  // return (
  //   <main>
  //     <h1>Welcome to Valyou</h1>
  //   </main>
  // );
}

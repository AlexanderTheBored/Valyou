import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
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

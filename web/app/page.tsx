import { redirect } from "next/navigation";

/** Root just forwards into the app; middleware handles the auth redirect. */
export default function HomePage() {
  redirect("/today");
}

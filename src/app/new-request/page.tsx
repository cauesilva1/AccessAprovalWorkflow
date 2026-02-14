import { redirect } from "next/navigation";

export default function NewRequestRedirect() {
  redirect("/dashboard?open=new");
}

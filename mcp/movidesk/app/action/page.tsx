import { redirect } from "next/navigation";

export default function LegacyActionPage() {
  redirect("/docs#action");
}

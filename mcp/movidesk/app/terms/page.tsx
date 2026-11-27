import { redirect } from "next/navigation";

export default function LegacyTermsPage() {
  redirect("/docs#terms");
}

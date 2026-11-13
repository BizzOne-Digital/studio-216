import { SubmissionManager } from "@/components/admin/SubmissionManager";

export const metadata = { title: "Quotes" };

export default function Page() {
  return <SubmissionManager kind="quotes" />;
}

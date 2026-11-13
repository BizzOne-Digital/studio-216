import { SubmissionManager } from "@/components/admin/SubmissionManager";

export const metadata = { title: "Inquiries" };

export default function Page() {
  return <SubmissionManager kind="inquiries" />;
}

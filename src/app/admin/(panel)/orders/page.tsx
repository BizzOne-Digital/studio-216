import { SubmissionManager } from "@/components/admin/SubmissionManager";

export const metadata = { title: "Orders" };

export default function Page() {
  return <SubmissionManager kind="orders" />;
}

import type { Metadata } from "next";
import IntakeFlow from "./IntakeFlow";

// Client demonstration. Kept out of search results; share the direct link only.
export const metadata: Metadata = {
  title: "CCL Creative Intake Demo | World Shift Technologies",
  description:
    "A working prototype of a guided creative intake: group-code routing, three workflow levels, conditional questions, and a preview of the ClickUp task it would create.",
  robots: { index: false, follow: false },
};

export default function CclCreativeIntakeDemoPage() {
  return <IntakeFlow />;
}

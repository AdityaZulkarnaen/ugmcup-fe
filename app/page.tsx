import type { Metadata } from "next";
import LandingPage from "@/modules/landing";
import { JsonLd } from "@/components/seo/JsonLd";
import { eventSchema, schemaGraph } from "@/lib/schema";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

/**
 * `title.absolute` opts out of the `%s | UGM CUP 2026` template, which would
 * otherwise append the brand to a title that already leads with it.
 */
export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/*
        The tournament as an entity — date, venue, sport. This is what can put
        the event into Google's event results, and it only belongs on the page
        that is actually about the whole tournament.
      */}
      <JsonLd data={schemaGraph(eventSchema)} />
      <LandingPage />
    </>
  );
}

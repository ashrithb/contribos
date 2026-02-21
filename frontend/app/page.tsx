"use client";
import { useContribOS } from "@/lib/websocket";
import { Header } from "@/components/header";
import { ContributorSidebar } from "@/components/contributor-sidebar";
import { ChannelFeed } from "@/components/channel-feed";
import { RevenueDashboard } from "@/components/revenue-dashboard";
import { ValueFlow } from "@/components/value-flow";
import { HowItWorks } from "@/components/how-it-works";

const SPLITTER_ADDRESS =
  process.env.NEXT_PUBLIC_SPLITTER_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

export default function Home() {
  const {
    events,
    contributors,
    totalRevenue,
    requestCount,
    connected,
    lastPayment,
  } = useContribOS();

  return (
    <div className="flex h-screen flex-col">
      <Header splitterAddress={SPLITTER_ADDRESS} />

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Contributor Sidebar */}
        <div className="hidden lg:flex w-72 shrink-0 flex-col gap-2 border-r border-border p-2">
          <HowItWorks />
          <div className="flex-1 min-h-0">
            <ContributorSidebar contributors={contributors} />
          </div>
        </div>

        {/* Center — Value Flow + Activity Feed */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 p-2">
          <ValueFlow
            lastPayment={lastPayment}
            totalRevenue={totalRevenue}
            requestCount={requestCount}
          />
          <div className="flex-1 min-h-0">
            <ChannelFeed events={events} connected={connected} />
          </div>
        </div>

        {/* Right — Revenue Dashboard */}
        <div className="hidden lg:block w-80 shrink-0 border-l border-border p-2">
          <RevenueDashboard
            events={events}
            totalRevenue={totalRevenue}
            requestCount={requestCount}
            contributors={contributors}
          />
        </div>
      </div>
    </div>
  );
}

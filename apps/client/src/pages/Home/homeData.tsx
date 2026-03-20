import React from "react";
import { BrowserIcon } from "../../icons/BrowserIcon";
import { ClaudeIcon } from "../../icons/ClaudeIcon";
import { DiscordIcon } from "../../icons/DiscordIcon";
import { GitHubIcon } from "../../icons/GitHubIcon";
import { GmailIcon } from "../../icons/GmailIcon";
import { GptIcon } from "../../icons/GptIcon";
import { HueIcon } from "../../icons/HueIcon";
import { IMessageIcon } from "../../icons/IMessageIcon";
import { ObsidianIcon } from "../../icons/ObsidianIcon";
import { SignalIcon } from "../../icons/SignalIcon";
import { SlackIcon } from "../../icons/SlackIcon";
import { SpotifyIcon } from "../../icons/SpotifyIcon";
import { TelegramIcon } from "../../icons/TelegramIcon";
import { TwitterIcon } from "../../icons/TwitterIcon";
import { WhatsAppIcon } from "../../icons/WhatsAppIcon";
import { CardData } from "../../dataModel/dataModel";

export interface PillData {
  label: string;
  icon: React.ReactNode;
}

export const extensionCards: CardData[] = [
  {
    name: "signal-check",
    handle: "@hmmm/signal-check",
    description:
      "Cross-check a claim across major outlets and highlight where coverage converges or drifts.",
    kinds: ["Context", "Commands"],
    score: 3908,
    badge: "SC",
    accent: "from-fuchsia-500/30 via-violet-500/18 to-transparent",
  },
  {
    name: "critical-lens",
    handle: "@hmmm/critical-lens",
    description:
      "Inject deliberate skepticism into your workflow and force a second pass on weak assumptions.",
    kinds: ["Commands", "Skills"],
    score: 105,
    badge: "CL",
    accent: "from-indigo-500/30 via-violet-500/18 to-transparent",
  },
  {
    name: "context7",
    handle: "@upstash/context7",
    description:
      "Keep current documentation and supporting references close while you inspect a story or claim.",
    kinds: ["MCP"],
    score: 48285,
    badge: "C7",
    accent: "from-violet-500/24 via-sky-500/10 to-transparent",
  },
  {
    name: "headline-diff",
    handle: "@hmmm/headline-diff",
    description:
      "Compare how the same event is framed across publications and surface the strongest language shifts.",
    kinds: ["Context", "Commands"],
    score: 2814,
    badge: "HD",
    accent: "from-amber-500/18 via-violet-500/16 to-transparent",
  },
  {
    name: "evidence-trail",
    handle: "@hmmm/evidence-trail",
    description:
      "Track linked sources, quoted claims, and missing attribution before you trust the summary.",
    kinds: ["MCP", "Skills"],
    score: 1187,
    badge: "ET",
    accent: "from-cyan-500/20 via-violet-500/18 to-transparent",
  },
  {
    name: "briefing-room",
    handle: "@hmmm/briefing-room",
    description:
      "Generate a compact, source-aware briefing for a topic you follow every day.",
    kinds: ["Commands"],
    score: 940,
    badge: "BR",
    accent: "from-emerald-500/18 via-violet-500/16 to-transparent",
  },
  {
    name: "bias-watch",
    handle: "@hmmm/bias-watch",
    description:
      "Spot emotionally loaded language, framing shortcuts, and selective omission patterns.",
    kinds: ["Skills", "Context"],
    score: 2765,
    badge: "BW",
    accent: "from-rose-500/20 via-violet-500/15 to-transparent",
  },
  {
    name: "rapid-recap",
    handle: "@hmmm/rapid-recap",
    description:
      "Collapse a noisy news cycle into a clean timeline before you dive into article-level detail.",
    kinds: ["Commands", "MCP"],
    score: 1720,
    badge: "RR",
    accent: "from-sky-500/20 via-violet-500/16 to-transparent",
  },
  {
    name: "verification-pack",
    handle: "@hmmm/verification-pack",
    description:
      "Bundle repeatable checks for screenshots, statements, and viral claims into one workflow.",
    kinds: ["MCP", "Skills", "Commands"],
    score: 3204,
    badge: "VP",
    accent: "from-fuchsia-500/22 via-indigo-500/15 to-transparent",
  },
];

export const integrations: PillData[] = [
  { label: "WhatsApp", icon: <WhatsAppIcon /> },
  { label: "Telegram", icon: <TelegramIcon /> },
  { label: "Discord", icon: <DiscordIcon /> },
  { label: "Slack", icon: <SlackIcon /> },
  { label: "Signal", icon: <SignalIcon /> },
  { label: "iMessage", icon: <IMessageIcon /> },
  { label: "Claude", icon: <ClaudeIcon /> },
  { label: "GPT", icon: <GptIcon /> },
  { label: "Spotify", icon: <SpotifyIcon /> },
  { label: "Hue", icon: <HueIcon /> },
  { label: "Obsidian", icon: <ObsidianIcon /> },
  { label: "Twitter", icon: <TwitterIcon /> },
  { label: "Browser", icon: <BrowserIcon /> },
  { label: "Gmail", icon: <GmailIcon /> },
  { label: "GitHub", icon: <GitHubIcon /> },
];

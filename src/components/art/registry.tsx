import type { ServiceArt } from "@/lib/services";
import { BlockStack, BotBuddy, CursorBuddy, WindowBuddy, type ArtProps } from "./characters";
import { AutomationBuddy, BoardBuddy, ChartBuddy, ChatBuddy, LaptopBuddy, PhoneBuddy } from "./scenes";

/** One illustration per service. Add a new service art here and in `ServiceArt`. */
const MAP: Record<ServiceArt, (p: ArtProps) => React.JSX.Element> = {
  blocks: BlockStack,
  bot: BotBuddy,
  automation: AutomationBuddy,
  window: WindowBuddy,
  phone: PhoneBuddy,
  laptop: LaptopBuddy,
  board: BoardBuddy,
  chat: ChatBuddy,
  cursor: CursorBuddy,
  chart: ChartBuddy,
};

export function ServiceArtView({ art, className, style }: { art: ServiceArt } & ArtProps) {
  const C = MAP[art] ?? BlockStack;
  return <C className={className} style={style} />;
}

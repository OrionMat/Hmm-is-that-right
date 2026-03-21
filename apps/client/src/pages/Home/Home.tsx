import { Card } from "./components/Card";
import { Pill } from "./components/Pill";
import { extensionCards, integrations } from "./homeData";

export const Home = () => {
  return (
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(111,76,255,0.18),_transparent_22%),radial-gradient(circle_at_60%_20%,_rgba(165,121,255,0.12),_transparent_24%),linear-gradient(180deg,_#030306_0%,_#05040a_38%,_#040308_100%)] text-white">
      <div className="mx-auto w-full max-w-[1680px] px-6 py-8 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-[38rem] -translate-x-1/2 bg-[radial-gradient(circle,_rgba(124,92,255,0.3),_transparent_64%)] blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8">
          {/* Header Section: Integrations & Title */}
          <section
            aria-labelledby="integrations-title"
            className="rounded-[30px] border border-white/7 bg-[linear-gradient(180deg,rgba(9,8,18,0.92),rgba(5,5,12,0.94))] px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:px-8"
          >
            <div className="flex items-center gap-4">
              <span
                className="font-mono text-3xl font-bold text-surface-accent"
                aria-hidden="true"
              >
                &gt;
              </span>
              <h2
                id="integrations-title"
                className="font-sans text-3xl font-semibold tracking-[-0.05em] text-surface-heading lg:text-4xl"
              >
                Works With Everything
              </h2>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              {integrations.map((integration) => (
                <Pill
                  key={integration.label}
                  label={integration.label}
                  icon={integration.icon}
                />
              ))}
            </div>
          </section>

          {/* Extensions/Cards Section */}
          <section aria-label="Available Extensions and Tools">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {extensionCards.map((card) => (
                <Card key={`${card.name}-${card.handle}`} card={card} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

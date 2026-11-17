"use client";

const destinations = [
  { label: "Island map", icon: "🗺️", target: "#island-map" },
  { label: "Crew cottage", icon: "🏡", heading: "The team is ready when you are." },
  { label: "Lead garden", icon: "🌼", heading: "Lead board" },
  { label: "Activity treehouse", icon: "🌳", heading: "Agent activity" },
  { label: "Post office", icon: "✉️", heading: "Approval queue" },
];

export default function CartoonlandNav() {
  function visit(heading: string) {
    const target = Array.from(document.querySelectorAll<HTMLElement>("h2")).find((item) => item.textContent?.includes(heading));
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    const panel = target.closest<HTMLElement>(".panel, .team-panel");
    panel?.classList.add("cartoonland-arrival");
    window.setTimeout(() => panel?.classList.remove("cartoonland-arrival"), 1200);
  }

  return (
    <nav className="cartoonland-nav" aria-label="Explore Cartoonland">
      <span className="cartoonland-nav-label">✨ EXPLORE THE ISLAND</span>
      <div className="cartoonland-tabs">
        {destinations.map((destination) => destination.target ? (
          <a className="cartoonland-tab" href={destination.target} key={destination.label}>
            <span className="cartoonland-tab-icon" aria-hidden="true">{destination.icon}</span><span>{destination.label}</span>
          </a>
        ) : (
          <button className="cartoonland-tab" key={destination.label} onClick={() => visit(destination.heading!)}>
            <span className="cartoonland-tab-icon" aria-hidden="true">{destination.icon}</span><span>{destination.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

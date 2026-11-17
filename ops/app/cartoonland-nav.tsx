"use client";

const destinations = [
  { label: "Crew cottage", heading: "The team is ready when you are.", icon: "🏡", color: "mint" },
  { label: "Lead garden", heading: "Lead board", icon: "🌼", color: "peach" },
  { label: "Treehouse", heading: "Agent activity", icon: "🪵", color: "blue" },
  { label: "Post office", heading: "Approval queue", icon: "✉️", color: "lilac" },
  { label: "Harbor", heading: "Operations hub", icon: "⚓", color: "sun" },
  { label: "Workshop", heading: "Welcome to Cartoonland!", icon: "🧰", color: "grass" },
];

export default function CartoonlandNav() {
  function visit(heading: string) {
    const target = Array.from(document.querySelectorAll<HTMLElement>("h2")).find((item) => item.textContent?.includes(heading));
    const targetHeading = Array.from(document.querySelectorAll<HTMLElement>("h1")).find((item) => item.textContent?.includes(heading));
    const element = target ?? targetHeading;
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.closest(".panel, .team-panel, .island-workshop")?.classList.add("cartoonland-arrival");
    window.setTimeout(() => element?.closest(".panel, .team-panel, .island-workshop")?.classList.remove("cartoonland-arrival"), 1200);
  }

  return (
    <nav className="cartoonland-nav" aria-label="Explore your workspace">
      <div className="cartoonland-nav-intro"><span>🧭</span><div><strong>Pick a place to visit</strong><small>Your little island, all connected</small></div></div>
      <div className="cartoonland-tabs">
        {destinations.map((destination) => (
          <button className={`cartoonland-tab ${destination.color}`} key={destination.label} onClick={() => visit(destination.heading)}>
            <span className="cartoonland-tab-icon" aria-hidden="true">{destination.icon}</span>
            <span>{destination.label}</span><span className="tab-arrow" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

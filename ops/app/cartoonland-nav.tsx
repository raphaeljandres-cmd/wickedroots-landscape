"use client";

const destinations = [
  { label: "Island map", icon: "🗺️", target: "#island-map" },
  { label: "Crew cottage", icon: "🏡", target: "#crew" },
  { label: "Lead garden", icon: "🌼", target: "#garden" },
  { label: "Treehouse", icon: "🌳", target: "#treehouse" },
  { label: "Post office", icon: "✉️", target: "#post-office" },
  { label: "Workshop", icon: "🧰", target: "#workshop" },
];

export default function CartoonlandNav() {
  return (
    <nav className="cartoonland-nav" aria-label="Explore Cartoonland">
      <span className="cartoonland-nav-label">✨ EXPLORE THE ISLAND</span>
      <div className="cartoonland-tabs">
        {destinations.map((destination) => (
          <a className="cartoonland-tab" href={destination.target} key={destination.label}>
            <span className="cartoonland-tab-icon" aria-hidden="true">{destination.icon}</span><span>{destination.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

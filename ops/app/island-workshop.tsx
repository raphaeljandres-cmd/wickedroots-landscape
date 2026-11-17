type District = { id: string; title: string; subtitle: string; kind: string; icon: string; person: string; activity: string; className: string };

const districts: District[] = [
  { id: "crew", title: "Crew Cottage", subtitle: "The crew's cozy home", kind: "cottage", icon: "🏡", person: "Fern", activity: "planning today's route", className: "district-crew" },
  { id: "garden", title: "Lead Garden", subtitle: "Where new leads grow", kind: "garden-house", icon: "🌼", person: "Pip", activity: "planting a fresh idea", className: "district-garden" },
  { id: "treehouse", title: "Activity Treehouse", subtitle: "A lookout for every task", kind: "treehouse-house", icon: "🌳", person: "Oak", activity: "checking the day's work", className: "district-treehouse" },
  { id: "post-office", title: "Post Office", subtitle: "Thoughtful notes, ready to go", kind: "post-house", icon: "✉️", person: "Pip", activity: "writing a friendly note", className: "district-post" },
  { id: "workshop", title: "Workshop", subtitle: "Tools, plans & good ideas", kind: "workshop-house", icon: "🧰", person: "Fern", activity: "building a new plan", className: "district-workshop" },
  { id: "harbor", title: "Sunny Harbor", subtitle: "A little break by the sea", kind: "harbor-house", icon: "⚓", person: "Oak", activity: "taking a tiny tea break", className: "district-harbor" },
];

export default function IslandWorkshop() {
  return (
    <section className="island-workshop" aria-labelledby="island-title">
      <div className="island-copy">
        <p className="island-eyebrow">A LITTLE PLACE FOR GOOD WORK</p>
        <h1 id="island-title">Cartoonland</h1>
        <p className="island-intro">A sunny island where the crew plans, writes, and gets things done. Pick a place to explore!</p>
      </div>
      <div className="island-scene" role="img" aria-label="A full-screen cartoon island village with colorful houses, tiny crew members walking and working, and playful speech bubbles">
        <div className="scene-sun" aria-hidden="true"><span>✦</span></div>
        <div className="scene-cloud cloud-one" aria-hidden="true" />
        <div className="scene-cloud cloud-two" aria-hidden="true" />
        <div className="scene-cloud cloud-three" aria-hidden="true" />
        <div className="scene-water water-back" aria-hidden="true" />
        <div className="scene-water water-front" aria-hidden="true" />
        <div className="scene-island">
          <div className="scene-path path-loop" aria-hidden="true" />
          <div className="scene-path path-cross" aria-hidden="true" />
          <div className="scene-pond" aria-hidden="true"><span>✦</span></div>
          <div className="scene-tree tree-left" aria-hidden="true" /><div className="scene-tree tree-right" aria-hidden="true" /><div className="scene-tree tree-top" aria-hidden="true" />
          {districts.map((district) => (
            <article id={district.id} className={`island-district ${district.className}`} key={district.id}>
              <div className={`district-building ${district.kind}`} aria-hidden="true">
                <span className="building-roof" /><span className="building-body"><i className="building-window window-one" /><i className="building-window window-two" /><i className="building-door" /></span>
                {district.kind === "treehouse-house" && <><span className="treehouse-trunk" /><span className="treehouse-leaves" /></>}
                {district.kind === "workshop-house" && <span className="workshop-tools">⚒</span>}
                {district.kind === "post-house" && <span className="post-flag">✉</span>}
              </div>
              <div className="district-sign"><span>{district.icon}</span><strong>{district.title}</strong><small>{district.subtitle}</small></div>
              <div className={`island-worker ${district.person.toLowerCase()} ${district.className}-worker`} aria-label={`${district.person} is ${district.activity}`}>
                <span className="worker-speech"><b>{district.activity}</b></span>
                <span className="worker-body"><i className="worker-face">{district.person[0]}</i><i className="worker-torso" /><i className="worker-arm" /><i className="worker-leg leg-left" /><i className="worker-leg leg-right" /></span>
              </div>
            </article>
          ))}
          <div className="island-butterfly butterfly-one" aria-hidden="true">🦋</div><div className="island-butterfly butterfly-two" aria-hidden="true">🦋</div>
        </div>
        <span className="scene-tag"><b>WELCOME TO THE ISLAND WORKSHOP</b></span>
      </div>
    </section>
  );
}

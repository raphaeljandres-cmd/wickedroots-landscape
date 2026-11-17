type CrewMember = {
  name: string;
  role: string;
  initials: string;
  className: string;
};

const crew: CrewMember[] = [
  { name: "Fern", role: "Finding the best-fit leads", initials: "F", className: "fern" },
  { name: "Pip", role: "Writing a thoughtful draft", initials: "P", className: "pip" },
  { name: "Oak", role: "Checking every detail", initials: "O", className: "oak" },
];

export default function IslandWorkshop() {
  return (
    <section className="island-workshop" aria-labelledby="island-title">
      <div className="island-copy">
        <p className="island-eyebrow">A LITTLE PLACE FOR GOOD WORK</p>
        <h1 id="island-title">Welcome to Cartoonland!</h1>
        <p className="island-intro">A sunny little island where your crew plans, writes, and checks together. Everything is mapped out and ready to explore.</p>
        <div className="island-crew" aria-label="Meet your crew">
          {crew.map((member) => (
            <div className="island-crew-card" key={member.name}>
              <span className={`island-avatar ${member.className}`}>{member.initials}</span>
              <span><strong>{member.name}</strong><small>{member.role}</small></span>
            </div>
          ))}
        </div>
        <p className="island-note"><span aria-hidden="true" /> Your crew is ready for a busy day</p>
      </div>

      <div className="island-scene" role="img" aria-label="A colorful cartoon island village with houses, a workshop, a garden, and tiny workers walking around">
        <div className="scene-sun" />
        <div className="scene-cloud cloud-one" />
        <div className="scene-cloud cloud-two" />
        <div className="scene-water water-back" />
        <div className="scene-water water-front" />
        <div className="scene-tag"><b>ISLAND WORKSHOP</b></div>
        <div className="scene-island">
          <div className="scene-tree tree-left" />
          <div className="scene-tree tree-right" />
          <div className="scene-road" />
          <div className="scene-plot plot-crew red"><span>Crew</span><small className="mini-label">Cottage</small></div>
          <div className="scene-plot plot-garden green"><span>Lead</span><small className="mini-label">Garden</small></div>
          <div className="scene-plot plot-activity blue"><span>Activity</span><small className="mini-label">Treehouse</small></div>
          <div className="scene-plot plot-mail purple"><span>Mail</span><small className="mini-label">Office</small></div>
          <div className="scene-plot plot-harbor gold"><span>Harbor</span><small className="mini-label">Dock</small></div>
          <div className="scene-plot plot-workshop pink"><span>Workshop</span><small className="mini-label">Studio</small></div>
          <div className="scene-lighthouse" />
          <div className="scene-mini-people">
            <div className="person green a" />
            <div className="person pink b" />
            <div className="person blue c" />
            <div className="person yellow d" />
          </div>
        </div>
        <span className="scene-caption">THE ISLAND WORKSHOP <span>✦</span></span>
      </div>
    </section>
  );
}

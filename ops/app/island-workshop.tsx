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
        <h1 id="island-title">Welcome to the island.</h1>
        <p className="island-intro">Your crew has a workshop here. Start a task in the workspace below and watch them get moving.</p>
        <div className="island-crew" aria-label="Meet your crew">
          {crew.map((member) => (
            <div className="island-crew-card" key={member.name}>
              <span className={`island-avatar ${member.className}`}>{member.initials}</span>
              <span><strong>{member.name}</strong><small>{member.role}</small></span>
            </div>
          ))}
        </div>
        <p className="island-note"><span aria-hidden="true" /> Ready for your next task</p>
      </div>

      <div className="island-scene" role="img" aria-label="A small tropical island workshop, with three animated crew members walking between their workstations">
        <div className="scene-sun" />
        <div className="scene-cloud cloud-one" />
        <div className="scene-cloud cloud-two" />
        <div className="scene-water water-back" />
        <div className="scene-water water-front" />
        <div className="scene-island">
          <div className="scene-palm palm-one"><i /><b /></div>
          <div className="scene-palm palm-two"><i /><b /></div>
          <div className="scene-cabin"><div className="cabin-roof" /><div className="cabin-wall"><span className="cabin-window" /><span className="cabin-door" /></div><div className="cabin-sign">WORKSHOP</div></div>
          <div className="scene-desk desk-one"><span /><i /><b /></div>
          <div className="scene-desk desk-two"><span /><i /><b /></div>
          <div className="scene-path" />
          <div className="walking-agent agent-fern"><span className="agent-face">F</span><i /><b /></div>
          <div className="walking-agent agent-pip"><span className="agent-face">P</span><i /><b /></div>
          <div className="walking-agent agent-oak"><span className="agent-face">O</span><i /><b /></div>
          <div className="scene-flower flower-one">✿</div><div className="scene-flower flower-two">✿</div>
        </div>
        <span className="scene-caption">THE ISLAND WORKSHOP <span>✦</span></span>
      </div>
    </section>
  );
}

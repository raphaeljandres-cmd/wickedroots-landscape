document.addEventListener("DOMContentLoaded", () => {
  const nodes = document.querySelectorAll(".node");

  let index = 0;
  setInterval(() => {
    nodes.forEach((node) => node.classList.remove("active"));
    const activeNode = nodes[index % nodes.length];
    activeNode.classList.add("active");
    index += 1;
  }, 1500);
});

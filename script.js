document.addEventListener("DOMContentLoaded", () => {
  const nodes = document.querySelectorAll(".node");

  if (!nodes.length) return;

  let currentIndex = 0;

  const updateNodes = () => {
    nodes.forEach((node) => node.classList.remove("active"));
    nodes[currentIndex % nodes.length].classList.add("active");
    currentIndex += 1;
  };

  updateNodes();
  setInterval(updateNodes, 1500);
});

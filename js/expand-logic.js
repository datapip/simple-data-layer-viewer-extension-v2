chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const data = JSON.parse(request);
  document.title = data.name;
  const node = renderjson.set_icons("▼ ", "▲ ").set_show_to_level("all")(
    JSON.parse(data.layer)
  );
  node.classList.add("is-active");
  node.style.backgroundColor = "white";
  document.querySelector("#main").appendChild(node);
});

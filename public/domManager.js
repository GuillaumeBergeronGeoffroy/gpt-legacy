let domTree = {
  id: "body",
  childNodes: [],
};
let id = 0;

function searchDomTree(id, currentDomTree = null) {
  if (!currentDomTree) {
    currentDomTree = domTree;
  }
  if (id == "body") {
    return domTree;
  }
  currentDomTree.childNodes.forEach((childNode) => {
    if (childNode.id === id) {
      return childNode;
    } else {
      return searchDomTree(id, childNode);
    }
  });
}

function addTemplate(
  templateName,
  template,
  appendElementTo = "body",
  appendOrPrepend = "append"
) {
  // add to dom
  id++;
  const templateElement = document.createElement("div");
  templateElement.innerHTML = template;
  templateElement.id = id;
  // prepend or append to body
  if (appendOrPrepend === "append") {
    document.querySelector(appendElementTo).appendChild(templateElement);
  } else {
    document.querySelector(appendElementTo).prepend(templateElement);
  }
  // add to domTree object (for future reinitialization of dom based on domTree)
  let parent = searchDomTree(appendElementTo);

  let node = {
    id: id,
    templateName: templateName,
    template: template,
    node: templateElement,
    childNodes: [],
  };
  parent.childNodes.push(node);

  return templateElement;
}

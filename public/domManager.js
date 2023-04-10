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

function addTemplate(templateName, template, appendElementTo = "body") {
  // add to dom
  id++;
  const templateElement = document.createElement("div");
  templateElement.innerHTML = template;
  templateElement.id = id;
  document.querySelector(appendElementTo).appendChild(templateElement);
  // add to domTree object (for future reinitialization of dom based on domTree)
  let parent = searchDomTree(appendElementTo);
  console.log(parent);

  let node = {
    id: id,
    templateName: templateName,
    template: template,
    node: templateElement,
    childNodes: [],
  };
  parent.childNodes.push(node);

  return node;
}

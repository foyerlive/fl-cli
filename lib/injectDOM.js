"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _default = (description = 'div', parentNode = null) => {
  const [type, classNames] = description.split('.');
  const node = document.createElement(type);

  if (classNames) {
    node.className = classNames;
  }

  if (parentNode == null) {
    document.body.appendChild(node);
  } else {
    parentNode.appendChild(node);
  }

  return node;
};

exports.default = _default;
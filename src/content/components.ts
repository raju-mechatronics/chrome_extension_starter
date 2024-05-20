export const createButton = (
  text: string,
  options: {
    onClick?: () => void;
    className?: string;
    id?: string;
    attrs?: Record<string, string>;
    parent?: HTMLElement;
    style?: Partial<CSSStyleDeclaration>;
  }
) => {
  const button = document.createElement("button");
  button.textContent = text;
  if (options.onClick) button.onclick = options.onClick;
  if (options.className) {
    button.className = options.className;
  }
  if (options.id) {
    button.id = options.id;
  }
  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) {
      button.setAttribute(key, value);
    }
  }
  if (options.style) {
    for (const [key, value] of Object.entries(options.style)) {
      //@ts-ignore
      button.style[key] = value;
    }
  }
  if (options.parent) {
    options.parent.appendChild(button);
  } else {
    document.body.appendChild(button);
  }

  return button;
};

//add a upload button to this page that upload the xlsx file and read
export function addUploadButton() {
  const uploadButton = document.createElement("input");
  uploadButton.type = "file";
  uploadButton.accept = ".xlsx";
  return uploadButton;
}

type t1 = "top" | "bottom";
type t2 = "left" | "right";

type position = `${t1}-${t2}`;

export function addButtonContainer(
  pos: position,
  posX: number = 10,
  posY: number = 10
) {
  const buttonContainer = document.createElement("div");
  buttonContainer.style.position = "fixed";

  if (pos === "top-left") {
    buttonContainer.style.top = `${posY}px`;
    buttonContainer.style.left = `${posX}px`;
  } else if (pos === "top-right") {
    buttonContainer.style.top = `${posY}px`;
    buttonContainer.style.right = `${posX}px`;
  } else if (pos === "bottom-left") {
    buttonContainer.style.bottom = `${posY}px`;
    buttonContainer.style.left = `${posX}px`;
  } else if (pos === "bottom-right") {
    buttonContainer.style.bottom = `${posY}px`;
    buttonContainer.style.right = `${posX}px`;
  }

  buttonContainer.style.zIndex = "9999";
  //add flex
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "row";
  buttonContainer.style.alignItems = "center";
  buttonContainer.style.gap = "5px";
  document.body.appendChild(buttonContainer);
  return buttonContainer;
}

import axios from "axios";
import fs from "fs";
import jsdom from "jsdom";
import path from "path";

import satori, { SatoriOptions } from "satori";

const SpaceGroteskFont = fs.readFileSync(
  path.join(__dirname, "./assets/fonts/SpaceGrotesk-Regular.ttf"),
);
const SpaceGroteskFontBold = fs.readFileSync(
  path.join(__dirname, "./assets/fonts/SpaceGrotesk-Bold.ttf"),
);

const Node = new jsdom.JSDOM().window.Node;

export type MetadataOptions = {
  chainId: string;
  contract: string;
  tokenId: string;
  scriptId?: string;
};

export type TsMetadata = {
  name: string;
  label: string;
  meta: {
    description?: string;
    aboutUrl?: string;
    iconUrl?: string;
    imageUrl?: string;
    backgroundImageUrl?: string;
  };
  signed: boolean;
  actions: { name: string; label: string; buttonClass?: string }[];
  cssStr: string;
};

export type TokenMetadata = {
  image: string;
  description: string;
  name: string;
};

export type TokenViewData = {
  tokenMetadata?: TokenMetadata;
  tsMetadata: TsMetadata;
  signed: boolean;
};

export default class TsRender {
  private readonly defaultCss = `
  * {
    box-sizing: border-box;
    margin: 0px;
    padding: 0px;
    font-family: 'Space Grotesk', sans-serif;
    color: #333;
  }
  
  .btn {
    border-radius: 10px;
    height: 36px;
    min-width: 112px;
    background: #EEEEEE;
    color: #0B0B0B;
    border: none;
    cursor: pointer;
  }
  
  .ts-card-button {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn > span {
    margin: 0;
    font-size: 14px;
    color: inherit;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .btn-primary {
    color: #fff;
    background: linear-gradient(234.79deg, #001AFF 37.73%, #4F95FF 118.69%);
  }
  
  /* TODO: Secondary button hover & disable states are not distinct enough */
  .btn-secondary {
    border: 2px solid #001AFF;
    background: #fff;
    color: #001AFF;
  }
  
  .btn-featured {
    color: #fff;
    border: 2px solid #FF6B00;
    background: linear-gradient(0deg, #FF6B00 0%, #FF6B00 100%);
  }
  
  .sts-viewer {
    height: 100dvh;
    overflow-y: scroll;
  }
  
  .token-viewer {
    max-width: 650px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    background: #fff;
    overflow: hidden;
  }
  
  .ts-token-container {
    border-radius: 25px;
  }
  
  .details-container {
    flex-grow: 1;
  }
  
  .image-container {
    min-height: 100px;
  }
  
  .token-viewer img {
    max-width: 100%;
  }
  
  .main-info h1 {
    font-size: 16px;
    font-weight: 700;
    line-height: 20px;
    margin: 16px 0 0;
    padding: 0;
    display: flex;
    align-items: center;
  }
  
  .main-info {
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #F7F6F0;
  }
  
  .main-info p {
    margin: 0 0 16px;
    word-wrap: break-word;
  }
  
  .actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 15px;
  }
  `;

  private readonly defaultCSSStyleSheet: CSSStyleSheet;
  private readonly tsCssStyleSheet: CSSStyleSheet | null;
  private readonly mergedCssStyleSheet: CSSStyleSheet;
  constructor(
    private readonly params: {
      metadata: TsMetadata;
      image: Buffer;
      name: string;
      description: string;
    },
  ) {
    const defaultDocument = new jsdom.JSDOM().window.document;
    const styleElement = defaultDocument.createElement("style");
    styleElement.innerHTML = this.defaultCss;
    defaultDocument.head.appendChild(styleElement);
    this.defaultCSSStyleSheet = styleElement.sheet!;
    const tsDocument = new jsdom.JSDOM().window.document;
    const tsStyleElement = tsDocument.createElement("style");
    tsStyleElement.innerHTML = this.params.metadata.cssStr ?? "";
    tsDocument.head.appendChild(tsStyleElement);
    this.tsCssStyleSheet = tsStyleElement.sheet;
    this.mergedCssStyleSheet = this.defaultCSSStyleSheet;
    if (this.tsCssStyleSheet) {
      for (const rule of this.tsCssStyleSheet.cssRules) {
        this.mergedCssStyleSheet.insertRule(
          rule.cssText,
          this.mergedCssStyleSheet.cssRules.length,
        );
      }
    }
  }

  static async from(params: MetadataOptions): Promise<TsRender> {
    const tokenViewData = await getTokenViewData({
      chain: params.chainId,
      contract: params.contract,
      tokenId: params.tokenId,
      scriptId: params.scriptId,
    });

    return new TsRender({
      metadata: tokenViewData.tsMetadata,
      image: await imageUrl2Buffer(tokenViewData.tokenMetadata!.image),
      name: tokenViewData.tokenMetadata!.name,
      description: tokenViewData.tokenMetadata!.description,
    });
  }

  async toDocument() {
    const cards = this.params.metadata.actions;
    const featuredCard = cards?.find((card) => card.buttonClass === "featured");
    const nonFeaturedCards = cards?.filter(
      (card) => card.buttonClass !== "featured",
    );

    const window = new jsdom.JSDOM().window;
    const document = window.document;
    // create main container
    const container = document.createElement("div");
    container.className = "ts-token-container token-viewer";

    // create details container
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "details-container";

    // create image container
    const imageContainer = document.createElement("div");
    imageContainer.className = "image-container";

    const img = document.createElement("img");
    img.src = await buffer2DataUri(this.params.image);
    imageContainer.appendChild(img);

    // create info container
    const infoContainer = document.createElement("div");
    infoContainer.className = "info-container";

    const mainInfo = document.createElement("div");
    mainInfo.className = "main-info";

    const h1 = document.createElement("h1");
    h1.className = "token-title";
    h1.title = this.params.name;
    h1.textContent = truncateString(this.params.name);
    const p = document.createElement("p");
    p.textContent = truncateString(this.params.description);
    mainInfo.appendChild(h1);
    mainInfo.appendChild(p);

    infoContainer.appendChild(mainInfo);

    // append image and info container to details container
    detailsContainer.appendChild(imageContainer);
    detailsContainer.appendChild(infoContainer);

    let buttonCount = 0;
    // create action button
    const actions = document.createElement("div");
    actions.className = "actions";
    if (featuredCard) {
      const featuredButton = document.createElement("button");
      featuredButton.className = "ts-card-button btn btn-featured";
      // fix old smartcat tsml issue
      const title =
        featuredCard.label === "Name Your Cat"
          ? "Cat Kombat"
          : featuredCard.label;
      featuredButton.title = title;

      featuredButton.innerHTML = `<span>${title}</span>`;
      actions.appendChild(featuredButton);
      buttonCount++;
    }

    if (nonFeaturedCards && nonFeaturedCards.length > 0) {
      const primaryButton = document.createElement("button");
      primaryButton.className = "btn ts-card-button btn-primary";
      primaryButton.title = nonFeaturedCards[0].label;
      primaryButton.innerHTML = `<span>${nonFeaturedCards[0].label}</span>`;
      actions.appendChild(primaryButton);
      buttonCount++;
    }
    if (nonFeaturedCards && nonFeaturedCards.length > 1) {
      for (
        let i = 1;
        i < nonFeaturedCards.length && buttonCount < 3;
        i++, buttonCount++
      ) {
        const secondaryButton = document.createElement("button");
        secondaryButton.className = "btn ts-card-button btn-secondary";
        secondaryButton.title = nonFeaturedCards[i].label;
        secondaryButton.innerHTML = `<span>${nonFeaturedCards[i].label}</span>`;
        actions.appendChild(secondaryButton);
      }
    }
    if (
      nonFeaturedCards &&
      nonFeaturedCards.length > buttonCount &&
      buttonCount < 4
    ) {
      const overflowButton = document.createElement("button");
      overflowButton.className = "btn more-actions-btn ts-overflow-button";
      overflowButton.innerHTML = "+ More actions";
      actions.appendChild(overflowButton);
    }

    // create bottom padding div
    const paddingDiv = document.createElement("div");
    paddingDiv.style.padding = "0px 10px 10px";

    // append all elements to main container
    container.appendChild(detailsContainer);
    container.appendChild(actions);
    container.appendChild(paddingDiv);
    document.body.appendChild(container);
    return container;
  }

  async toReactNode() {
    return this.domToReactNode(await this.toDocument());
  }

  private computedStyle(ele: Element) {
    const parent = ele.parentElement;
    const tag = ele.tagName.toLowerCase();
    const className = ele.className;
    const classList = className.trim().split(/\s+/);
    // inline style always has higher priority
    if ("style" in ele && (ele.style as CSSStyleDeclaration).length > 0) {
      const inlineStyleDeclaration: CSSStyleDeclaration =
        ele.style as CSSStyleDeclaration;
      const inlineStyle: Record<string, string | number> = {};
      for (let i = 0; i < inlineStyleDeclaration.length; i++) {
        const key = inlineStyleDeclaration[i];
        inlineStyle[key] = inlineStyleDeclaration.getPropertyValue(key);
      }
      console.log(
        `tag ${tag} class ${className} has inline style ${JSON.stringify(inlineStyle)}`,
      );
      return { style: inlineStyle, importantPolicy: new Set() };
    }
    const style: Record<string, string | number> = {};
    function applyStyle(styleDeclaration: CSSStyleDeclaration) {
      for (let i = 0; i < styleDeclaration.length; i++) {
        const key = styleDeclaration[i];
        const isImportant =
          styleDeclaration.getPropertyPriority(key) === "important";
        if (isImportant) {
          importantPolicy.add(key);
        }

        if (isImportant || !importantPolicy.has(key)) {
          style[key] = styleDeclaration.getPropertyValue(key);
        } else {
          console.log(
            `style[${key}] is important, will not set to ${styleDeclaration.getPropertyValue(key)}, still keep to ${style[key]}`,
          );
        }
      }
    }

    const resolveInheritStyle = () => {
      if (!parent || parent.tagName.toLocaleLowerCase() === "body") {
        return;
      }
      // get the value from the parent recursive
      const parentComputedStyle = this.computedStyle(parent);
      const parentStyle = parentComputedStyle.style;
      const parentImportantPolicy = parentComputedStyle.importantPolicy;
      const inheritStyle = [
        "font",
        "font-family",
        "font-size",
        "font-style",
        "font-variant",
        "font-weight",
      ];
      const applyParentStyle = (key: string) => {
        const parentStyleValue = parentStyle[key];
        if (!parentStyleValue) {
          return;
        }
        style[key] = parentStyleValue;
        if (parentImportantPolicy.has(key)) {
          importantPolicy.add(key);
        }
        console.log(
          `get inherit style ${key} from parent: ${parentStyleValue}`,
        );
      };
      // manual fix some style issues
      Object.entries(style).forEach(([key, value]) => {
        if (value === "inherit") {
          applyParentStyle(key);
        }
      });
      inheritStyle.forEach((key) => {
        applyParentStyle(key);
      });
    };

    let parentSelectorRegex = "";
    if (parent) {
      const parentTag = parent.tagName.toLowerCase();
      const parentClass = parent.className;
      const parentClassList = parentClass.trim().split(/\s+/);
      // regex like: ((div)?(\.(cls1|cls2|cls3|cls4))*\s*(>\s*)?)
      parentSelectorRegex = `((${parentTag})?(\\.(${parentClassList.join("|")}))*\\s*(>\\s*)?)`;
    }

    // support !important policy
    const importantPolicy: Set<string> = new Set();
    // defaultStyle
    [...this.mergedCssStyleSheet.cssRules]
      .filter((rule) => (rule as CSSStyleRule).selectorText === "*")
      .forEach((rule) => {
        console.log(
          `tag ${tag} class ${className} matched the default selector ${(rule as CSSStyleRule).selectorText}`,
        );
        applyStyle((rule as CSSStyleRule).style);
        resolveInheritStyle();
      });
    // tagStyle
    const tagSelectorRegex = `(?<![\\.-])\\b${tag}\\b(?![\\.-])`;
    [...this.mergedCssStyleSheet.cssRules]
      .filter((rule) => {
        const selectorText = (rule as CSSStyleRule).selectorText;
        if (!selectorText) {
          return false;
        }
        const selectorList = selectorText.split(/\s*,\s*/);
        for (const singleSelector of selectorList) {
          if (
            singleSelector.includes(".ts-token-container *") ||
            singleSelector.includes(".info-container *")
          ) {
            return true;
          }
          // some special tag selector
          if (
            tag === "h1" &&
            singleSelector.includes(".ts-token-container h1")
          ) {
            return true;
          }
          if (tag === "p" && singleSelector.includes(".ts-token-container p")) {
            return true;
          }
          // match only tag name in the end of the selector, like div, body div
          // but not for .div, body .div
          if (
            RegExp(`^${parentSelectorRegex}${tagSelectorRegex}`).test(
              singleSelector,
            )
          ) {
            return true;
          }
        }
        return false;
      })
      .forEach((rule) => {
        console.log(
          `tag ${tag} matched the selector ${(rule as CSSStyleRule).selectorText}`,
        );
        applyStyle((rule as CSSStyleRule).style);
        resolveInheritStyle();
      });
    // classStyle
    [...this.mergedCssStyleSheet.cssRules]
      .filter((rule) => {
        const selectorText = (rule as CSSStyleRule).selectorText;
        if (!selectorText) {
          return false;
        }
        const selectorList = selectorText.split(/\s*,\s*/);
        const classSelectorRegex = `(?<! )(\\.(${classList.join("|")}))+(\\s*,|$)`;
        for (const singleSelector of selectorList) {
          // regex: (?<! )(\.S+?)*(\.cls1|\.cls2|\.cls3|\.cls4)+$
          if (
            RegExp(`^${parentSelectorRegex}${classSelectorRegex}`).test(
              singleSelector,
            )
          ) {
            return true;
          }
        }
        return false;
      })
      .forEach((rule) => {
        console.log(
          `class ${className} matched the selector ${(rule as CSSStyleRule).selectorText}`,
        );
        applyStyle((rule as CSSStyleRule).style);
        resolveInheritStyle();
      });

    if (tag === "button") {
      style["align-items"] = "center";
      style["justify-content"] = "center";
    }

    return { style, importantPolicy };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private domToReactNode(node: Element): any {
    const computedStyle = this.computedStyle(node);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: any = {
      class: node.className,
      style: computedStyle.style,
    };

    // satori force flex layout for div
    if (node.tagName.toLowerCase() === "div") {
      props.style.display = "flex";
      props.style["flex-direction"] = "column";
    }

    if (node.tagName === "IMG") {
      props.src = (node as HTMLImageElement).src;
      props.alt = (node as HTMLImageElement).alt;
    }

    let children;
    if (node.children.length > 0) {
      children = Array.from(node.children)
        .map((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            return this.domToReactNode(child);
          } else if (child.nodeType === Node.TEXT_NODE) {
            return child.textContent;
          }
          return null;
        })
        .filter(Boolean);
    } else {
      children = node.textContent ? node.textContent : undefined;
    }

    return {
      type: node.tagName.toLowerCase(),
      props: {
        ...props,
        children,
      },
    };
  }

  async toSvg() {
    const options: SatoriOptions = {
      width: 400,
      fonts: [
        {
          name: "Space Grotesk",
          data: SpaceGroteskFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "Space Grotesk",
          data: SpaceGroteskFontBold,
          weight: 700,
          style: "normal",
        },
      ],
      embedFont: true,
      // debug: true,
    };
    const divDocument = await this.toDocument();
    const divNode = this.domToReactNode(divDocument);
    console.log(JSON.stringify(divNode, null, 2));
    const svg = await satori(divNode, options);
    return svg;
  }
}

function truncateString(str: string): string {
  return str.replace(/^(.{13}).+(.{4})$/, "$1...$2");
}

async function buffer2DataUri(buf: Buffer): Promise<string> {
  return `data:image/png;base64,${buf.toString("base64")}`;
}

async function imageUrl2Buffer(url: string): Promise<Buffer> {
  return axios
    .get(url, {
      responseType: "arraybuffer",
    })
    .then((res) => Buffer.from(res.data));
}

async function getTokenViewData(params: {
  chain: string;
  contract: string;
  tokenId: string;
  scriptId?: string;
}): Promise<TokenViewData> {
  return axios
    .get(
      `https://api.smarttokenlabs.com/token-view/${params.chain}/${params.contract}/${params.tokenId}`,
      {
        params: { entry: params.scriptId },
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "deflate, gzip, br",
          "x-stl-key":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0IjoibXVsdGktY2hhbm5lbC1yZW5kZXJpbmctb2ciLCJpYXQiOjE3MjcyNDA1MDd9.M05idSQCSyEktxOAH377iKe9J080U5O4eab1Yv1YOLc",
        },
      },
    )
    .then((res) => res.data);
}

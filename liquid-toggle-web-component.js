import gsap from "https://cdn.skypack.dev/gsap@3.13.0";
import Draggable from "https://cdn.skypack.dev/gsap@3.13.0/Draggable";

gsap.registerPlugin(Draggable);

class LiquidToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.config = {
      complete: 0,
      active: false,
      bounce: true,
      size: "md",
    };

    this.sizes = {
      xs: { width: 32, height:0.75* 16, blur: 1, deviation: { active: 0.3, inactive: 2 }, alpha: 6 },
      sm: { width: 44, height:0.75* 22, blur: 1.5, deviation: { active: 0.5, inactive: 2.5 }, alpha: 8 },
      md: { width: 56, height:0.75* 28, blur: 1, deviation: { active: 0.7, inactive: 3.5 }, alpha: 11 },
      lg: { width: 68, height:0.75* 34, blur: 2.5, deviation: { active: 0.9, inactive: 4.5 }, alpha: 12 },
      xl: { width: 80, height:0.75* 40, blur: 3, deviation: { active: 1.1, inactive: 5.5 }, alpha: 14 },
      "2xl": { width: 92, height:0.75* 46, blur: 4, deviation: { active: 1.7, inactive: 8 }, alpha: 14 },
      "3xl": { width: 104, height:0.75* 52, blur: 4.5, deviation: { active: 2, inactive: 9 }, alpha: 16 },
      "4xl": { width: 116, height:0.75* 58, blur: 5, deviation: { active: 2.2, inactive: 10 }, alpha: 18 },
      "5xl": { width: 128, height:0.75* 64, blur: 6, deviation: { active: 2.5, inactive: 12 }, alpha: 20 },
    };

    this._proxy = null;
    this._draggable = null;
    this._button = null;
    this._toggle = null;
  }

  static get observedAttributes() {
    return ["checked", "disabled", "bounce", "size"];
  }

  connectedCallback() {
    this._render();
    this._setup_references();
    this._setup_drag_interaction();
    this._setup_event_listeners();
    this._update_from_attributes();
    this._update();
  }

  disconnectedCallback() {
    if (this._draggable) {
      this._draggable.kill();
    }
    this._cleanup_event_listeners();
  }

  attributeChangedCallback(name, old_value, new_value) {
    if (old_value === new_value) return;

    switch (name) {
      case "checked":
        const is_checked = new_value !== null && new_value !== "false";
        this.config.complete = is_checked ? 100 : 0;
        this._update();
        break;

      case "disabled":
        if (this._button) {
          this._button.disabled = new_value !== null;
        }
        break;

      case "bounce":
        this.config.bounce = new_value !== "false" && new_value !== null;
        break;

      case "size":
        const size = new_value && this.sizes[new_value] ? new_value : "md";
        this.config.size = size;
        this._update_size();
        break;
    }
  }

  get checked() {
    return this.config.complete === 100;
  }

  set checked(value) {
    const new_checked = Boolean(value);
    const current_checked = this.checked;

    if (new_checked !== current_checked) {
      this.config.complete = new_checked ? 100 : 0;

      if (new_checked) {
        this.setAttribute("checked", "");
      } else {
        this.removeAttribute("checked");
      }

      this._update();
      this._dispatch_change_event();
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {

          display: inline-block;
          --unchecked: hsl(218, 8%, 81%);
          --checked: hsl(
            144,
            calc((8 + (var(--complete) / 100 * 92)) * 1%),
            calc((81 - (var(--complete) / 100 * 38)) * 1%)
          );
          --control: hsl(300, 100%, 100%);
          --border: 5px;
          --width: 140;
          --height: 60;
          --complete: 0;
          --transition: 0.2s;
          --ease: ease-out;
        }
        
        :host([disabled]) {
          opacity: 0.5;
          pointer-events: none;
        }
        
        :host([data-bounce="false"]) .liquid-toggle {
          --transition: 0s;
        }
        
        .liquid-toggle {
          -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale; /* For Firefox on macOS */
  text-rendering: optimizeLegibility; /* Can improve quality but might impact performance */

          height: calc(var(--height) * 1px);
          width: calc(var(--width) * 1px);
          border-radius: 100px;
          border: 0;
          padding: 0;
          cursor: pointer;
          position: relative;
          overflow: visible;
          container-type: inline-size;
          background: transparent;
          transition: outline var(--transition) var(--ease);
          outline-offset: 2px;
          font-family: inherit;
        }
        
        .liquid-toggle:focus-visible {
          outline: 4px solid color-mix(in oklch, var(--checked), transparent);
        }
        
        .liquid-toggle[data-active="true"]:focus-visible {
          outline: none;
        }
        
        .indicator {
          border-radius: 100px;
          pointer-events: none;
          height: 100%;
          width: 100%;
          background: var(--checked);
          position: absolute;
          top: 50%;
          scale: 1;
          left: 50%;
          translate: -50% -50%;
        }
        
        .knockout {
          height: calc(var(--height) * 1px);
          width: calc(var(--width) * 1px);
          border-radius: 100px;
          filter: url(#remove-black);
          position: absolute;
          inset: 0;
          will-change: filter, scale;
          transform: translate3d(0, 0, 0);
        }
        
        .indicator--masked {
          background: var(--checked);
          z-index: 12;
          height: 100%;
          width: 100%;
          translate: -50% -50%;
          container-type: inline-size;
        }
        
        .indicator--masked .mask {
          position: absolute;
          height: calc(100% - (2 * var(--border)));
          width: calc(60% - (2 * var(--border)));
          top: 50%;
          background: #000;
          left: var(--border);
          border-radius: 100px;
          translate: calc((var(--complete) / 100) * (100cqi - 60cqi - (0 * var(--border)))) -50%;
          transition-property: height, width, margin, scale;
          transition-duration: var(--transition);
          transition-timing-function: var(--ease);
          will-change: height, width, margin;
        }
        
        .liquid-toggle[data-active="true"] .indicator--masked .mask {
          height: calc((100% - (2 * var(--border))) * 1.65);
          width: calc((60% - (2 * var(--border))) * 1.65);
          margin-left: calc((60% - (2 * var(--border))) * -0.325);
        }
        
        .wrapper {
          position: absolute;
          inset: 0;
          border-radius: 100px;
          clip-path: inset(0 0 0 0 round 100px);
          filter: blur(var(--blur-size));
          transition: filter var(--transition) var(--ease);
        }
        
        .liquid-toggle[data-active="true"] .wrapper {
          filter: blur(0px);
        }
        
        .liquids {
          position: absolute;
          inset: 0;
          transform: translate3d(0, 0, 0);
          border-radius: 100px;
          overflow: hidden;
          filter: url(#goo);
        }
        
        .liquid__shadow {
          position: absolute;
          inset: 0;
          box-shadow:
            inset 0px 0px 3px 4px var(--checked),
            inset calc(((var(--complete) / 100) * 8px) + -4px) 0px 3px 4px var(--checked);
          border-radius: 100px;
        }
        
        .liquid__track {
          content: "";
          height: calc((var(--height) * 1px) - (0 * var(--border)));
          width: calc((var(--width) * 1px) - (0 * var(--border)));
          background: var(--checked);
          border-radius: 100px;
          position: absolute;
          top: 50%;
          left: 0;
          transition-property: height, width, filter, left;
          transition-duration: var(--transition);
          transition-timing-function: var(--ease);
          translate: calc((var(--complete) / 100) * (100cqi - 100% - (6 * var(--border)))) -50%;
        }
        
        .liquid-toggle[data-active="true"] .liquid__track {
          left: calc(var(--border) * 3);
          height: calc((var(--height) * 1px) - (6 * var(--border)));
        }
        
        .liquid-toggle[aria-pressed="true"]:not([data-active="true"]) .liquid__track {
          left: calc(var(--border) * 6);
        }
        
        .indicator__liquid {
          position: absolute;
          height: calc(100% - (2 * var(--border)));
          width: calc(60% - (2 * var(--border)));
          container-type: inline-size;
          top: 50%;
          background: transparent;
          left: var(--border);
          border-radius: 100px;
          translate: calc((var(--complete) / 100) * (100cqi - 100% - (2 * var(--border)))) -50%;
          transition-property: scale;
          transition-duration: var(--transition);
          transition-timing-function: var(--ease);
        }
        
        .liquid-toggle[data-active="true"] .indicator__liquid {
          scale: 1.65;
        }
        
        .indicator__liquid .shadow {
          opacity: 0;
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 100px;
          box-shadow:
            1px -1px 2px hsl(0 0% 100% / 0.5) inset,
            0px -1px 2px hsl(0 0% 100% / 0.5) inset,
            -1px -1px 2px hsl(0 0% 100% / 0.5) inset,
            1px 1px 2px hsl(0 0% 30% / 0.5) inset,
            -8px 4px 10px -6px hsl(0 0% 30% / 0.25) inset,
            -1px 1px 6px hsl(0 0% 30% / 0.25) inset,
            -1px -1px 8px hsl(0 0% 60% / 0.15),
            1px 1px 2px hsl(0 0% 30% / 0.15),
            2px 2px 6px hsl(0 0% 30% / 0.15),
            -2px -1px 2px hsl(0 0% 100% / 0.25) inset,
            3px 6px 16px -6px hsl(0 0% 30% / 0.5);
          z-index: 20;
          transition: opacity var(--transition) var(--ease);
        }
        
        .liquid-toggle[data-active="true"] .indicator__liquid .shadow {
          opacity: 1;
        }
        
        .indicator__liquid .cover {
          content: "";
          position: absolute;
          inset: 0;
          background: white;
          border-radius: 100px;
          transition: opacity var(--transition) var(--ease);
        }
        
        .liquid-toggle[data-active="true"] .indicator__liquid .cover {
          opacity: 0;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      </style>
      
      <button 
        class="liquid-toggle" 
        aria-label="toggle" 
        aria-pressed="false"
        data-active="false"
      >
        <div class="knockout">
          <div class="indicator indicator--masked">
            <div class="mask"></div>
          </div>
        </div>
        
        <div class="indicator__liquid">
          <div class="shadow"></div>
          <div class="wrapper">
            <div class="liquids">
              <div class="liquid__shadow"></div>
              <div class="liquid__track"></div>
            </div>
          </div>
          <div class="cover"></div>
        </div>
      </button>
      
      <svg class="sr-only" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo">
            <feGaussianBlur
              result="gaussian-blur"
              in="SourceGraphic"
              stdDeviation="3.5"
            ></feGaussianBlur>
            <feColorMatrix
              result="color-matrix"
              in="gaussian-blur"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 11 -10
              "
              type="matrix"
            ></feColorMatrix>
            <feComposite
              result="composite"
              in="color-matrix"
              operator="atop"
            ></feComposite>
          </filter>
          
          <filter id="remove-black" color-interpolation-filters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      -255 -255 -255 0 1"
              result="black-pixels"
            />
            <feMorphology 
              in="black-pixels" 
              operator="dilate" 
              radius="0.5" 
              result="smoothed" 
            />
            <feComposite 
              in="SourceGraphic" 
              in2="smoothed" 
              operator="out" 
            />
          </filter>
        </defs>
      </svg>
    `;
  }

  _setup_references() {
    this._toggle = this.shadowRoot.querySelector(".liquid-toggle");
    this._button = this._toggle;
    this._goo_blur = this.shadowRoot.querySelector("#goo feGaussianBlur");
    this._goo_matrix = this.shadowRoot.querySelector("#goo feColorMatrix");
  }

  _update() {
    const is_active = this._toggle?.dataset.active === "true";
    const size_config = this.sizes[this.config.size];
    const deviation = is_active ? size_config.deviation.active : size_config.deviation.inactive;
    const alpha = size_config.alpha;

    if (this._goo_blur) {
      gsap.set(this._goo_blur, {
        attr: { stdDeviation: deviation },
      });
    }

    if (this._goo_matrix) {
      gsap.set(this._goo_matrix, {
        attr: {
          values: `
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 ${alpha} -10
          `,
        },
      });
    }

    this.style.setProperty("--complete", this.config.complete);
    if (this._toggle) {
      this._toggle.style.setProperty("--complete", this.config.complete);
    }
    this.setAttribute("data-bounce", this.config.bounce);

    if (this._toggle) {
      this._toggle.setAttribute("aria-pressed", this.checked);
    }
  }

  async _toggle_state() {
    if (this._toggle.disabled) return;

    this._toggle.dataset.active = "true";

    if (!this.config.bounce) {
      await Promise.allSettled(this._toggle.getAnimations({ subtree: true }).map((a) => a.finished));
    }

    const pressed = this._toggle.matches("[aria-pressed=true]");

    const target_complete = pressed ? 0 : 100;

    gsap
      .timeline({
        onComplete: () => {
          gsap.delayedCall(0.05, () => {
            this._toggle.dataset.active = "false";
            this._toggle.setAttribute("aria-pressed", !pressed);
            this.checked = !pressed;
          });
        },
      })
      .to(this._toggle, {
        "--complete": target_complete,
        duration: 0.15,
        delay: this.config.bounce ? 0.2 : 0,
      })
      .to(
        this,
        {
          "--complete": target_complete,
          duration: 0.15,
          delay: this.config.bounce ? 0.2 : 0,
        },
        "<",
      );
  }

  _setup_drag_interaction() {
    const component = this;
    const toggle = this._toggle;
    this._proxy = document.createElement("div");

    this._draggable = Draggable.create(this._proxy, {
      allowContextMenu: true,
      handle: toggle,

      onDragStart: function () {
        const toggle_bounds = toggle.getBoundingClientRect();
        const pressed = toggle.matches("[aria-pressed=true]");
        const bounds = pressed
          ? toggle_bounds.left - this.pointerX
          : toggle_bounds.left + toggle_bounds.width - this.pointerX;

        this.drag_bounds = bounds;
        toggle.dataset.active = "true";
        component._update();
      },

      onDrag: function () {
        const pressed = toggle.matches("[aria-pressed=true]");
        const dragged = this.x - this.startX;

        const complete = gsap.utils.clamp(
          0,
          100,
          pressed
            ? gsap.utils.mapRange(this.drag_bounds, 0, 0, 100, dragged)
            : gsap.utils.mapRange(0, this.drag_bounds, 0, 100, dragged),
        );

        this.complete = complete;
        gsap.set(toggle, { "--complete": complete });
        gsap.set(component, { "--complete": complete });
      },

      onDragEnd: function () {
        const target_complete = this.complete >= 50 ? 100 : 0;

        gsap
          .timeline({
            onComplete: () => {
              gsap.delayedCall(0.05, () => {
                toggle.dataset.active = "false";
                toggle.setAttribute("aria-pressed", this.complete >= 50);
                component.checked = this.complete >= 50;
              });
            },
          })
          .fromTo(toggle, { "--complete": this.complete }, { "--complete": target_complete, duration: 0.15 })
          .fromTo(
            component,
            { "--complete": this.complete },
            { "--complete": target_complete, duration: 0.15 },
            "<",
          );
      },

      onPress: function () {
        this.__press_time = Date.now();

        if ("ontouchstart" in window && navigator.maxTouchPoints > 0) {
          toggle.dataset.active = "true";
          component._update();
        }
      },

      onRelease: function () {
        this.__release_time = Date.now();

        if (
          "ontouchstart" in window &&
          navigator.maxTouchPoints > 0 &&
          ((this.startX !== undefined && this.endX !== undefined && Math.abs(this.endX - this.startX) < 4) ||
            this.endX === undefined)
        ) {
          toggle.dataset.active = "false";
          component._update();
        }

        if (this.__release_time - this.__press_time <= 150) {
          component._toggle_state();
        }
      },
    })[0];
  }

  _setup_event_listeners() {
    this._handle_key_down = (e) => {
      if (e.key === "Enter") {
        this._toggle_state();
      }
      if (e.key === " ") {
        e.preventDefault();
      }
    };

    this._handle_key_up = (e) => {
      if (e.key === " ") {
        this._toggle_state();
      }
    };

    this._toggle.addEventListener("keydown", this._handle_key_down);
    this._toggle.addEventListener("keyup", this._handle_key_up);
  }

  _cleanup_event_listeners() {
    if (this._toggle) {
      this._toggle.removeEventListener("keydown", this._handle_key_down);
      this._toggle.removeEventListener("keyup", this._handle_key_up);
    }
  }

  _update_from_attributes() {
    if (this.hasAttribute("checked")) {
      this.config.complete = this.getAttribute("checked") !== "false" ? 100 : 0;
    }

    if (this.hasAttribute("disabled")) {
      this._toggle.disabled = true;
    }

    if (this.hasAttribute("bounce")) {
      this.config.bounce = this.getAttribute("bounce") !== "false";
    }

    if (this.hasAttribute("size")) {
      const size = this.getAttribute("size");
      this.config.size = size && this.sizes[size] ? size : "md";
    }

    this._update_size();
    this._update();
  }

  _update_size() {
  const { width, height } = this.sizes[this.config.size];

  // 5xl reference height = 48px (0.75 * 64)
  const base_height = 48;
  this._scale = height / base_height; // save for _update()

  // scale key dimensional vars
  const border = Math.max(1, 5 * this._scale); // was fixed 5px
  const blur_px = 6 * this._scale;             // was per-size constants

  this.style.setProperty("--width", width);
  this.style.setProperty("--height", height);
  this.style.setProperty("--border", `${border}px`);
  this.style.setProperty("--blur-size", `${blur_px}px`);
}

/*
  _update_size() {
    const { width, height, blur } = this.sizes[this.config.size];
    this.style.setProperty("--width", width);
    this.style.setProperty("--height", height);
    this.style.setProperty("--blur-size", `${blur}px`);
  }
  * **/

  _dispatch_change_event() {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("liquid-toggle", LiquidToggle);

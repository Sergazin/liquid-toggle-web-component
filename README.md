# Liquid Toggle Web Component

A beautiful, interactive toggle switch web component with fluid liquid animations. Built with vanilla JavaScript and GSAP for smooth, engaging user experiences.

## Demo

🚀 **[View Live Demo](./demo.html)** - Open `demo.html` in your browser to see all features in action

## Features

- ✨ Smooth liquid animations with SVG filters
- 📱 Touch and drag interactions
- ⌨️ Full keyboard accessibility (Space/Enter keys)
- 🎨 Customizable sizes (xs to 5xl)
- 🎯 Custom event handling
- ♿ ARIA compliant
- 🎪 Bounce effects
- 🔧 Programmatic control

## Installation

Simply include the component file in your project:

```html
<script type="module" src="./liquid-toggle-web-component.js"></script>
```

## Usage

### Basic Toggle

```html
<liquid-toggle></liquid-toggle>
```

### Pre-checked Toggle

```html
<liquid-toggle checked></liquid-toggle>
```

### Different Sizes

```html
<liquid-toggle size="xs"></liquid-toggle>   <!-- 32x16px -->
<liquid-toggle size="sm"></liquid-toggle>   <!-- 44x22px -->
<liquid-toggle size="md"></liquid-toggle>   <!-- 56x28px (default) -->
<liquid-toggle size="lg"></liquid-toggle>   <!-- 68x34px -->
<liquid-toggle size="xl"></liquid-toggle>   <!-- 80x40px -->
<liquid-toggle size="2xl"></liquid-toggle>  <!-- 92x46px -->
<liquid-toggle size="3xl"></liquid-toggle>  <!-- 104x52px -->
<liquid-toggle size="4xl"></liquid-toggle>  <!-- 116x58px -->
<liquid-toggle size="5xl"></liquid-toggle>  <!-- 128x64px -->
```

### Disabled State

```html
<liquid-toggle disabled checked></liquid-toggle>
```

### Without Bounce Animation

```html
<liquid-toggle bounce="false"></liquid-toggle>
```

## JavaScript API

### Properties

```javascript
const toggle = document.querySelector('liquid-toggle');

// Get/set checked state
console.log(toggle.checked); // true/false
toggle.checked = true;

// Check if disabled
console.log(toggle.hasAttribute('disabled'));
```

### Event Handling

```javascript
const toggle = document.querySelector('liquid-toggle');

toggle.addEventListener('change', (event) => {
    console.log('Toggle changed:', event.detail.checked);
    
    if (event.detail.checked) {
        console.log('Toggle is now ON');
    } else {
        console.log('Toggle is now OFF');
    }
});
```

### Programmatic Control

```javascript
const toggle = document.querySelector('liquid-toggle');

// Toggle the state
toggle.checked = !toggle.checked;

// Set specific state
toggle.checked = true;   // Turn on
toggle.checked = false;  // Turn off

// Enable/disable
toggle.setAttribute('disabled', '');  // Disable
toggle.removeAttribute('disabled');   // Enable
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `checked` | boolean | `false` | Initial checked state |
| `disabled` | boolean | `false` | Disables user interaction |
| `size` | string | `"md"` | Size variant (xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl) |
| `bounce` | boolean | `true` | Enable/disable bounce animation |

## CSS Custom Properties

You can customize the appearance using CSS custom properties:

```css
liquid-toggle {
    --unchecked: hsl(218, 8%, 81%);
    --checked: hsl(144, 50%, 50%);
    --control: hsl(300, 100%, 100%);
    --transition: 0.2s;
    --ease: ease-out;
}
```

## Advanced Examples

### Form Integration

```html
<form>
    <label>
        <liquid-toggle name="notifications" checked></liquid-toggle>
        Enable notifications
    </label>
    
    <label>
        <liquid-toggle name="darkMode" size="lg"></liquid-toggle>
        Dark mode
    </label>
</form>

<script>
document.querySelectorAll('liquid-toggle').forEach(toggle => {
    toggle.addEventListener('change', (e) => {
        const formData = new FormData();
        formData.append(toggle.getAttribute('name'), e.detail.checked);
        console.log('Form value changed:', Object.fromEntries(formData));
    });
});
</script>
```

### Dynamic Size Control

```html
<liquid-toggle id="myToggle" size="md"></liquid-toggle>
<select id="sizeSelector">
    <option value="xs">Extra Small</option>
    <option value="sm">Small</option>
    <option value="md" selected>Medium</option>
    <option value="lg">Large</option>
    <option value="xl">Extra Large</option>
</select>

<script>
const toggle = document.getElementById('myToggle');
const selector = document.getElementById('sizeSelector');

selector.addEventListener('change', (e) => {
    toggle.setAttribute('size', e.target.value);
});
</script>
```

### State Management Integration

```javascript
// React-like state management
class ToggleState {
    constructor() {
        this.state = { notifications: false, darkMode: true };
        this.listeners = [];
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
    }
    
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

const state = new ToggleState();

// Setup toggles
document.querySelectorAll('liquid-toggle').forEach(toggle => {
    const name = toggle.getAttribute('data-name');
    
    // Initialize from state
    toggle.checked = state.state[name] || false;
    
    // Listen for changes
    toggle.addEventListener('change', (e) => {
        state.setState({ [name]: e.detail.checked });
    });
});

// Listen for state changes
state.subscribe((newState) => {
    console.log('State updated:', newState);
    // Sync with other UI elements, localStorage, etc.
});
```

## Browser Support

- Modern browsers supporting Web Components (Custom Elements v1)
- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## Dependencies

- [GSAP](https://greensock.com/gsap/) - For smooth animations
- [GSAP Draggable](https://greensock.com/draggable/) - For drag interactions

Both are loaded via CDN in the component.

## Technical Details

The component uses:
- **Shadow DOM** for style encapsulation
- **SVG filters** for liquid effects (`feGaussianBlur`, `feColorMatrix`)
- **GSAP animations** for smooth transitions
- **Draggable** for touch/mouse interactions
- **ARIA attributes** for accessibility

## Contributing

1. Fork the repository
2. Create your feature branch
3. Test your changes with the demo
4. Submit a pull request

## License

MIT License - feel free to use in your projects!

---

⚡ **Quick Start**: Just download the files and open `demo.html` in your browser to see it in action!
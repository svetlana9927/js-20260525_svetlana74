export default class Tooltip {
    static instance: Tooltip;
  
    element: HTMLElement | null = null;
  
    constructor() {
      if (Tooltip.instance) {
        return Tooltip.instance;
      }
  
      Tooltip.instance = this;
    }
  
    initialize(): void {
      document.addEventListener('pointerover', this.onPointerOver);
      document.addEventListener('pointerout', this.onPointerOut);
    }
  
    render(html: string): void {
      this.element = document.createElement('div');
      this.element.className = 'tooltip';
      this.element.innerHTML = html;
  
      document.body.append(this.element);
    }
  
    remove(): void {
      this.element?.remove();
      this.element = null;
    }
  
    onPointerOver = (event: Event): void => {
      const target = event.target as HTMLElement;
      const tooltipElement = target.closest('[data-tooltip]') as HTMLElement;
  
      if (!tooltipElement) {
        return;
      }
  
      const tooltipText = tooltipElement.dataset.tooltip;
  
      if (!tooltipText) {
        return;
      }
  
      this.render(tooltipText);
    };
  
    onPointerOut = (): void => {
      this.remove();
    };
  
    destroy(): void {
      document.removeEventListener('pointerover', this.onPointerOver);
      document.removeEventListener('pointerout', this.onPointerOut);
  
      this.remove();
    }
  }

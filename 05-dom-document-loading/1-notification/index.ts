import { createElement } from "../../shared/utils/create-element";

interface Options {
  duration?: number;
  type?: 'success' | 'error';
}

export default class NotificationMessage {
  static activeNotification: NotificationMessage | null = null;

  element: HTMLElement;
  duration: number;
  type: 'success' | 'error';
  message: string;
  timerId?: ReturnType<typeof setTimeout>;

  constructor(
    message: string = '',
    {
      duration = 2000,
      type = 'success',
    }: Options = {}
  ) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.element = createElement(this.getTemplate());
  }

  getTemplate(): string {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
   ` ;
  }

  show(target: HTMLElement = document.body): void {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    NotificationMessage.activeNotification = this;

    target.append(this.element);

    this.timerId = setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove(): void {
    this.element.remove();
  }

  destroy(): void {
    this.remove();

    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    NotificationMessage.activeNotification = null;
  }
}
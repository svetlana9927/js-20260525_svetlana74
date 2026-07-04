type SortOrder = 'asc' | 'desc';
type SortableTableData = Record<string, string | number>;

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: 'string' | 'number';
  template?: (value: string | number) => string;
}

export default class SortableTable {
  element: HTMLElement;
  subElements: Record<string, HTMLElement> = {};

  headersConfig: SortableTableHeader[];
  data: SortableTableData[];

  constructor(headersConfig: SortableTableHeader[] = [], data: SortableTableData[] = []) {
    this.headersConfig = headersConfig;
    this.data = [...data];

    this.element = this.createElement(this.getTemplate());
    this.subElements = this.getSubElements();
  }

  createElement(template: string): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    return wrapper.firstElementChild as HTMLElement;
  }

  getTemplate(): string {
    return `
      <div class="sortable-table">
        ${this.getHeader()}
        ${this.getBody(this.data)}
      </div>
    `;
  }

  getHeader(): string {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headersConfig.map(item => this.getHeaderCell(item)).join('')}
      </div>
    `;
  }

  getHeaderCell(item: SortableTableHeader): string {
    return `
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
        <span>${item.title}</span>
      </div>
    `;
  }

  getBody(data: SortableTableData[]): string {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getRows(data)}
      </div>
    `;
  }

  getRows(data: SortableTableData[]): string {
    return data
      .map(item => {
        return `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${this.getRowCells(item)}
          </a>
        `;
      })
      .join('');
  }

  getRowCells(item: SortableTableData): string {
    return this.headersConfig
      .map(({ id, template }) => {
        const value = item[id];

        if (template) {
          return template(value);
        }

        return `<div class="sortable-table__cell">${value}</div>`;
      })
      .join('');
  }

  getSubElements(): Record<string, HTMLElement> {
    const result: Record<string, HTMLElement> = {};
    const elements = this.element.querySelectorAll('[data-element]');

    elements.forEach(element => {
      const name = element.getAttribute('data-element');

      if (name) {
        result[name] = element as HTMLElement;
      }
    });

    return result;
  }

  sort(field: string, order: SortOrder): void {
    const column = this.headersConfig.find(item => item.id === field);

    if (!column || !column.sortable) {
      return;
    }

    const sortedData = [...this.data].sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];

      if (column.sortType === 'number') {
        return order === 'asc'
          ? Number(valueA) - Number(valueB)
          : Number(valueB) - Number(valueA);
      }

      return order === 'asc'
        ? String(valueA).localeCompare(String(valueB), ['ru', 'en'], { caseFirst: 'upper' })
        : String(valueB).localeCompare(String(valueA), ['ru', 'en'], { caseFirst: 'upper' });
    });

    this.data = sortedData;
    this.subElements.body.innerHTML = this.getRows(sortedData);
    this.updateHeader(field, order);
  }

  updateHeader(field: string, order: SortOrder): void {
    const headerCells = this.subElements.header.querySelectorAll('.sortable-table__cell');

    headerCells.forEach(cell => {
      if (cell.getAttribute('data-id') === field) {
        cell.setAttribute('data-order', order);
      } else {
        cell.removeAttribute('data-order');
      }
    });
  }

  remove(): void {
    this.element.remove();
  }

  destroy(): void {
    this.remove();
    this.subElements = {};
    this.data = [];
  }
}
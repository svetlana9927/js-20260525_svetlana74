type SortOrder = 'asc' | 'desc';
type SortableTableData = Record<string, string | number>;

type SortableTableSort = {
  id: string;
  order: SortOrder;
};

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: 'string' | 'number' | 'custom';
  template?: (value: string | number) => string;
  customSorting?: (a: SortableTableData, b: SortableTableData) => number;
}

interface Options {
  data?: SortableTableData[];
  sorted?: SortableTableSort;
  isSortLocally?: boolean;
}

export default class SortableTable {
  element: HTMLElement;
  subElements: Record<string, HTMLElement> = {};

  headersConfig: SortableTableHeader[];
  data: SortableTableData[];
  sorted: SortableTableSort;
  isSortLocally: boolean;

  constructor(
    headersConfig: SortableTableHeader[] = [],
    {
      data = [],
      sorted = { id: headersConfig.find(item => item.sortable)?.id || '', order: 'asc' },
      isSortLocally = true,
    }: Options = {},
  ) {
    this.headersConfig = headersConfig;
    this.data = [...data];
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.sortOnClient(this.sorted.id, this.sorted.order);

    this.element = this.createElement(this.getTemplate());
    this.subElements = this.getSubElements();

    this.initEventListeners();
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
        ${this.getBody()}
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
    const isSorted = this.sorted.id === item.id;

    return `
      <div
        class="sortable-table__cell"
        data-id="${item.id}"
        data-sortable="${item.sortable}"
        ${isSorted ? `data-order="${this.sorted.order}"` : ''}
      >
        <span>${item.title}</span>
        ${
          item.sortable
            ? `<span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
              </span>`
            : ''
        }
      </div>
    `;
  }

  getBody(): string {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getRows(this.data)}
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

  initEventListeners(): void {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
  }

  onHeaderClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    const cell = target.closest('.sortable-table__cell') as HTMLElement;

    if (!cell || cell.dataset.sortable !== 'true') {
      return;
    }

    const field = cell.dataset.id;

    if (!field) {
      return;
    }

    const currentOrder = cell.dataset.order as SortOrder;
    const nextOrder: SortOrder = currentOrder === 'desc' ? 'asc' : 'desc';

    this.sort(field, nextOrder);
  };

  sort(field: string, order: SortOrder): void {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }

    this.sorted = { id: field, order };

    this.subElements.body.innerHTML = this.getRows(this.data);
    this.updateHeader(field, order);
  }

  sortOnClient(field: string, order: SortOrder): void {
    const column = this.headersConfig.find(item => item.id === field);

    if (!column || !column.sortable) {
      return;
    }

    const direction = order === 'asc' ? 1 : -1;

    this.data = [...this.data].sort((a, b) => {
      if (column.sortType === 'custom' && column.customSorting) {
        return direction * column.customSorting(a, b);
      }

      const valueA = a[field];
      const valueB = b[field];

      if (column.sortType === 'number') {
        return direction * (Number(valueA) - Number(valueB));
      }

      return direction * String(valueA).localeCompare(
        String(valueB),
        ['ru', 'en'],
        { caseFirst: 'upper' },
      );
    });
  }

  sortOnServer(_field: string, _order: SortOrder): void {
    // В этом задании серверной сортировки ещё нет.
  }

  updateHeader(field: string, order: SortOrder): void {
    const cells = this.subElements.header.querySelectorAll('.sortable-table__cell');

    cells.forEach(cell => {
      if ((cell as HTMLElement).dataset.id === field) {
        (cell as HTMLElement).dataset.order = order;
      } else {
        cell.removeAttribute('data-order');
      }
    });
  }

  remove(): void {
    this.element.remove();
  }

  destroy(): void {
    this.subElements.header?.removeEventListener('pointerdown', this.onHeaderClick);

    this.remove();
    this.subElements = {};
    this.data = [];
  }
}
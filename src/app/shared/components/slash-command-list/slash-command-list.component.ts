import { Component, signal, computed, effect } from '@angular/core';

export interface SlashCommandItem {
  title: string;
  description?: string;
  command: (props: any) => void;
}

@Component({
  selector: 'app-slash-command-list',
  standalone: true,
  template: `
    <div class="slash-command-list">
      @for (item of filteredItems(); track item.title; let i = $index) {
        <button
          class="slash-command-item"
          [class.is-selected]="selectedIndex() === i"
          (click)="selectItem(i)"
        >
          <div class="slash-command-title">{{ item.title }}</div>
          @if (item.description) {
            <div class="slash-command-description">{{ item.description }}</div>
          }
        </button>
      }
      @if (filteredItems().length === 0) {
        <div class="slash-command-empty">No results</div>
      }
    </div>
  `,
  styles: [`
    .slash-command-list {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 0.5rem;
      max-height: 400px;
      overflow-y: auto;
      min-width: 280px;
    }

    .slash-command-item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.5rem 0.75rem;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s ease;

      &:hover,
      &.is-selected {
        background: #f0f0f0;
      }

      &.is-selected {
        background: #e3f2fd;
      }
    }

    .slash-command-title {
      font-weight: 500;
      font-size: 0.875rem;
      color: #333;
    }

    .slash-command-description {
      font-size: 0.75rem;
      color: #666;
      margin-top: 0.125rem;
    }

    .slash-command-empty {
      padding: 1rem;
      text-align: center;
      color: #999;
      font-size: 0.875rem;
    }
  `],
})
export class SlashCommandListComponent {
  items = signal<SlashCommandItem[]>([]);
  selectedIndex = signal(0);
  command = signal<((props: any) => void) | null>(null);
  editor: any;
  range: any;

  filteredItems = computed(() => this.items());

  selectItem(index: number): void {
    const item = this.filteredItems()[index];
    if (item && item.command && this.editor && this.range) {
      item.command({ editor: this.editor, range: this.range });
    }
  }

  onKeyDown(event: KeyboardEvent): boolean {
    if (event.key === 'ArrowUp') {
      this.upHandler();
      return true;
    }

    if (event.key === 'ArrowDown') {
      this.downHandler();
      return true;
    }

    if (event.key === 'Enter') {
      this.enterHandler();
      return true;
    }

    return false;
  }

  upHandler(): void {
    const index = this.selectedIndex();
    this.selectedIndex.set((index + this.filteredItems().length - 1) % this.filteredItems().length);
  }

  downHandler(): void {
    const index = this.selectedIndex();
    this.selectedIndex.set((index + 1) % this.filteredItems().length);
  }

  enterHandler(): void {
    this.selectItem(this.selectedIndex());
  }
}

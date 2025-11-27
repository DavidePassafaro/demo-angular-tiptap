import { Component, signal, computed } from '@angular/core';

export interface MentionItem {
  id: string;
  label: string;
  avatar?: string;
}

@Component({
  selector: 'app-mention-list',
  standalone: true,
  template: `
    <div class="mention-list">
      @for (item of filteredItems(); track item.id; let i = $index) {
        <button
          class="mention-item"
          [class.is-selected]="selectedIndex() === i"
          (click)="selectItem(i)"
        >
          @if (item.avatar) {
            <img [src]="item.avatar" [alt]="item.label" class="mention-avatar" />
          } @else {
            <div class="mention-avatar-placeholder">
              {{ item.label.charAt(0).toUpperCase() }}
            </div>
          }
          <span class="mention-label">{{ item.label }}</span>
        </button>
      }
      @if (filteredItems().length === 0) {
        <div class="mention-empty">No users found</div>
      }
    </div>
  `,
  styles: [`
    .mention-list {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 0.5rem;
      max-height: 300px;
      overflow-y: auto;
      min-width: 200px;
    }

    .mention-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      text-align: left;
      padding: 0.5rem;
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

    .mention-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
    }

    .mention-avatar-placeholder {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .mention-label {
      font-size: 0.875rem;
      color: #333;
    }

    .mention-empty {
      padding: 1rem;
      text-align: center;
      color: #999;
      font-size: 0.875rem;
    }
  `],
})
export class MentionListComponent {
  items = signal<MentionItem[]>([]);
  selectedIndex = signal(0);
  command = signal<((props: any) => void) | null>(null);

  filteredItems = computed(() => this.items());

  selectItem(index: number): void {
    const item = this.filteredItems()[index];
    if (item && this.command()) {
      this.command()!(item);
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

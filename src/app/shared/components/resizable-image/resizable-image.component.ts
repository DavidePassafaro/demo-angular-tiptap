import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  signal,
} from '@angular/core';
import { AngularNodeViewComponent } from '../../utils/angular-node-view-renderer';

@Component({
  selector: 'app-resizable-image',
  standalone: true,
  templateUrl: './resizable-image.component.html',
  styleUrl: './resizable-image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResizableImageComponent implements AngularNodeViewComponent, OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  node: any;
  replaceWithNode!: (nodeType: string, attrs: Record<string, any>) => void;

  protected isSelected = signal(false);
  protected currentWidth = signal<number | null>(null);
  protected isDragging = signal(false);

  private readonly MIN_WIDTH = 100;
  private readonly MAX_WIDTH = 1000;
  private startX = 0;
  private startWidth = 0;

  ngOnInit(): void {
    this.currentWidth.set(this.node.attrs.width || null);
  }

  protected onImageClick(): void {
    this.isSelected.set(true);
  }

  protected onDocumentClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (!target.closest('.resizable-image-wrapper')) {
      this.isSelected.set(false);
      this.cdr.markForCheck();
    }
  };

  protected onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.isDragging.set(true);
    this.startX = event.clientX;
    this.startWidth = this.currentWidth() || (event.target as HTMLElement).closest('img')?.clientWidth || 0;

    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  private onResizeMove = (event: MouseEvent): void => {
    if (!this.isDragging()) return;

    const diff = event.clientX - this.startX;
    let newWidth = this.startWidth + diff;

    // Apply constraints
    newWidth = Math.max(this.MIN_WIDTH, Math.min(this.MAX_WIDTH, newWidth));

    this.currentWidth.set(newWidth);
    this.updateNodeWidth(newWidth);
    this.cdr.markForCheck();
  };

  private onResizeEnd = (): void => {
    this.isDragging.set(false);
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
  };

  private updateNodeWidth(width: number): void {
    this.replaceWithNode(this.node.type.name, {
      ...this.node.attrs,
      width,
    });
  }

  protected removeImage(): void {
    this.replaceWithNode('paragraph', {});
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick);
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
  }
}

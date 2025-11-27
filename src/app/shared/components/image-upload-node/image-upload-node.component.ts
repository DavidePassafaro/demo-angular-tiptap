import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ImageUploadComponent, ImageUploadResult } from '../image-upload/image-upload.component';
import { AngularNodeViewComponent } from '../../utils/angular-node-view-renderer';

@Component({
  selector: 'app-image-upload-node',
  standalone: true,
  imports: [ImageUploadComponent],
  templateUrl: './image-upload-node.component.html',
  styleUrl: './image-upload-node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadNodeComponent implements AngularNodeViewComponent {
  node: any;
  replaceWithNode!: (nodeType: string, attrs: Record<string, any>) => void;

  protected onImageSelected(result: ImageUploadResult): void {
    // Replace the imageUpload node with a resizable image node
    this.replaceWithNode('resizableImage', {
      src: result.dataUrl,
      alt: result.file.name,
      width: 100, // Start at minWidth
    });
  }
}

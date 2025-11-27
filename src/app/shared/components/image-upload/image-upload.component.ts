import {
  Component,
  output,
  signal,
  ChangeDetectionStrategy,
  viewChild,
  ElementRef,
} from '@angular/core';

export interface ImageUploadResult {
  file: File;
  dataUrl: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadComponent {
  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  imageSelected = output<ImageUploadResult>();

  protected selectedFileName = signal<string | null>(null);
  protected previewUrl = signal<string | null>(null);

  protected onButtonClick(): void {
    this.fileInput().nativeElement.click();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // Verifica che sia un'immagine
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    this.selectedFileName.set(file.name);

    // Leggi il file e crea la data URL
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const dataUrl = e.target?.result as string;
      this.previewUrl.set(dataUrl);

      this.imageSelected.emit({
        file,
        dataUrl,
      });
    };

    reader.readAsDataURL(file);
  }

  protected clearSelection(): void {
    this.selectedFileName.set(null);
    this.previewUrl.set(null);
    this.fileInput().nativeElement.value = '';
  }
}

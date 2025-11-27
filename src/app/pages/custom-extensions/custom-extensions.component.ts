import { Component, signal } from '@angular/core';
import { EditorComponent } from './editor/editor.component';
import { CommentEditorComponent } from './comment-editor/comment-editor.component';
import { AnyExtension } from '@tiptap/core';
import { Spaghetto } from '../../shared/extensions/spaghetto';
import { EmojiParser } from '../../shared/extensions/emoji-parser';
import { Rainbow } from '../../shared/extensions/rainbow';

interface Comment {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  isEditing?: boolean;
}

@Component({
  selector: 'app-custom-extensions',
  standalone: true,
  imports: [EditorComponent, CommentEditorComponent],
  templateUrl: './custom-extensions.component.html',
  styleUrl: './custom-extensions.component.scss',
})
export class CustomExtensionsComponent {
  readonly customExtensions: AnyExtension[] = [
    // Spaghetto, 
    // Rainbow, 
    // EmojiParser
  ];

  protected comments = signal<Comment[]>([]);

  protected newCommentContent = signal<string>('');
  protected editingCommentId = signal<string | null>(null);
  protected editingContent = signal<string>('');

  /**
   * Adds a comment to the comments signal.
   * @param content The HTML content of the comment.
   */
  protected addComment(content: string): void {
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: 'Utente Corrente',
      timestamp: new Date(),
    };

    this.comments.update((comments) => [newComment, ...comments]);
    this.newCommentContent.set('');
  }

  /**
   * Cancels the new comment creation.
   */
  protected cancelNewComment(): void {
    this.newCommentContent.set('');
  }

  /**
   * Starts editing a comment.
   */
  protected startEditing(comment: Comment): void {
    this.editingCommentId.set(comment.id);
    this.editingContent.set(comment.content);
  }

  /**
   * Saves the edited comment.
   */
  protected saveEdit(commentId: string): void {
    this.comments.update((comments) =>
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, content: this.editingContent() } : comment
      )
    );
    this.cancelEdit();
  }

  /**
   * Cancels editing.
   */
  protected cancelEdit(): void {
    this.editingCommentId.set(null);
    this.editingContent.set('');
  }

  /**
   * Deletes a comment.
   */
  protected deleteComment(commentId: string): void {
    this.comments.update((comments) => comments.filter((comment) => comment.id !== commentId));
  }

  /**
   * Formats a date for display.
   */
  protected formatDate(date: Date): string {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}

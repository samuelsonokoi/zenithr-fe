import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommentGroup } from '../../core/models/scenario.model';

@Component({
  selector: 'app-comments-step',
  templateUrl: './comments-step.html',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsStep {
  commentsGroup = input.required<FormGroup>();

  protected readonly currentCommentSection = signal<CommentGroup>(CommentGroup.INNOVATION);
  protected readonly CommentGroup = CommentGroup;

  protected setCurrentComment(section: CommentGroup) {
    this.currentCommentSection.set(section);
  }
}
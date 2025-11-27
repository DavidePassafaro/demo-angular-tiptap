import { createComponent, ApplicationRef, EnvironmentInjector } from '@angular/core';
import { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { MentionListComponent, MentionItem } from '../components/mention-list/mention-list.component';

// Mock data - in real app, this would come from an API
const MOCK_USERS: MentionItem[] = [
  { id: '1', label: 'Alice Johnson' },
  { id: '2', label: 'Bob Smith' },
  { id: '3', label: 'Charlie Brown' },
  { id: '4', label: 'Diana Prince' },
  { id: '5', label: 'Ethan Hunt' },
  { id: '6', label: 'Fiona Apple' },
  { id: '7', label: 'George Martin' },
  { id: '8', label: 'Hannah Montana' },
];

export function createMentionsSuggestion(injector: EnvironmentInjector, appRef: ApplicationRef) {
  let component: any;
  let popup: TippyInstance[];

  return {
    items: ({ query }: { query: string }) => {
      return MOCK_USERS.filter((user) =>
        user.label.toLowerCase().includes(query.toLowerCase())
      );
    },

    render: () => {
      return {
        onStart: (props: SuggestionProps) => {
          component = createComponent(MentionListComponent, {
            environmentInjector: injector,
          });

          component.instance.items.set(props.items);
          component.instance.command.set(props.command);

          appRef.attachView(component.hostView);
          component.changeDetectorRef.detectChanges();

          if (!props.clientRect) {
            return;
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect as any,
            appendTo: () => document.body,
            content: component.location.nativeElement,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },

        onUpdate(props: SuggestionProps) {
          component.instance.items.set(props.items);
          component.instance.command.set(props.command);
          component.changeDetectorRef.detectChanges();

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect as any,
          });
        },

        onKeyDown(props: SuggestionKeyDownProps) {
          if (props.event.key === 'Escape') {
            popup[0].hide();
            return true;
          }

          return component.instance.onKeyDown(props.event);
        },

        onExit() {
          popup[0].destroy();
          appRef.detachView(component.hostView);
          component.destroy();
        },
      };
    },
  };
}

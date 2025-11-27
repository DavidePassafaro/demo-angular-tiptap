import {
  createComponent,
  EnvironmentInjector,
  ApplicationRef,
  ComponentRef,
  Type,
} from '@angular/core';
import { NodeView, NodeViewProps } from '@tiptap/core';

export interface AngularNodeViewComponent {
  node: any;
  replaceWithNode: (nodeType: string, attrs: Record<string, any>) => void;
}

export function createAngularNodeView(component: Type<any>) {
  return (props: NodeViewProps) => {
    const injector = (props.editor as any).options.injector as EnvironmentInjector;
    const appRef = (props.editor as any).options.appRef as ApplicationRef;

    // Create component immediately
    const componentRef = createComponent(component, {
      environmentInjector: injector,
    });

    // Create replaceWithNode function
    const replaceWithNode = (nodeType: string, attrs: Record<string, any>) => {
      const pos = props.getPos();
      if (typeof pos === 'number') {
        const { state } = props.editor;
        const node = state.schema.nodes[nodeType].create(attrs);
        const tr = state.tr.replaceWith(pos, pos + props.node.nodeSize, node);
        props.editor.view.dispatch(tr);
      }
    };

    // Set node properties
    componentRef.instance.node = props.node;
    componentRef.instance.replaceWithNode = replaceWithNode;

    // Attach to app
    appRef.attachView(componentRef.hostView);
    
    const dom = componentRef.location.nativeElement;
    
    // Trigger initial change detection
    componentRef.changeDetectorRef.detectChanges();

    return {
      dom,

      update(node) {
        if (node.type === props.node.type) {
          componentRef.instance.node = node;
          componentRef.changeDetectorRef.detectChanges();
          return true;
        }
        return false;
      },

      destroy() {
        appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      },
    };
  };
}

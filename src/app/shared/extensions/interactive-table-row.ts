import { Node } from '@tiptap/core'
import TableRow from '@tiptap/extension-table-row'
import { fromEvent, Subscription } from 'rxjs'

type BorderType = 'top' | 'bottom' | 'left' | 'right'
interface RowOrColumnPosition {
  newRowPosition?: number
  newColPosition?: number
}

const EDGE_THRESHOLD = 5 // Define the threshold for the edge detection of the borders

export class InteractiveTableRow {
  private container: HTMLElement
  private editor: any

  private addElement: HTMLDivElement
  private addElementSubscription: Subscription

  private currentRowOrColumnPosition: RowOrColumnPosition

  constructor(container: HTMLElement) {
    this.container = container
  }

  /**
   * Creates a new instance of the TableRow extension Node
   * @returns { Node } - The Tiptap node for the TableRow extension
   */
  build(): Node {
    return TableRow.extend({
      addNodeView: () => {
        return ({ editor }) => {
          this.editor = editor
          
          const tr = document.createElement('tr')

          const innerContainer = document.createElement('tn-editor-tr-container')
          tr.appendChild(innerContainer)

          const placeholder = document.createElement('tn-editor-placeholder')
          tr.appendChild(placeholder)

          const eventSubscription: Subscription = new Subscription()
          const timeoutId = setTimeout(() => {
            const table = tr.closest('table') as HTMLTableElement

            if (table) {
              this.initializeTableRowListeners(table, eventSubscription)
            }
          })

          return {
            dom: tr,
            contentDOM: innerContainer,
            destroy: () => {
              clearTimeout(timeoutId)
              this.destroyAddElement()
              eventSubscription.unsubscribe()
            }
          }
        }
      }
    })
  }

  /**
   * Adds buttons to add rows or columns to a table
   * @param { HTMLTableElement } table - The table element to which the buttons refers to
   * @param { Subscription } eventSubscription - The subscription container for the event listeners
   */
  initializeTableRowListeners(table: HTMLTableElement, eventSubscription: Subscription): void {
    // Shows or hide the add element in the table on mouse move over the table
    const tableMouseMoveSubscription = fromEvent(table, 'mousemove').subscribe(event => {
      if (!this.addElement) {
        this.createAddElement(table)
      }

      this.currentRowOrColumnPosition = this.showAddRowOrColumnButton(event as MouseEvent, table, this.addElement)

      if (!this.currentRowOrColumnPosition) {
        this.destroyAddElement()
      }
    })
    eventSubscription.add(tableMouseMoveSubscription)

    // Prevents the add element from being shown when the user is scrolling the table hotizontally
    const tableScrollSubscription = fromEvent(table.parentElement, 'scroll').subscribe(() => {
      this.destroyAddElement()
    })
    eventSubscription.add(tableScrollSubscription)

    // Hides the add element when the user scrolls the doc vertically
    const documentScrollSubscription = fromEvent(document, 'scroll', { capture: true }).subscribe(() => {
      this.destroyAddElement()
    })
    eventSubscription.add(documentScrollSubscription)
  }

  // Helper functions to create and destroy the button to add a row or column

  /**
   * Creates the add element
   * @param { HTMLTableElement } table - The table element to which the button refers to
   */
  private createAddElement(table: HTMLTableElement): void {
    this.addElementSubscription = new Subscription()

    this.addElement = document.createElement('div') as HTMLDivElement
    this.addElement.className = 'tn-editor add-row-or-column'

    // Hides the add element when the user moves the mouse out of the table and the add element
    const documentMouseMoveSubscription = fromEvent(document, 'mousemove', { capture: true }).subscribe(event => {
      const { clientX, clientY } = event as MouseEvent
      const hovered = document.elementFromPoint(clientX, clientY)

      if (!hovered) {
        return
      }

      if (!table.contains(hovered) && !this.addElement.contains(hovered)) {
        this.destroyAddElement()
      }
    })
    this.addElementSubscription.add(documentMouseMoveSubscription)

    const addButton = document.createElement('button') as HTMLButtonElement
    addButton.className = 'tn-editor add-row-button'
    addButton.innerText = '+'

    // Adds a row or column to the table when the user clicks on the add button
    // Hides the add element when the user clicks on the add button
    const addButtonClickSubscription = fromEvent(addButton, 'click').subscribe(event => {
      event.stopPropagation()

      const { newRowPosition, newColPosition } = this.currentRowOrColumnPosition

      if (newRowPosition !== undefined) {
        this.addRow(table, newRowPosition)
      } else if (newColPosition !== undefined) {
        this.addColumn(table, newColPosition)
      }

      this.destroyAddElement()
    })
    this.addElementSubscription.add(addButtonClickSubscription)

    this.addElement.appendChild(addButton)
    this.container.appendChild(this.addElement)
  }

  /**
   * Destroys the add element
   */
  private destroyAddElement(): void {
    if (this.addElement) {
      this.container.removeChild(this.addElement)
      this.addElement = null
      this.addElementSubscription.unsubscribe()
    }
  }

  /**
   * Shows the button to add a row or column in a table
   * @param { MouseEvent } event - The mouse event that triggered the function
   * @param { HTMLTableElement } table - The table element to which the button refers to
   * @param { HTMLDivElement } addElement - The element to be shown
   * @returns { RowOrColumnPosition | null }
   */
  showAddRowOrColumnButton(
    event: MouseEvent,
    table: HTMLTableElement,
    addElement: HTMLDivElement
  ): RowOrColumnPosition | null {
    const cell = event.target as HTMLTableCellElement

    if (cell.tagName !== 'TD' && cell.tagName !== 'TH') {
      return null
    }

    const rect = cell.getBoundingClientRect()

    // Mouse coordinates relative to the cell
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    let border: BorderType
    if (y < EDGE_THRESHOLD) {
      border = 'top'
    } else if (y > rect.height - EDGE_THRESHOLD) {
      border = 'bottom'
    } else if (x < EDGE_THRESHOLD) {
      border = 'left'
    } else if (x > rect.width - EDGE_THRESHOLD) {
      border = 'right'
    }

    if (!border) {
      return undefined
    }

    const tableRect = table.getBoundingClientRect()
    const editorContainerRect = table.closest('.tiptap.ProseMirror').getBoundingClientRect()
    const tableTop = tableRect.top - editorContainerRect.top
    const tableScrollX = table.parentElement.scrollLeft

    if (border === 'top' || border === 'bottom') {
      const rowIndex = (cell.parentElement.parentElement as HTMLTableRowElement).rowIndex
      const isBottomBorder = border === 'bottom'
      const isTopRow = rowIndex === 0 && border === 'top'

      const offsetY = (isBottomBorder ? rect.height : 0) + (isTopRow ? 0 : -1)
      const top = tableTop + (rect.top - tableRect.top + offsetY)

      addElement.classList.remove('add-row-or-column--column')
      addElement.classList.add('add-row-or-column--row')
      addElement.style.width = `min(${table.parentElement.clientWidth}px, ${table.clientWidth}px)`
      addElement.style.removeProperty('height')
      addElement.style.top = `${top}px`
      addElement.style.left = `0`

      return { newRowPosition: rowIndex + (isBottomBorder ? 1 : 0) }
    } else {
      const colIndex = Array.prototype.indexOf.call(cell.parentNode.childNodes, cell)
      const totalCols = cell.parentElement.children.length
      const isRightBorder = border === 'right'
      const isRightCol = colIndex === totalCols - 1 && isRightBorder

      const offsetX = (isRightBorder ? rect.width : 0) + (isRightCol ? -1 : 0)
      const left = rect.left - tableRect.left + offsetX

      addElement.classList.add('add-row-or-column--column')
      addElement.classList.remove('add-row-or-column--row')
      addElement.style.removeProperty('width')
      addElement.style.height = `${table.clientHeight}px`
      addElement.style.top = `${tableTop}px`
      addElement.style.left = `${left - tableScrollX}px`

      return { newColPosition: colIndex + (isRightBorder ? 1 : 0) }
    }
  }

  // Helper functions to add a row or a column to the table

  /**
   * Adds a new row to the table at the specified position
   * @param { HTMLTableElement } table - The table element to which the row will be added
   * @param { number } rowPosition - The position at which the new row will be added
   */
  private addRow(table: HTMLTableElement, rowPosition: number): void {
    if (!this.editor) return;

    const rows = table.querySelectorAll('tr');
    
    // Determine which row to target and whether to add before or after
    let targetRowIndex: number;
    let addBefore: boolean;
    
    if (rowPosition === 0) {
      // Add before the first row
      targetRowIndex = 0;
      addBefore = true;
    } else if (rowPosition >= rows.length) {
      // Add after the last row
      targetRowIndex = rows.length - 1;
      addBefore = false;
    } else {
      // Add after the previous row (which is rowPosition - 1)
      targetRowIndex = rowPosition - 1;
      addBefore = false;
    }
    
    const targetRow = rows[targetRowIndex];
    if (!targetRow) return;

    const firstCell = targetRow.querySelector('td, th');
    if (!firstCell) return;

    // Find the position of this cell in the ProseMirror document
    const pos = this.editor.view.posAtDOM(firstCell, 0);
    
    // Set cursor position and add row
    this.editor.chain()
      .focus()
      .setTextSelection(pos)
      .command(({ commands }) => {
        if (addBefore) {
          return commands.addRowBefore();
        } else {
          return commands.addRowAfter();
        }
      })
      .run();
  }

  /**
   * Adds a new column to the table at the specified position
   * @param { HTMLTableElement } table - The table element to which the column will be added
   * @param { number } colPosition - The position at which the new column will be added
   */
  private addColumn(table: HTMLTableElement, colPosition: number): void {
    if (!this.editor) return;

    const firstRow = table.querySelector('tr');
    if (!firstRow) return;

    const cells = firstRow.querySelectorAll('td, th');
    
    // Determine which cell to target and whether to add before or after
    let targetCellIndex: number;
    let addBefore: boolean;
    
    if (colPosition === 0) {
      // Add before the first column
      targetCellIndex = 0;
      addBefore = true;
    } else if (colPosition >= cells.length) {
      // Add after the last column
      targetCellIndex = cells.length - 1;
      addBefore = false;
    } else {
      // Add after the previous column (which is colPosition - 1)
      targetCellIndex = colPosition - 1;
      addBefore = false;
    }
    
    const targetCell = cells[targetCellIndex];
    if (!targetCell) return;

    // Find the position of this cell in the ProseMirror document
    const pos = this.editor.view.posAtDOM(targetCell, 0);
    
    // Set cursor position and add column
    this.editor.chain()
      .focus()
      .setTextSelection(pos)
      .command(({ commands }) => {
        if (addBefore) {
          return commands.addColumnBefore();
        } else {
          return commands.addColumnAfter();
        }
      })
      .run();
  }
}

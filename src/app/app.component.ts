import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DndDropEvent } from 'ngx-drag-drop';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

interface DropzoneLayout {
  container: string;
  list: string;
  dndHorizontal: boolean;
}

//test list
// /test simple

@Component({
  selector: 'my-app',
  //selector: 'dnd-list',
  templateUrl: './app.component.html',
})
export class AppComponent {
  @Output() update = new EventEmitter<any>();
  @Input() identifier = 'Limitations';

  userRankingList: any[] = [
    {
      content: 'Option 1',
      identifier: '1',
      _id: '641db69e767a363706b7e4eb',
    },
    {
      content: 'Option 2',
      identifier: '2',
      _id: '641db69o767a363706b7e9eb',
    },
    {
      content: 'Option 3',
      identifier: '3',
      _id: '641db69e797a363706b7e4eb',
    },
    {
      content: 'Option 4',
      identifier: '4',
      _id: '641do69e767a363706b7e4eb',
    },
    {
      content: 'Option 5',
      identifier: '5',
      _id: '641dp69e767a363706g7e4eb',
    },
  ];

  @Input() draggable = {
    effectAllowed: 'move',
    disable: false,
    handle: false,
    data: [] as any[],
  };

  private readonly verticalLayout: DropzoneLayout = {
    container: 'row',
    list: 'column',
    dndHorizontal: false,
  };

  layout: DropzoneLayout = this.verticalLayout;

  private _fromIndex: number | undefined = 0;

  private _hasMovedItem = false;

  private _rankingForm: FormGroup;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.draggable = {
      ...this.draggable,
      data: this.userRankingList,
    };

    const selectOptions = this._formBuilder.array(
      this.generateSelectOptions().map((option) => {
        return this._formBuilder.control(option);
      })
    );

    const optionList = this._formBuilder.array(
      this.userRankingList.map((option) => {
        return this._formBuilder.control(option);
      })
    );

    this._rankingForm = this._formBuilder.group({
      optionList: optionList,
      selectIdx: selectOptions,
    });
  }

  private generateSelectOptions(defaultValue?: number) {
    let isModified = [];

    if (defaultValue) {
      isModified = [];
      for (let i = 1; i <= this.draggable.data.length; i++) {
        isModified.push({
          value: i,
          text: i.toString(),
          selected: i === defaultValue,
        });
      }
    } else {
      isModified = Array.from(
        { length: this.userRankingList?.length },
        (_, i) => i + 1
      );
    }
    console.log('isModified', isModified);

    return isModified;
  }

  public onDragStart(event: DragEvent, item: any) {
    this._fromIndex = this.userRankingList.indexOf(item);
    console.log(event);
    console.log(this._fromIndex);
  }

  /** Handles the drop event when an item is dropped into a new position in the list.
   *
   * @param {Event | DndDropEvent} event - The drop event.
   * @param {number} [fromIndex] - The index of the item being dragged.
   * @returns {Array} - The updated list of items. **/
  public onMove(event: Event | DndDropEvent, fromIndex?: number): Array<any> {
    console.group('ondrop');
    //myfunction
    //let list = this.draggable.data;
    let list = this.userRankingList;
    const indexMax = list?.length - 1;

    let idx = this._getEndIndex(event);
    console.log('[Idx]', idx);

    console.log('event', event);
    console.log('fromIndex event', fromIndex);
    console.log('fromIndex dragevent', this._fromIndex);

    let START_INDEX = 0;

    if (!!this._fromIndex) {
      START_INDEX = this._fromIndex;
    }

    if (!!fromIndex) {
      START_INDEX = fromIndex;
    }

    const END_INDEX = idx;
    const diff = START_INDEX - END_INDEX;

    let canDragAndDrop = this._allowDragAndDrop(START_INDEX, END_INDEX);

    console.log('START_INDEX', START_INDEX);
    console.log('END_INDEX', END_INDEX);

    if (canDragAndDrop) {
      console.log('je suis entrée dans mon isDragAndDrop');
      if (END_INDEX === indexMax || END_INDEX === 0) {
        console.log('EXTREMITY');
        list = this._moveIdxExtremity(START_INDEX, END_INDEX, list);
      } else {
        if (Math.abs(diff) === 1) {
          console.log('CLOSE IDX');
          list = this._moveCloseIdx(START_INDEX, END_INDEX, list);
        } else {
          console.log('TWO IDX');
          list = this._moveTwoIdxSameTime(START_INDEX, END_INDEX, list);
        }
      }

      this.emitUpdate(list);
      this.updateForm(list);
    }

    //end function
    console.groupEnd();
    return list;
  }

  updateForm(list: any[] = []) {
    // console.log('list before', this._rankingForm.get('optionList'));
    this._rankingForm.get('optionList')!.setValue(list); // Mettre à jour la valeur du

    // const selectOptions = this.generateSelectOptions();
    //  this.selectIdx.controls.forEach((control, index) => {
    //   console.log('control, index', control, index);
    //    const optionValue = selectOptions[index];
    //    console.log('optionValue', optionValue);
    //console.log('defaultValue', optionValue.defaultValue);
    //  control.patchValue(optionValue);
    // });

    const defaultValue = list.findIndex((option) => option.defaultValue) + 1;
    const selectOptions = this.generateSelectOptions(defaultValue);

    this.selectIdx.controls.forEach((control, index) => {
      const optionValue = selectOptions[index];
      console.log('defaultValue', control);
      control.patchValue(optionValue);
      console.log('defaultValue', control);
    });
  }

  updateForm2(list: any[] = []) {
    this._rankingForm.get('optionList')!.setValue(list);

    const defaultValue = list.findIndex((option) => option.defaultValue) + 1;
    const selectOptions = this.generateSelectOptions(defaultValue);

    this.selectIdx.controls.forEach((control, index) => {
      control.patchValue(selectOptions[index]);
    });
  }

  private _moveIdxExtremity(
    startIndex: number,
    endIndex: number,
    list: any[] = []
  ) {
    const moveOptionExtremityList = list[startIndex];
    list[startIndex] = list[endIndex];
    list[endIndex] = moveOptionExtremityList;
    return list;
  }

  private _allowDragAndDrop(startIndex: number, endIndex: number): boolean {
    return !(startIndex === -1 || endIndex === -1 || startIndex === endIndex);
  }

  private _moveCloseIdx(
    startIndex: number,
    endIndex: number,
    list: any[] = []
  ) {
    return list.splice(endIndex, 0, list.splice(startIndex, 1)[0]);
  }

  private _moveTwoIdxSameTime(
    startIndex: number,
    endIndex: number,
    list: any[] = []
  ) {
    const shiftIdx = 1;
    const [removed1] = list.splice(startIndex, 1); //shift the indexes of the table
    //Direct the index shift and move the elements together to preserve the order of the array.
    const [removed2] = list.splice(
      endIndex > startIndex ? endIndex - shiftIdx : endIndex,
      1
    );
    list.splice(
      endIndex > startIndex ? endIndex - shiftIdx : endIndex,
      0,
      removed1
    );
    list.splice(startIndex, 0, removed2);

    return list;
  }

  /**
   * Returns the start index for a drag and drop operation based on the given event.
   *
   * @param {Event | DndDropEvent} event The event object.
   * @return {number} The start index. Returns 0 if the start index cannot be determined from the event.
   */
  private _getEndIndex(event: Event | DndDropEvent): number {
    if ('dropEffect' in event && 'index' in event) {
      if (event.dropEffect === 'move' && typeof event?.index === 'number') {
        console.log('drageEvent', event.index - 1);
        return event.index - 1;
      }
    } else if ((event as Event) && 'target' in event) {
      const target = Number((event.target as HTMLInputElement).value);
      console.log('Event', target - 1);
      return isNaN(target - 1) ? 0 : target - 1;
    }
    return 0;
  }

  emitUpdate(list: any[] = []) {
    //let list = this.draggable.data;
    //let list = [...this.optionList.value];
    if (!this.hasMovedItem) {
      list.map(() => -1);
      this.update.emit(list.map(() => null));
      console.log();
    } else {
      this.update.emit(list.map((v: any) => v.identifier));
      console.log();
    }
  }

  get hasMovedItem(): boolean {
    return this._hasMovedItem;
  }

  get rankingForm(): FormGroup {
    return this._rankingForm;
  }

  get optionList(): FormArray {
    //return this._rankingForm.get('optionList');
    return this._rankingForm.get('optionList') as FormArray;
  }

  get selectIdx(): FormArray {
    return this._rankingForm.get('selectIdx') as FormArray;
  }
}

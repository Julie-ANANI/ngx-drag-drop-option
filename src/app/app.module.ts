import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { DndModule } from 'ngx-drag-drop';
import { IndirectDndHandleComponent } from './indirect-dnd-handle/indirect-dnd-handle.component';

@NgModule({
  imports: [BrowserModule, FormsModule, DndModule, ReactiveFormsModule],
  declarations: [AppComponent, IndirectDndHandleComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}

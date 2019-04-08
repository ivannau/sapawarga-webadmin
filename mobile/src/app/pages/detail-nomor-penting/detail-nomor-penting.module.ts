import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DetailNomorPentingPage } from './detail-nomor-penting.page';

const routes: Routes = [
  {
    path: '',
    component: DetailNomorPentingPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DetailNomorPentingPage]
})
export class DetailNomorPentingPageModule {}

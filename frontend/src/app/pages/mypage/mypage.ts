import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-mypage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mypage.html',
  styleUrls: ['./mypage.scss'],
})
export class MyPage {
  auth = inject(AuthService);
}

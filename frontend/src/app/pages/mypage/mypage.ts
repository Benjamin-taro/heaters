import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-mypage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mypage.html',
  styleUrls: ['./mypage.scss'],
})
export class MyPage {
  auth = inject(AuthService);
}

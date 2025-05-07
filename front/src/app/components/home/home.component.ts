import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, DashboardComponent]
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Check authentication state only
    this.isLoggedIn = this.authService.isLoggedIn();
  }
}

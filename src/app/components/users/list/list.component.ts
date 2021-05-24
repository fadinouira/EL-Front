import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/model/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {


  users: User[] = [];
  formateurs: User[] = [];
  etudiants: User[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getUsers();
  }

  private getUsers(){
    this.userService.getAllUsers().subscribe(data => {
      console.log(data.every);
      this.users = data;
    });
  }

}

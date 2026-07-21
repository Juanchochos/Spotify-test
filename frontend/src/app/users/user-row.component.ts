import { Component, Input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicUserCard } from './users-api.service';

@Component({
  selector: 'app-user-row',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="user-row">
      @if (user.avatarUrl) {
        <img class="avatar-round" [src]="user.avatarUrl" width="40" height="40" alt="" />
      } @else {
        <div
          class="avatar-round"
          style="width:40px; height:40px; background:var(--raised); border:1px solid var(--line); display:flex; align-items:center; justify-content:center; font-size:0.85rem; color:var(--mist);"
        >
          {{ user.username.slice(0, 1).toUpperCase() }}
        </div>
      }
      <div style="flex:1; min-width:0;">
        <a class="name" [routerLink]="['/users', user.id]">{{ user.username }}</a>
        @if (user.isFriend) {
          <span class="badge-friend">Friends</span>
        }
      </div>
      @if (showFollowButton) {
        @if (user.isFriend || user.amIFollowing) {
          <button type="button" class="btn btn-ghost" style="padding:0.4rem 0.85rem;" (click)="unfollow.emit(user)">
            {{ user.isFriend ? 'Friends · Unfollow' : 'Following' }}
          </button>
        } @else {
          <button type="button" class="btn btn-primary" style="padding:0.4rem 0.85rem;" (click)="follow.emit(user)">
            Follow
          </button>
        }
      }
    </div>
  `,
})
export class UserRowComponent {
  @Input({ required: true }) user!: PublicUserCard;
  @Input() showFollowButton = true;

  follow = output<PublicUserCard>();
  unfollow = output<PublicUserCard>();
}

import { Component, HostListener, inject, OnDestroy, OnInit, ViewChild, viewChild } from '@angular/core';
import { EditableMember, Member } from '../../../types/member';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../../core/services/member-service';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../../core/services/toast-service';
import { AccountService } from '../../../core/services/account-service';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe, FormsModule, TimeAgoPipe],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css'
})
export class MemberProfile implements OnInit, OnDestroy {
  editFormS? = viewChild<NgForm>('editForm');
  @ViewChild('editForm') editForm?: NgForm;
  @HostListener('window:beforeunload', ['$event']) notify($event: BeforeUnloadEvent) {
    if (this.editForm?.dirty) {
      $event.preventDefault();
    }
  }
  private toast = inject(ToastService);
  protected memberService = inject(MemberService);
  private accountService = inject(AccountService);
  protected editableMember: EditableMember = {
    displayName: '',
    description: '',
    city: '',
    country: ''
  };
  
  constructor() {
  }

  ngOnInit(): void {
    this.editableMember = {
      displayName: this.memberService.member()?.displayName || '',
      description: this.memberService.member()?.description || '',
      city: this.memberService.member()?.city || '',
      country: this.memberService.member()?.country || ''
    };
  }

  ngOnDestroy(): void {
    if (this.memberService.editMode()) this.memberService.editMode.set(false);
  }

  updateProfile() {
    if (!this.memberService.member()) return;

    const updatedMember = {...this.memberService.member(), ...this.editableMember};
    this.memberService.updateMember(updatedMember).subscribe(() => {
      const currentUser = this.accountService.currentUser();
      if (currentUser && updatedMember.displayName !== currentUser?.displayName) {
        currentUser.displayName = updatedMember.displayName;
        this.accountService.setCurrentUser(currentUser);
      }

      this.toast.success('Profile updated successfully');
      this.memberService.editMode.set(false);
      this.memberService.member.set(updatedMember as Member);
      this.editForm?.reset(updatedMember);
    });
  }
}

import { Directive, HostListener, ElementRef, OnDestroy, OnInit, Injectable, Input } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';

@Injectable()
@Directive({
  selector: '[trackChanges]'
})
export class TrackChangesDirective implements OnDestroy, OnInit {

  private checkSubscription: Subscription;
  snapshots: Array<object>
  @Input() appId: string
  @Input() examId: string
  @Input() questionId: string

  constructor(private el: ElementRef, public http: HttpClient) {
    this.snapshots = new Array();
  }

  onChanges(value) {
    console.log(value);
    const currentTime = Date.now();
    const obj = { snap: value, time: currentTime, duration: 0 };
    this.snapshots.push(obj);
  }

  autoSave() {
    console.log('Firing subscriber ');
    console.log(this.snapshots);
    console.log(this.snapshots.length);
    if (this.snapshots.length > 0) {
      this.http.post(`http://localhost:1001/exams/progress/${this.appId}/${this.examId}/${this.questionId}`, this.snapshots).subscribe(
        result => {
          console.log('end...');
          //this.snapshots.length = 0;
          this.snapshots.splice(0, this.snapshots.length)
        },
        error => {
          console.error(error);
        });
    }
  }

  ngOnInit(): void {
    this.checkSubscription = fromEvent(this.el.nativeElement, 'input').pipe(debounceTime(2000)).subscribe(e => this.autoSave())
  }

  ngOnDestroy(): void {
    this.checkSubscription.unsubscribe();
  }

}

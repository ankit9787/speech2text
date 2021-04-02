import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare const annyang: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  closeResult: string = '';
  isUsername: boolean = false;
  showCloud: boolean = false;
  styles: any = {};
  username!: string;
  voiceActiveSectionDisabled: boolean = true;
  voiceActiveSectionError: boolean = false;
  voiceActiveSectionSuccess: boolean = false;
  voiceActiveSectionListening: boolean = false;
  voiceText: any;
  wordCloud: any = {};

  @ViewChild('content') openModal!: ElementRef;

  constructor(private ngZone: NgZone, private modalService: NgbModal) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.open();
  }

  backToRecording(): void {
    this.voiceText = '';
    this.voiceText = undefined;
    this.showCloud = false;
  }

  closeVoiceRecognition(): void {
    this.voiceActiveSectionDisabled = true;
    this.voiceActiveSectionError = false;
    this.voiceActiveSectionSuccess = false;
    this.voiceActiveSectionListening = false;
    this.voiceText = undefined;

    if (annyang) {
      annyang.abort();
    }
  }

  dismissModal() {
    this.modalService.dismissAll();
    this.isUsername = true;
  }

  generateWordCloud(): void {
    let words = this.voiceText.split(' ');
    for (let i = 0; i < words.length; i++) {
      let wordCount = this.wordCloud[words[i]];
      let count = wordCount ? wordCount : 0;
      this.wordCloud[words[i]] = count + 1;
    }
  }

  getColor() {
    let letters = '012Y8DFD8D34567';
    let code = "#";
    for (var i = 0; i < 6; i++) {
      code += letters[Math.floor(Math.random() * 16)];
    }
    this.styles.color =  code;
    return this.styles;
  }

  initializeVoiceRecognitionCallback(): void {
    annyang.addCallback('error', (err: any) => {
      if (err.error === 'network') {
        this.voiceText = 'Internet is require';
        annyang.abort();
        this.ngZone.run(() => (this.voiceActiveSectionSuccess = true));
      } else if (this.voiceText === undefined) {
        this.ngZone.run(() => (this.voiceActiveSectionError = true));
        annyang.abort();
      }
    });

    annyang.addCallback('soundstart', () => {
      this.ngZone.run(() => (this.voiceActiveSectionListening = true));
    });

    annyang.addCallback('end', () => {
      if (this.voiceText === undefined) {
        this.ngZone.run(() => (this.voiceActiveSectionError = true));
        annyang.abort();
      } else {
        this.generateWordCloud();
      }
    });

    annyang.addCallback('result', (userSaid: any) => {
      this.ngZone.run(() => (this.voiceActiveSectionError = false));

      let queryText: any = userSaid[0];

      annyang.abort();

      this.voiceText = queryText;
      this.ngZone.run(() => (this.voiceActiveSectionListening = false));
      this.ngZone.run(() => (this.voiceActiveSectionSuccess = true));
    });
  }

  open() {
    const modalRef = this.modalService.open(this.openModal, {
      keyboard: false,
      backdrop: 'static',
    });
  }

  startVoiceRecognition(): void {
    this.voiceActiveSectionDisabled = false;
    this.voiceActiveSectionError = false;
    this.voiceActiveSectionSuccess = false;
    this.voiceText = undefined;

    if (annyang) {
      let commands = {
        'demo-annyang': () => {},
      };

      annyang.addCommands(commands);

      this.initializeVoiceRecognitionCallback();

      annyang.start({ autoRestart: false });
    }
  }

  showWordCloud(): void {
    this.showCloud = true;
  }
}

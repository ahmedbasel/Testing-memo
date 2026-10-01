import { CloudinaryService } from './../../services/cloudinary';
import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemoService } from '../../services/memo';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { EmailService } from '../../services/email.service';
import { getAuth } from 'firebase/auth';

interface Drum {
  drumNo: string;
  length: string;
  notes: string;
}

interface SelectedImage {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-testing-memo',
  imports: [FormsModule],
  templateUrl: './testing-memo.html',
  styleUrl: './testing-memo.sass',
})
export class TestingMemo {

  @ViewChild('cameraVideo')
  cameraVideo!: ElementRef<HTMLVideoElement>;

  // Shared memo information
  workOrder = '';
  clientName = '';
  cableConstruction = '';
  problemDescription = '';
  // Person in charge
  personInCharge = '';

  // Drums
  drums: Drum[] = [
    this.createEmptyDrum(),
  ];

  // Images
  selectedImages: SelectedImage[] = [];

  // Camera
  cameraStream: MediaStream | null = null;
  cameraOpen = false;

  // Submit state
  submitting = false;
  successMessage = '';

  constructor(
    private cloudinaryService: CloudinaryService,
    private memoService: MemoService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private emailService: EmailService
  ) {}

  // =========================
  // DRUMS
  // =========================

  createEmptyDrum(): Drum {
    return {
      drumNo: '',
      length: '',
      notes: '',

    };
  }

  addDrum() {
    this.drums.push(
      this.createEmptyDrum()
    );
  }

  deleteDrum(index: number) {

    // Always keep at least one drum
    if (this.drums.length === 1) {
      return;
    }

    this.drums.splice(index, 1);
  }


  // =========================
  // IMAGES
  // =========================

  onImagesSelected(event: Event) {

    const input =
      event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    const files =
      Array.from(input.files);

    for (const file of files) {

      if (!file.type.startsWith('image/')) {
        continue;
      }

      const previewUrl =
        URL.createObjectURL(file);

      this.selectedImages.push({
        file,
        previewUrl,
      });
    }

    input.value = '';
  }


  removeImage(index: number) {

    const image =
      this.selectedImages[index];

    URL.revokeObjectURL(
      image.previewUrl
    );

    this.selectedImages.splice(
      index,
      1
    );
  }


  // =========================
  // SUBMIT MEMO
  // =========================

  async submitMemo() {

    if (this.submitting) {
      return;
    }

    if (!this.isMemoValid()) {
      return;
    }

    this.submitting = true;
    this.successMessage = '';

    this.cdr.detectChanges();

    try {

      // Upload images
      const imageUrls: string[] = [];

      for (const image of this.selectedImages) {

        const imageUrl =
          await this.cloudinaryService.uploadImage(
            image.file
          );

        imageUrls.push(imageUrl);
      }


      // Memo data
      const memoData = {

        workOrder:
          this.workOrder.trim(),

        clientName:
          this.clientName.trim(),

        cableConstruction:
          this.cableConstruction.trim(),

        problemDescription:
          this.problemDescription.trim(),
         
        drums: this.drums.map(
  (drum) => ({
    drumNo:
      drum.drumNo.trim(),

    length:
      drum.length.trim(),

    notes:
      drum.notes.trim(),
  })
),
        personInCharge:
          this.personInCharge.trim(),

        images:
          imageUrls,
      };


      // Save memo
      const memoRef =
        await this.memoService.createMemo(
          memoData
        );


      // Current user
      const currentUser =
        getAuth().currentUser;

      if (!currentUser) {
        throw new Error(
          'User is not authenticated'
        );
      }


      // Notify all other users
      await this.notificationService
        .createNotificationForAllUsers(
          'New Testing Memo',
          'You have a new testing memo waiting for your reply',
          'testing-memo',
          memoRef.id,
          currentUser.uid
        );


      this.successMessage =
        'Memo submitted successfully!';

      this.cdr.detectChanges();


      setTimeout(() => {

        this.router.navigate([
          '/dashboard'
        ]);

      }, 1500);


    } catch (error) {

      console.error(
        'Error creating memo:',
        error
      );

      this.submitting = false;

      this.cdr.detectChanges();
    }
  }


  // =========================
  // CAMERA
  // =========================

  async openCamera() {

    try {

      this.cameraStream =
        await navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: {
                ideal: 'environment',
              },
            },
            audio: false,
          });

      this.cameraOpen = true;

      setTimeout(() => {

        if (this.cameraVideo) {

          this.cameraVideo
            .nativeElement
            .srcObject =
            this.cameraStream;
        }

      });

    } catch (error) {

      console.error(
        'Camera error:',
        error
      );

      alert(
        'Unable to access the camera. Please allow camera permission.'
      );
    }
  }


  takePhoto() {

    if (
      !this.cameraVideo ||
      !this.cameraStream
    ) {
      return;
    }

    const video =
      this.cameraVideo.nativeElement;

    const canvas =
      document.createElement('canvas');

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {

        if (!blob) {
          return;
        }

        const file =
          new File(
            [blob],
            `drum-photo-${Date.now()}.jpg`,
            {
              type: 'image/jpeg',
            }
          );

        const previewUrl =
          URL.createObjectURL(file);

        this.selectedImages.push({
          file,
          previewUrl,
        });

        this.closeCamera();

      },
      'image/jpeg',
      0.9
    );
  }


  closeCamera() {

    if (this.cameraStream) {

      this.cameraStream
        .getTracks()
        .forEach(
          (track) =>
            track.stop()
        );

      this.cameraStream = null;
    }

    this.cameraOpen = false;
  }


  // =========================
  // VALIDATION
  // =========================

  isMemoValid(): boolean {

    // Shared information
    if (
      !this.workOrder.trim() ||
      !this.clientName.trim() ||
      !this.cableConstruction.trim() ||
      !this.problemDescription.trim()
    ) {
      return false;
    }


    // Person in charge
    if (
      !this.personInCharge.trim()
    ) {
      return false;
    }


    // At least one drum is required
    if (this.drums.length === 0) {
      return false;
    }


    // Every added drum must be complete
    for (const drum of this.drums) {

      if (
        !drum.drumNo.trim() ||
        !drum.length.trim()
      ) {
        return false;
      }
    }


    return true;
  }
}
import { CommonModule, DatePipe, DecimalPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, EventEmitter, inject, Input, OnDestroy, OnInit, Output, QueryList, signal, TemplateRef, ViewChildren } from '@angular/core';
import { AuthorService } from '../../../../core/services/author.service';
import { Author } from '../../../../shared/models/author';
import { ModalDismissReasons, NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, UnsubscriptionError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { News } from '../../../../shared/models/news';
import { NewsService } from '../../../../core/services/news.service';
import {
  NgbCalendar,
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDatepickerModule,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';



export type SortColumn = keyof News | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = { asc: 'desc', desc: '', '': 'asc' };

const compare = (v1: string | number, v2: string | number) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  standalone: true,
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class NgbdSortableHeader {
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction });
  }
}



@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [DecimalPipe, NgbdSortableHeader, CommonModule, NgbDropdownModule, ReactiveFormsModule, NgbDatepickerModule, FormsModule],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.scss',
  providers: [
    DatePipe
  ]
})
export class NewsListComponent implements OnInit, OnDestroy {


  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  private unSubscribeAll = new Subject()
  private modalService = inject(NgbModal);
  closeResult = '';
  news: any[];
  form: FormGroup
  type: string = ''
  filter = new FormControl('', { nonNullable: true });
  cahcedNews: any[];
  selectedAuthor: string;
  allAuthors: Author[];
  today = inject(NgbCalendar).getToday();
  model: NgbDateStruct;
  chosenDate: string;

  selectedFile: File | null = null;
  previewImg: any;

  isImageError = signal<boolean>(false);

  constructor(private newsServices: NewsService, private fb: FormBuilder,
    private toastr: ToastrService, private authorServices: AuthorService, private datePipe: DatePipe) {
  }

  ngOnInit(): void {

    this.getAllNews();
    this.initializeForm();
    this.filter.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(1200)
    ).subscribe(res => {
      if (res == '') {
        this.news = this.cahcedNews;
      }
      this.news = this.news.filter(element => {
        return element.title.toLowerCase().includes(res);
      })
    });
    this.getAllAuthors();
  }

  getAllNews() {
    this.newsServices.getNews().pipe(
      takeUntil(this.unSubscribeAll)
    ).subscribe((res: any) => {
      this.news = res;
      this.cahcedNews = this.news
    })
  }

  initializeForm(data?: News) {
    this.form = this.fb.group({
      title: [data ? data.title : null, [Validators.required]],
      newss: [data ? data.newss : null, [Validators.required]],
      publicationDate: [data?.publicationDate ? this.datePipe.transform(data?.publicationDate, 'yyyy-MM-dd') : null, [Validators.required]],
      authorId: [data ? data.authorId : null, [Validators.required]],
      fileName: [data ? data.fileName : null, [Validators.required]],
      contentType: [data ? data.contentType : null, [Validators.required]],
      imageData: [data ? data.imageData : null, [Validators.required]],
    })
    data?.imageData ? this.previewImg = `data:${data?.contentType};base64,${data?.imageData}` : this.previewImg = null
  }

  open(content: TemplateRef<any>, type: string, newsInfo: any) {
    this.form.reset();
    this.isImageError.set(false);
    this.previewImg = null;
    this.type = type
    if (type === 'Edit') {
      this.initializeForm(newsInfo);
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        if (result === 'Save click') {
          if (type === 'Edit') {
            this.saveEditedNews(newsInfo);
          } else if (type === 'Add') {
            this.saveNewNews();
          }
        }
      }
    );
  }

  onChangeState() {
    this.type === 'Edit' ? this.isImageError.set(false) : this.isImageError.set(true);
  }

  openDelete(deleteContent: TemplateRef<any>, id: number) {
    this.modalService.open(deleteContent, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        if (result === 'Delete click') {
          this.newsServices.deleteNews(id).pipe(
            takeUntil(this.unSubscribeAll)
          ).subscribe((res: any) => {
            this.toastr.success('News Deleted Sussufully');
            this.getAllNews();
          })

        }
      },
    );
  }

  private saveEditedNews(newsInfo: News): void {
    if (this.form.valid) {
      this.newsServices.editNews(this.form.value, newsInfo.id).pipe(
        takeUntil(this.unSubscribeAll)
      ).subscribe(() => {
        this.toastr.success('News Updated Successfully');
        this.getAllNews();
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  private saveNewNews(): void {
    if (this.form.valid) {
      console.log(this.form.value);

      this.newsServices.addNews(this.form.value).pipe(
        takeUntil(this.unSubscribeAll)
      ).subscribe((res) => {
        this.toastr.success('News Created Successfully');
        this.getAllNews();
      });

    } else {
      console.log(this.form.value);

      this.form.markAllAsTouched();
    }
  }


  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    for (const header of this.headers) {
      if (header.sortable !== column) {
        header.direction = '';
      }
    }

    // sorting countries
    if (direction === '' || column === '') {
      this.news = this.news;
    } else {
      this.news = [...this.news].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }


  getAllAuthors() {
    this.authorServices.getAuthors().pipe(
      takeUntil(this.unSubscribeAll)
    ).subscribe((res: any) => {
      this.allAuthors = res
      console.log(this.allAuthors);

    })
  }

  selectOption(option: string) {
    this.selectedAuthor = option;
    console.log('Selected option:', this.selectedAuthor);
  }


  onFileSelected(event: any): void {
    const reader = new FileReader();
    this.selectedFile = event.target.files[0] as File;
    reader.onload = () => {
      const contentData = reader.result?.toString().split(',')[1];
      this.form.patchValue({
        imageData: contentData,
        fileName: this.selectedFile?.name,
        contentType: this.selectedFile?.type
      });
      this.previewImg = reader.result;
      this.previewImg ? this.isImageError.set(false) : this.isImageError.set(true);
    };
    reader.readAsDataURL(this.selectedFile);
  }

  ngOnDestroy(): void {
    this.unSubscribeAll.next(null);
    this.unSubscribeAll.complete()
  }

}

import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, EventEmitter, inject, Input, OnDestroy, OnInit, Output, QueryList, signal, TemplateRef, ViewChildren } from '@angular/core';
import { AuthorService } from '../../../../core/services/author.service';
import { Author } from '../../../../shared/models/author';
import { ModalDismissReasons, NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, UnsubscriptionError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';


export type SortColumn = keyof Author | '';
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
  selector: 'app-author-list',
  standalone: true,
  imports: [DecimalPipe, NgbdSortableHeader, CommonModule,NgbDropdownModule,ReactiveFormsModule],
  templateUrl: './author-list.component.html',
  styleUrl: './author-list.component.scss'
})
export class AuthorListComponent implements OnInit,OnDestroy {
  
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  private unSubscribeAll = new Subject()
  private modalService = inject(NgbModal);
	closeResult = '';
  authors: any[];
  form:FormGroup
  type:string =''
  filter = new FormControl('', { nonNullable: true });
  cahcedAuthors:any[];

  constructor(private authorServices: AuthorService,private fb:FormBuilder,private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.getAllAuthors()
    this.initializeForm()
    this.filter.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(1200)
    ).subscribe(res=>{
      if(res=='')
      {
        this.authors = this.cahcedAuthors;
      }
       this.authors = this.authors.filter(element=>{
          return element.name.toLowerCase().includes(res);
        })
    })
  }

  initializeForm(data?:any){
    this.form = this.fb.group({
      name: [data ? data.name : null , [Validators.required, Validators.minLength(3),Validators.maxLength(20)]]
    })
  }

  open(content: TemplateRef<any>, type: string, authorInfo:any) {
    this.form.reset()
    this.type = type
    if (type === 'Edit') {
      this.initializeForm(authorInfo);
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        if (result === 'Save click') {
          if (type === 'Edit') {
            this.saveEditedAuthor(authorInfo);
          } else if (type === 'Add') {
            this.saveNewAuthor();
          }
        }
      }
    );
  }

  openDelete(deleteContent: TemplateRef<any>, id:number) {
		this.modalService.open(deleteContent, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
				if(result === 'Delete click')
        {
          this.authorServices.deleteAuthor(id).pipe(
            takeUntil(this.unSubscribeAll)
          ).subscribe( (res:any)=>
          {
            this.toastr.success('Author Deleted Sussufully');
            this.getAllAuthors();
          } )

        }
			},
		);
	}
  
  private saveEditedAuthor(authorInfo: Author): void {
    if (this.form.valid) {
      this.authorServices.editAuthor(this.form.value, authorInfo.id).pipe(
        takeUntil(this.unSubscribeAll)
      ).subscribe(() => {
        this.toastr.success('Author Updated Successfully');
        this.getAllAuthors();
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
  
  private saveNewAuthor(): void {
    if (this.form.valid) {
      this.authorServices.addAuthor(this.form.value).pipe(
        takeUntil(this.unSubscribeAll)
      ).subscribe(() => {
        this.toastr.success('Author Created Successfully');
        this.getAllAuthors();
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
  


  getAllAuthors() {
    this.authorServices.getAuthors().pipe(
      takeUntil(this.unSubscribeAll)
    ).subscribe((res:any)=>{
      this.authors = res;
      this.cahcedAuthors = this.authors
    })
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
      this.authors = this.authors;
    } else {
      this.authors = [...this.authors].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  ngOnDestroy(): void {
    this.unSubscribeAll.next(null);
    this.unSubscribeAll.complete()
  }
}

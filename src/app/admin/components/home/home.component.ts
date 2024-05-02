import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AuthorListComponent } from '../author/author-list/author-list.component';
import { NewsListComponent } from '../news/news-list/news-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ AuthorListComponent,NewsListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  isAuthor = signal<boolean>(true)

  constructor(){

  }
  
  onToggleShow(type:string){
    type === 'Author' ? this.isAuthor.set(true) : this.isAuthor.set(false)
  }


}
